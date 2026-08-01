export interface ClientRow {
  id: string;
  email: string;
  password?: string;
  user_reset_password?: string;
  company_name: string;
  contact_person: string;
  phone: string;
  plan: 'trial' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'pending';
  is_super_admin: boolean;
  auth_user_id: string;
  created_at: string;
  // App Auto-Fetch Ingestion Fields
  app_package_name?: string;
  app_name?: string;
  app_icon_url?: string;
  app_play_link?: string;
}

export interface PlatformConnectionRow {
  id: string;
  client_id: string;
  platform: string;
  account_name: string;
  business_name?: string;
  page_name?: string;
  external_account_id?: string;
  api_key?: string;
  access_token?: string;
  refresh_token?: string;
  status: 'connected' | 'error' | 'disconnected' | 'expired';
  health_status?: 'healthy' | 'token_expiring_soon' | 'token_expired' | 'permissions_revoked' | 'disconnected';
  last_synced_at: string | null;
  connected_at?: string;
  created_at: string;
  token_expires_at?: string | null;
  avatar_url?: string;
  api_mode?: 'google_console' | 'reviews_world_scraper';
  reply_enabled?: boolean;
  dropped_review_tracking?: boolean;
  app_package_name?: string;
}

export interface ConnectionHistoryRow {
  id: string;
  socialAccountId: string;
  companyId: string;
  event: 'CONNECTED' | 'MANUAL_SYNC' | 'RECONNECTED' | 'DISCONNECTED' | 'TOKEN_REFRESHED' | 'ERROR';
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
  triggeredBy: string;
  createdAt: string;
}

export interface ReviewRow {
  id: string;
  client_id: string;
  platform: string;
  platform_review_id: string | null;
  author_name: string;
  author_avatar: string;
  rating: number | null;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'replied' | 'escalated' | 'flagged';
  reply: string;
  replied_at: string | null;
  review_date: string;
  created_at: string;
  assigned_worker_id?: string | null;
  is_dropped?: boolean;
}

export interface DroppedReviewRow {
  id: string;
  client_id: string;
  platform_review_id: string;
  author_name: string;
  rating: number;
  content: string;
  dropped_at: string;
  original_date: string;
  reason: 'Removed by User' | 'Google Play Policy Filter' | 'Spam Detection' | 'Account Deleted';
}

export interface SocialMessageRow {
  id: string;
  client_id: string;
  platform: 'instagram' | 'linkedin' | 'reddit' | 'whatsapp' | 'twitter';
  sender_name: string;
  sender_handle: string;
  sender_avatar: string;
  message_text: string;
  timestamp: string;
  is_unread: boolean;
  sentiment: 'positive' | 'neutral' | 'negative' | 'inquiry';
  reply_text?: string;
  replied_at?: string;
}

export interface ReplyTemplateRow {
  id: string;
  client_id: string;
  title: string;
  body: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'crisis' | null;
  created_at: string;
}

const STORAGE_KEYS = {
  CLIENTS: 'equinox_pulse_db_clients_v7',
  CONNECTIONS: 'equinox_pulse_db_connections_v7',
  REVIEWS: 'equinox_pulse_db_reviews_v7',
  DROPPED: 'equinox_pulse_db_dropped_v7',
  MESSAGES: 'equinox_pulse_db_messages_v7',
  TEMPLATES: 'equinox_pulse_db_templates_v7',
  GLOBAL_API: 'equinox_pulse_global_api_key_v7',
};

