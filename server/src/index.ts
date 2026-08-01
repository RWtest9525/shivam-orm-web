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
