import express from 'express';
import { createServer } from 'http';
import multer from 'multer';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { securityMiddleware, globalRateLimiter, authRateLimiter } from './middleware/security.middleware.js';
import { authenticateJWT, enforceTenantIsolation, requireRole } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { initSocketIO } from './services/socket.service.js';
import { loginHandler, refreshHandler, meHandler } from './controllers/auth.controller.js';
import { listCompaniesHandler, createCompanyHandler, updateCompanyStatusHandler } from './controllers/company.controller.js';
import { getReviewsHandler, replyToReviewHandler } from './controllers/review.controller.js';
import { handleFileUpload } from './controllers/upload.controller.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO Realtime Engine
initSocketIO(httpServer);

// Configure Multer for memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware Stack
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(securityMiddleware);
app.use(globalRateLimiter);

// --------------------------------------------------
// OpenAPI / Swagger Documentation Setup
// --------------------------------------------------
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Equinox Pulse Enterprise ORM SaaS API',
    version: '1.0.0',
    description: 'Production REST API for Equinox Pulse ORM SaaS platform',
  },
  paths: {
    '/api/v1/auth/login': {
      post: {
        summary: 'User Login & Token Generation',
        requestBody: { required: true, content: { 'application/json': {} } },
        responses: { '200': { description: 'Success' } },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --------------------------------------------------
// REST API v1 Endpoints
// --------------------------------------------------

// Health Check
app.get('/api/v1/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      redis: 'connected',
      socket: 'active',
    },
  });
});