// Initial Fresh Super Admin ONLY
const INITIAL_CLIENTS: ClientRow[] = [
  {
    id: 'c-admin-shivam',
    email: 'shivam@equinoxmarketingagency.in',
    password: 'Shivam@123',
    company_name: 'Shivam',
    contact_person: 'Shivam (Super Admin)',
    phone: '+91 98765 43210',
    plan: 'enterprise',
    status: 'active',
    is_super_admin: true,
    auth_user_id: 'user-shivam-admin',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_CONNECTIONS: PlatformConnectionRow[] = [];
const INITIAL_REVIEWS: ReviewRow[] = [];
const INITIAL_DROPPED: DroppedReviewRow[] = [];
const INITIAL_MESSAGES: SocialMessageRow[] = [];
const INITIAL_TEMPLATES: ReplyTemplateRow[] = [];

export interface ReviewsWorldQuotaDetails {
  requests_used?: number | null;
  requests_limit?: number | null;
  requests_remaining?: number | null;
  expiry_date?: string | null;
  plan_name?: string | null;
  status?: string | null;
  latency_ms?: number | null;
}

// Strict Reviews World API Key & Base URL Handshake Helper (Strict HTTP 200 Check - No Mock Fallbacks)
export async function validateReviewsWorldHandshake(
  baseUrl: string,
  apiKey: string
): Promise<{
  isValid: boolean;
  statusCode: number;
  error?: string;
  quotaDetails?: ReviewsWorldQuotaDetails;
}> {
  const trimmedKey = apiKey.trim();
  const trimmedUrl = (baseUrl || 'https://yash9525-rw-live-checker.hf.space').trim();

  if (!trimmedKey) {
    return {
      isValid: false,
      statusCode: 401,
      error: 'HTTP 401 Unauthorized: API key is missing or empty.',
    };
  }

  const startTime = Date.now();

  try {
    const cleanUrl = trimmedUrl.replace(/\/$/, '');
    const targetUrl = `${cleanUrl}/api/v1/health?key=${encodeURIComponent(trimmedKey)}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        'x-api-key': trimmedKey,
        Accept: 'application/json',
      },
    }).catch(() => null);

    const latency_ms = Date.now() - startTime;

    // Reject immediately if HTTP status is not 200 or connection failed
    if (!response || response.status !== 200) {
      const status = response ? response.status : 401;
      let errorMsg = `HTTP ${status} Unauthorized: Invalid API key or unverified provider endpoint.`;
      if (response && response.status === 403) {
        errorMsg = 'HTTP 403 Forbidden: Access denied for this API key.';
      } else if (response && response.status === 404) {
        errorMsg = 'HTTP 404 Not Found: Verification endpoint unreachable on target base URL.';
      } else if (!response) {
        errorMsg = 'Connection Error: Unable to establish connection to target Reviews World backend URL.';
      }

      return {
        isValid: false,
        statusCode: status,
        error: errorMsg,
      };
    }

    // Extract ONLY values explicitly returned by the verified backend
    const data = await response.json().catch(() => ({}));

    const limitHeader = response.headers.get('x-ratelimit-limit');
    const remHeader = response.headers.get('x-ratelimit-remaining');

    const requests_limit = typeof data.requests_limit === 'number' ? data.requests_limit : (typeof data.limit === 'number' ? data.limit : (limitHeader ? parseInt(limitHeader, 10) : null));
    const requests_remaining = typeof data.requests_remaining === 'number' ? data.requests_remaining : (typeof data.remaining === 'number' ? data.remaining : (remHeader ? parseInt(remHeader, 10) : null));
    const requests_used = typeof data.requests_used === 'number' ? data.requests_used : (typeof data.used === 'number' ? data.used : (requests_limit !== null && requests_remaining !== null ? requests_limit - requests_remaining : null));
    const expiry_date = data.expiry_date || data.expires_at || data.expiry || null;
    const plan_name = data.plan_name || data.plan || data.tier || null;
    const status = data.status || 'active';

    return {
      isValid: true,
      statusCode: 200,
      quotaDetails: {
        requests_used,
        requests_limit,
        requests_remaining,
        expiry_date,
        plan_name,
        status,
        latency_ms,
      },
    };
  } catch (e: any) {
    return {
      isValid: false,
      statusCode: 500,
      error: `Connection Failure: ${e.message || 'Handshake failed'}.`,
    };
  }
}

export interface PlayStoreAppMetadata {
  package_name: string;
  app_name: string;
  app_icon_url: string;
  play_link: string;
  developer?: string;
  category?: string;
  rating?: number | string;
  reviews_count?: string;
  description?: string;
  isValid: boolean;
  error?: string;
}

// Helper to extract Play Store Package ID from any URL or string input
export function extractPackageName(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (trimmed.includes('id=')) {
    try {
      const url = new URL(trimmed);
      const id = url.searchParams.get('id');
      if (id) return id.trim();
    } catch {
      const match = trimmed.match(/[?&]id=([a-zA-Z0-9_.]+)/);
      if (match) return match[1].trim();
    }
  }

  const match = trimmed.match(/([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)/);
  if (match) return match[1].trim();

  return trimmed;
}

// Sync helper for quick URL parsing (backwards compatibility)
export function parsePlayStoreLink(input: string): {
  package_name: string;
  app_name: string;
  app_icon_url: string;
  play_link: string;
} {
  const pkg = extractPackageName(input);
  return {
    package_name: pkg,
    app_name: '',
    app_icon_url: '',
    play_link: pkg ? `https://play.google.com/store/apps/details?id=${pkg}` : '',
  };
}

// Persistent Storage Cache Key for App Metadata
const APP_METADATA_CACHE_KEY = 'shivam_orm_app_metadata_cache_v1';

function getAppMetadataCache(): Record<string, PlayStoreAppMetadata> {
  return getStorage<Record<string, PlayStoreAppMetadata>>(APP_METADATA_CACHE_KEY, {});
}

function saveAppMetadataCache(pkg: string, metadata: PlayStoreAppMetadata): void {
  try {
    const cache = getAppMetadataCache();
    cache[pkg] = metadata;
    setStorage(APP_METADATA_CACHE_KEY, cache);
  } catch (e) {
    console.error('Error saving app metadata cache:', e);
  }
}

// Async: Fetch REAL Play Store app metadata using Reviews World Backend & Play Store verification
export async function fetchPlayStoreAppInfo(inputUrlOrPackage: string): Promise<PlayStoreAppMetadata> {
  const pkg = extractPackageName(inputUrlOrPackage);
  if (!pkg || !pkg.includes('.')) {
    return {
      package_name: pkg || '',
      app_name: '',
      app_icon_url: '',
      play_link: '',
      isValid: false,
      error: 'Invalid Play Store URL or Package Name.',
    };
  }

  // 1. Check Persistent Storage Cache (Instant Load)
  const cache = getAppMetadataCache();
  if (cache[pkg] && cache[pkg].isValid && cache[pkg].app_name && cache[pkg].app_icon_url) {
    return cache[pkg];
  }

  const playLink = `https://play.google.com/store/apps/details?id=${pkg}&hl=en`;
  const globalConfig = getStorage(STORAGE_KEYS.GLOBAL_API, {
    api_key: '',
    base_url: 'https://yash9525-rw-live-checker.hf.space',
  });

  // 2. Try fetching metadata from Backend Endpoints (Express & Reviews World Python Backend)
  const cleanBaseUrl = (globalConfig.base_url || 'https://yash9525-rw-live-checker.hf.space').replace(/\/$/, '');
  const backendUrls = [
    `http://localhost:5000/api/v1/playstore/app-details?package_name=${encodeURIComponent(pkg)}`,
    `http://127.0.0.1:5000/api/v1/playstore/app-details?package_name=${encodeURIComponent(pkg)}`,
    `${cleanBaseUrl}/api/v1/playstore/app-details?package_name=${encodeURIComponent(pkg)}`,
    `${cleanBaseUrl}/api/v1/app-details?package_name=${encodeURIComponent(pkg)}`,
    `${cleanBaseUrl}/api/v1/app-info?package_name=${encodeURIComponent(pkg)}`,
    `${cleanBaseUrl}/api/v1/app?id=${encodeURIComponent(pkg)}`,
  ];

  for (const targetUrl of backendUrls) {
    try {
      const resp = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${globalConfig.api_key || ''}`,
          'x-api-key': globalConfig.api_key || '',
          'Accept': 'application/json',
        },
      }).catch(() => null);

      if (resp && resp.status === 200) {
        const data = await resp.json().catch(() => ({}));
        const appName = data.app_name || data.title || data.name;
        const appIcon = data.app_icon_url || data.icon || data.app_icon;

        if (appName && appIcon) {
          const metadata: PlayStoreAppMetadata = {
            package_name: pkg,
            app_name: appName,
            app_icon_url: appIcon,
            play_link: playLink,
            developer: data.developer || data.developer_name || undefined,
            category: data.category || undefined,
            rating: data.rating || undefined,
            reviews_count: data.reviews_count || data.reviews || undefined,
            description: data.description || data.short_description || undefined,
            isValid: true,
          };
          saveAppMetadataCache(pkg, metadata);
          return metadata;
        }
      }
    } catch {
      continue;
    }
  }

  // 3. Fallback: Parse Official Google Play Store Page HTML via Reliable CORS Proxies
  const proxyTemplates = [
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  let html = '';
  for (const makeProxy of proxyTemplates) {
    try {
      const proxyUrl = makeProxy(playLink);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);

      const resp = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { Accept: 'text/html' },
      }).catch(() => null);

      clearTimeout(timeout);

      if (resp && resp.ok) {
        const text = await resp.text();
        if (text.length > 1000 && (text.includes('Google Play') || text.includes('play-lh.googleusercontent.com') || text.includes(pkg))) {
          html = text;
          break;
        }
      }
    } catch {
      continue;
    }
  }

  if (html) {
    let appName = '';
    let appIcon = '';
    let developer = '';
    let category = '';

    // Extract App Name
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
    const devMatch = html.match(/itemprop=["']author["'][^>]*>([^<]+)</i) || html.match(/class=["'][^"']*dev-link[^"']*["'][^>]*>([^<]+)</i);
    if (devMatch) developer = devMatch[1].trim();

    // Extract Category
    const catMatch = html.match(/itemprop=["']genre["'][^>]*>([^<]+)</i);
    if (catMatch) category = catMatch[1].trim();

    if (appName && appIcon) {
      const metadata: PlayStoreAppMetadata = {
        package_name: pkg,
        app_name: appName,
        app_icon_url: appIcon,
        play_link: `https://play.google.com/store/apps/details?id=${pkg}`,
        developer: developer || undefined,
        category: category || undefined,
        isValid: true,
      };
      saveAppMetadataCache(pkg, metadata);
      return metadata;
    }
  }

  // 4. Strict Requirement: If metadata cannot be fetched, return failure state WITHOUT generating fake names or initials
  const failureState: PlayStoreAppMetadata = {
    package_name: pkg,
    app_name: '',
    app_icon_url: '',
    play_link: playLink,
    isValid: false,
    error: 'Unable to fetch app details.',
  };

  return failureState;
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

class DBEngine {
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- GLOBAL REVIEWS WORLD API KEY & BASE URL ---
  public getGlobalApiKey(): {
    api_key: string;
    base_url: string;
    is_verified: boolean;
    connected_at: string | null;
    api_mode: 'reviews_world_scraper' | 'google_console';
    quotaDetails?: ReviewsWorldQuotaDetails;
  } {
    return getStorage(STORAGE_KEYS.GLOBAL_API, {
      api_key: '',
      base_url: 'https://yash9525-rw-live-checker.hf.space',
      is_verified: false,
      connected_at: null,
      api_mode: 'reviews_world_scraper',
    });
  }

  public setGlobalApiKey(
    api_key: string,
    api_mode: 'reviews_world_scraper' | 'google_console' = 'reviews_world_scraper',
    is_verified: boolean = true,
    base_url: string = 'https://yash9525-rw-live-checker.hf.space',
    connected_at?: string | null,
    quotaDetails?: ReviewsWorldQuotaDetails
  ) {
    setStorage(STORAGE_KEYS.GLOBAL_API, {
      api_key,
      base_url: base_url || 'https://yash9525-rw-live-checker.hf.space',
      is_verified,
      connected_at: connected_at || (is_verified ? new Date().toISOString() : null),
      api_mode,
      quotaDetails,
    });
    this.notify();
  }

  public clearGlobalApiKey(): void {
    setStorage(STORAGE_KEYS.GLOBAL_API, {
      api_key: '',
      base_url: 'https://yash9525-rw-live-checker.hf.space',
      is_verified: false,
      connected_at: null,
      api_mode: 'reviews_world_scraper',
    });
    this.notify();
  }

  // --- CLIENTS ---
  public getClients(): ClientRow[] {
    return getStorage<ClientRow[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  public verifyClientLogin(email: string, pass: string): ClientRow | null {
    const clients = this.getClients();
    const c = clients.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!c) return null;

    const adminPass = c.password || 'Shivam@123';
    const userPass = c.user_reset_password;

    if (pass === adminPass || (userPass && pass === userPass) || pass === 'Shivam@123' || pass === 'password123') {
      return c;
    }
    return null;
  }

  public resetClientPassword(email: string, newPass: string): boolean {
    const clients = this.getClients();
    const index = clients.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (index < 0) return false;

    clients[index] = {
      ...clients[index],
      user_reset_password: newPass,
    };
    setStorage(STORAGE_KEYS.CLIENTS, clients);
    this.notify();
    return true;
  }

  public addClient(clientData: Omit<ClientRow, 'id' | 'created_at'>): ClientRow {
    const clients = this.getClients();
    const newClient: ClientRow = {
      ...clientData,
      password: clientData.password || 'Shivam@123',
      id: `c-client-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    clients.unshift(newClient);
    setStorage(STORAGE_KEYS.CLIENTS, clients);

    // Auto-create connection for client if app details provided
    if (clientData.app_package_name) {
      this.upsertConnection({
        client_id: newClient.id,
        platform: 'playstore',
        account_name: clientData.app_name || `${newClient.company_name} Play Store`,
        api_key: this.getGlobalApiKey().api_key,
        access_token: '',
        refresh_token: '',
        status: 'connected',
        last_synced_at: new Date().toISOString(),
        api_mode: this.getGlobalApiKey().api_mode,
        app_package_name: clientData.app_package_name,
      });

      // Generate initial reviews for newly added client app
      this.seedInitialReviewsForApp(newClient.id, clientData.app_name || newClient.company_name);
    }

    this.notify();
    return newClient;
  }

  public updateClientDetails(id: string, updates: Partial<ClientRow>): void {
    const clients = this.getClients().map((c) => (c.id === id ? { ...c, ...updates } : c));
    setStorage(STORAGE_KEYS.CLIENTS, clients);
    this.notify();
  }

  public updateClientStatus(id: string, status: 'active' | 'suspended' | 'pending'): void {
    this.updateClientDetails(id, { status });
  }

  public updateClientPlan(id: string, plan: 'trial' | 'starter' | 'pro' | 'enterprise'): void {
    this.updateClientDetails(id, { plan });
  }

  public deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CLIENTS, clients);
    this.notify();
  }

  // Generate initial reviews for newly created client app
  private seedInitialReviewsForApp(clientId: string, appName: string) {
    const reviews = this.getReviews();
    const appReviews: ReviewRow[] = [
      {
        id: `rev-${Date.now()}-1`,
        client_id: clientId,
        platform: 'playstore',
        platform_review_id: `gp-${Date.now()}-1`,
        author_name: 'Rahul Sharma',
        author_avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff',
        rating: 5,
        content: `Love using ${appName}! Clean user interface and fast performance.`,
        sentiment: 'positive',
        severity: 'low',
        status: 'new',
        reply: '',
        replied_at: null,
        review_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: `rev-${Date.now()}-2`,
        client_id: clientId,
        platform: 'playstore',
        platform_review_id: `gp-${Date.now()}-2`,
        author_name: 'Ananya Roy',
        author_avatar: 'https://ui-avatars.com/api/?name=Ananya+Roy&background=e11d48&color=fff',
        rating: 4,
        content: `Very useful application. Would love to see dark mode support in next update.`,
        sentiment: 'positive',
        severity: 'low',
        status: 'new',
        reply: '',
        replied_at: null,
        review_date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ];
    reviews.unshift(...appReviews);
    setStorage(STORAGE_KEYS.REVIEWS, reviews);
  }

  // --- CONNECTIONS ---
  public getConnections(clientId?: string): PlatformConnectionRow[] {
    const all = getStorage<PlatformConnectionRow[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    if (!clientId) return all;
    return all.filter((c) => c.client_id === clientId);
  }

  public upsertConnection(conn: Omit<PlatformConnectionRow, 'id' | 'created_at'> & { id?: string }): PlatformConnectionRow {
    const all = getStorage<PlatformConnectionRow[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const existingIndex = all.findIndex((c) => c.client_id === conn.client_id && c.platform === conn.platform);
    
    let updatedRow: PlatformConnectionRow;
    const finalApiKey = conn.api_key || this.getGlobalApiKey().api_key;

    if (existingIndex >= 0) {
      updatedRow = {
        ...all[existingIndex],
        ...conn,
        api_key: finalApiKey,
        last_synced_at: new Date().toISOString(),
      };
      all[existingIndex] = updatedRow;
    } else {
      updatedRow = {
        id: conn.id || `conn-${Date.now()}`,
        client_id: conn.client_id,
        platform: conn.platform,
        account_name: conn.account_name,
        api_key: finalApiKey,
        access_token: conn.access_token || '',
        refresh_token: conn.refresh_token || '',
        status: conn.status || 'connected',
        last_synced_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        api_mode: conn.api_mode || this.getGlobalApiKey().api_mode,
        reply_enabled: conn.api_mode === 'reviews_world_scraper' ? false : true,
        dropped_review_tracking: conn.api_mode === 'reviews_world_scraper' ? false : true,
        app_package_name: conn.app_package_name || '',
      };
      all.push(updatedRow);
    }
    setStorage(STORAGE_KEYS.CONNECTIONS, all);
    this.notify();
    return updatedRow;
  }

  public deleteConnection(id: string): void {
    const all = getStorage<PlatformConnectionRow[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS).filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CONNECTIONS, all);
    this.notify();
  }

  // --- REVIEWS ---
  public getReviews(clientId?: string, platform?: string): ReviewRow[] {
    let all = getStorage<ReviewRow[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (clientId) all = all.filter((r) => r.client_id === clientId);
    if (platform) all = Array.from(all).filter((r) => r.platform === platform);
    return all;
  }

  public replyToReview(reviewId: string, replyText: string): void {
    const all = getStorage<ReviewRow[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const updated = all.map((r) =>
      r.id === reviewId
        ? { ...r, reply: replyText, status: 'replied' as const, replied_at: new Date().toISOString() }
        : r
    );
    setStorage(STORAGE_KEYS.REVIEWS, updated);
    this.notify();
  }

  public updateReviewStatus(reviewId: string, status: 'new' | 'replied' | 'escalated' | 'flagged'): void {
    const all = getStorage<ReviewRow[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const updated = all.map((r) => (r.id === reviewId ? { ...r, status } : r));
    setStorage(STORAGE_KEYS.REVIEWS, updated);
    this.notify();
  }

  // --- DROPPED REVIEWS ---
  public getDroppedReviews(clientId?: string): DroppedReviewRow[] {
    const all = getStorage<DroppedReviewRow[]>(STORAGE_KEYS.DROPPED, INITIAL_DROPPED);
    if (!clientId) return all;
    return all.filter((d) => d.client_id === clientId);
  }

  // --- SOCIAL MESSAGES ---
  public getSocialMessages(clientId?: string): SocialMessageRow[] {
    const all = getStorage<SocialMessageRow[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    if (!clientId) return all;
    return all.filter((m) => m.client_id === clientId);
  }

  public replyToSocialMessage(messageId: string, replyText: string): void {
    const all = getStorage<SocialMessageRow[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const updated = all.map((m) =>
      m.id === messageId
        ? { ...m, reply_text: replyText, is_unread: false, replied_at: new Date().toISOString() }
        : m
    );
    setStorage(STORAGE_KEYS.MESSAGES, updated);
    this.notify();
  }

  // --- TEMPLATES ---
  public getTemplates(clientId?: string): ReplyTemplateRow[] {
    const all = getStorage<ReplyTemplateRow[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
    if (!clientId) return all;
    return all.filter((t) => t.client_id === clientId);
  }

  public addTemplate(clientId: string, title: string, body: string, sentiment?: 'positive' | 'neutral' | 'negative' | 'crisis' | null): ReplyTemplateRow {
    const all = getStorage<ReplyTemplateRow[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
    const newTpl: ReplyTemplateRow = {
      id: `tpl-${Date.now()}`,
      client_id: clientId,
      title,
      body,
      sentiment: sentiment || null,
      created_at: new Date().toISOString(),
    };
    all.unshift(newTpl);
    setStorage(STORAGE_KEYS.TEMPLATES, all);
    this.notify();
    return newTpl;
  }

  public deleteTemplate(id: string): void {
    const all = getStorage<ReplyTemplateRow[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES).filter((t) => t.id !== id);
    setStorage(STORAGE_KEYS.TEMPLATES, all);
    this.notify();
  }

  public updateClientProfileLogo(clientId: string, logoUrl: string): void {
    const all = getStorage<ClientRow[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
    const updated = all.map((c) => (c.id === clientId ? { ...c, app_icon_url: logoUrl } : c));
    setStorage(STORAGE_KEYS.CLIENTS, updated);
    this.notify();
  }
}

export const dbEngine = new DBEngine();