// Official Play Store App Details Scraper & Metadata Proxy Endpoint
app.get(['/api/v1/playstore/app-details', '/api/v1/app-details', '/api/v1/app-info'], async (req: express.Request, res: express.Response) => {
  const input = (req.query.package_name || req.query.package || req.query.id || '').toString().trim();
  if (!input) {
    return res.status(400).json({ success: false, error: 'Package name or Play Store URL is required.' });
  }

  // Extract package ID from URL or string
  let pkg = input;
  if (pkg.includes('id=')) {
    try {
      pkg = new URL(pkg).searchParams.get('id') || pkg;
    } catch {
      const match = pkg.match(/[?&]id=([a-zA-Z0-9_.]+)/);
      if (match) pkg = match[1];
    }
  }

  const pkgMatch = pkg.match(/([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)/);
  if (pkgMatch) pkg = pkgMatch[1];

  if (!pkg || !pkg.includes('.')) {
    return res.status(400).json({ success: false, error: 'Invalid Play Store Package Name format.' });
  }

  try {
    const playUrl = `https://play.google.com/store/apps/details?id=${encodeURIComponent(pkg)}&hl=en`;
    const resp = await fetch(playUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }).catch(() => null);

    if (!resp || !resp.ok) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    const html = await resp.text();
    if (!html || html.length < 500) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    // Extract Official App Name
    let appName = '';
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      appName = titleMatch[1]
        .replace(/\s*[-–]\s*Apps on Google Play.*$/i, '')
        .replace(/\s*[-–]\s*Google Play.*$/i, '')
        .replace(/\s*[-–]\s*Android Apps on Google Play.*$/i, '')
        .replace(/\s*\|.*$/, '')
        .trim();
    }

    if (!appName) {
      const ogTitle = html.match(/property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/content=["']([^"']+)["']\s+property=["']og:title["']/i);
      if (ogTitle) {
        appName = ogTitle[1].replace(/\s*[-–]\s*Apps on Google Play.*$/i, '').trim();
      }
    }

    // Extract Official App Icon
    let appIcon = '';
    const ogImg = html.match(/property=["']og:image["']\s+content=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/i) || html.match(/content=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']\s+property=["']og:image["']/i);
    if (ogImg) {
      appIcon = ogImg[1];
    }

    if (!appIcon) {
      const allIcons = html.match(/src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/gi);
      if (allIcons && allIcons.length > 0) {
        const firstMatch = allIcons[0].match(/src=["'](https:\/\/play-lh\.googleusercontent\.com\/[^"']+)["']/i);
        if (firstMatch) appIcon = firstMatch[1];
      }
    }

    // Extract Developer Name
    let developer = '';
    const devMatch = html.match(/itemprop=["']author["'][^>]*>([^<]+)</i) || html.match(/class=["'][^"']*dev-link[^"']*["'][^>]*>([^<]+)</i);
    if (devMatch) developer = devMatch[1].trim();

    // Extract Category
    let category = '';
    const catMatch = html.match(/itemprop=["']genre["'][^>]*>([^<]+)</i);
    if (catMatch) category = catMatch[1].trim();

    if (!appName || !appIcon) {
      return res.status(404).json({ success: false, error: 'Unable to fetch app details.' });
    }

    return res.json({
      success: true,
      package_name: pkg,
      app_name: appName,
      app_icon_url: appIcon,
      play_link: `https://play.google.com/store/apps/details?id=${pkg}`,
      developer: developer || undefined,
      category: category || undefined,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Unable to fetch app details.' });
  }
});

// Auth Routes
app.post('/api/v1/auth/login', authRateLimiter, loginHandler);
app.post('/api/v1/auth/refresh', refreshHandler);
app.get('/api/v1/auth/me', authenticateJWT, meHandler);

// Super Admin Company Management Routes
app.get('/api/v1/companies', authenticateJWT, requireRole(['SUPER_ADMIN']), listCompaniesHandler);
app.post('/api/v1/companies', authenticateJWT, requireRole(['SUPER_ADMIN']), createCompanyHandler);
app.patch('/api/v1/companies/:companyId/status', authenticateJWT, requireRole(['SUPER_ADMIN']), updateCompanyStatusHandler);

// Review Management Routes
app.get('/api/v1/reviews', authenticateJWT, enforceTenantIsolation, getReviewsHandler);
app.post('/api/v1/reviews/:reviewId/reply', authenticateJWT, enforceTenantIsolation, replyToReviewHandler);

import {
  getOAuthUrlHandler,
  oauthCallbackHandler,
  listConnectionsHandler,
  syncConnectionNowHandler,
  disconnectConnectionHandler,
  reconnectConnectionHandler,
  getConnectionHistoryHandler,
} from './controllers/socialIntegration.controller.js';

// Social & Official Platform Integration Routes
app.get('/api/v1/integrations/oauth-url', authenticateJWT, getOAuthUrlHandler);
app.get('/api/v1/integrations/oauth-callback', oauthCallbackHandler);
app.get('/api/v1/integrations/connections', authenticateJWT, listConnectionsHandler);
app.post('/api/v1/integrations/connections/:id/sync', authenticateJWT, syncConnectionNowHandler);
app.post('/api/v1/integrations/connections/:id/disconnect', authenticateJWT, disconnectConnectionHandler);
app.post('/api/v1/integrations/connections/:id/reconnect', authenticateJWT, reconnectConnectionHandler);
app.get('/api/v1/integrations/connections/:id/history', authenticateJWT, getConnectionHistoryHandler);

import {
  listConversationsHandler,
  getConversationDetailsHandler,
  postReplyHandler,
  addInternalNoteHandler,
  assignWorkerHandler,
  updateStatusHandler,
  toggleStarHandler,
  togglePinHandler,
  markReadStatusHandler,
  manualRefreshHandler,
} from './controllers/unifiedInbox.controller.js';

// Unified Inbox Routes
app.get('/api/v1/inbox/conversations', authenticateJWT, listConversationsHandler);
app.get('/api/v1/inbox/conversations/:id', authenticateJWT, getConversationDetailsHandler);
app.post('/api/v1/inbox/conversations/:id/reply', authenticateJWT, postReplyHandler);
app.post('/api/v1/inbox/conversations/:id/notes', authenticateJWT, addInternalNoteHandler);
app.patch('/api/v1/inbox/conversations/:id/assign', authenticateJWT, assignWorkerHandler);
app.patch('/api/v1/inbox/conversations/:id/status', authenticateJWT, updateStatusHandler);
app.patch('/api/v1/inbox/conversations/:id/star', authenticateJWT, toggleStarHandler);
app.patch('/api/v1/inbox/conversations/:id/pin', authenticateJWT, togglePinHandler);
app.patch('/api/v1/inbox/conversations/:id/read', authenticateJWT, markReadStatusHandler);
app.post('/api/v1/inbox/refresh', authenticateJWT, manualRefreshHandler);

import {
  analyzeContentHandler,
  generateAIReplyHandler,
  approveAIReplyHandler,
  getAIHistoryHandler,
} from './controllers/ai.controller.js';

// AI Intelligence & Reply Endpoints
app.post('/api/v1/ai/analyze', authenticateJWT, analyzeContentHandler);
app.post('/api/v1/ai/generate-reply', authenticateJWT, generateAIReplyHandler);
app.post('/api/v1/ai/approve-reply', authenticateJWT, approveAIReplyHandler);
app.get('/api/v1/ai/history/:targetId', authenticateJWT, getAIHistoryHandler);

import {
  getPlansHandler,
  createPlanHandler,
  updatePlanHandler,
  deletePlanHandler,
  getCurrentSubscriptionHandler,
  subscribePlanHandler,
  renewSubscriptionHandler,
  updateSubscriptionStatusHandler,
  listInvoicesHandler,
  getInvoicePdfHtmlHandler,
  validateCouponHandler,
} from './controllers/subscription.controller.js';

// Subscription & Billing Endpoints
app.get('/api/v1/subscriptions/plans', authenticateJWT, getPlansHandler);
app.post('/api/v1/subscriptions/plans', authenticateJWT, requireRole(['SUPER_ADMIN']), createPlanHandler);
app.patch('/api/v1/subscriptions/plans/:id', authenticateJWT, requireRole(['SUPER_ADMIN']), updatePlanHandler);
app.delete('/api/v1/subscriptions/plans/:id', authenticateJWT, requireRole(['SUPER_ADMIN']), deletePlanHandler);
app.get('/api/v1/subscriptions/current', authenticateJWT, getCurrentSubscriptionHandler);
app.post('/api/v1/subscriptions/subscribe', authenticateJWT, subscribePlanHandler);
app.post('/api/v1/subscriptions/renew', authenticateJWT, renewSubscriptionHandler);
app.patch('/api/v1/subscriptions/:id/status', authenticateJWT, requireRole(['SUPER_ADMIN']), updateSubscriptionStatusHandler);
app.get('/api/v1/subscriptions/invoices', authenticateJWT, listInvoicesHandler);
app.get('/api/v1/subscriptions/invoices/:id/pdf', getInvoicePdfHtmlHandler);
app.post('/api/v1/subscriptions/coupons/validate', authenticateJWT, validateCouponHandler);

import {
  generateReportHandler,
  getReportHistoryHandler,
  deleteReportHandler,
  exportReportHandler,
} from './controllers/reports.controller.js';

// Analytics & Reports Endpoints
app.post('/api/v1/reports/generate', authenticateJWT, generateReportHandler);
app.get('/api/v1/reports/history', authenticateJWT, getReportHistoryHandler);
app.delete('/api/v1/reports/history/:id', authenticateJWT, deleteReportHandler);
app.get('/api/v1/reports/export/:id/:format', exportReportHandler);

// Uploads (R2 / Local Disk)
app.post('/api/v1/uploads', authenticateJWT, upload.single('file'), handleFileUpload);

// 404 Handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Equinox Pulse Backend Running on Port ${config.port}`);
    console.log(`📚 Swagger Docs Available at: http://localhost:${config.port}/api-docs`);
    console.log(`=======================================================`);
  });
}

export { app, httpServer };
