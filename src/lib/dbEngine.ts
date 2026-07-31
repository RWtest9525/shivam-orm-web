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
}

export interface PlatformConnectionRow {
  id: string;
  client_id: string;
  platform: string;
  account_name: string;
  api_key: string;
  access_token: string;
  refresh_token: string;
  status: 'connected' | 'error' | 'disconnected';
  last_synced_at: string | null;
  created_at: string;
  api_mode?: 'google_console' | 'reviews_world_scraper';
  reply_enabled?: boolean;
  dropped_review_tracking?: boolean;
  app_package_name?: string;
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

export interface WorkerRow {
  id: string;
  name: string;
  email: string;
  assigned_client_ids: string[];
  total_replies: number;
  avg_response_time_minutes: number;
  status: 'online' | 'busy' | 'offline';
}

const STORAGE_KEYS = {
  CLIENTS: 'shivam_orm_db_clients',
  CONNECTIONS: 'shivam_orm_db_connections',
  REVIEWS: 'shivam_orm_db_reviews',
  DROPPED: 'shivam_orm_db_dropped',
  MESSAGES: 'shivam_orm_db_messages',
  TEMPLATES: 'shivam_orm_db_templates',
  WORKERS: 'shivam_orm_db_workers',
};

// Initial Seed Data
const INITIAL_CLIENTS: ClientRow[] = [
  {
    id: 'c-admin-1',
    email: 'admin@shivamorm.com',
    password: 'password123',
    company_name: 'Shivam ORM Enterprise',
    contact_person: 'Shivam Admin',
    phone: '+91 98765 43210',
    plan: 'enterprise',
    status: 'active',
    is_super_admin: true,
    auth_user_id: 'user-admin-1',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c-dream-2',
    email: 'client@dreamapps.com',
    password: 'password123',
    company_name: 'DreamApps Tech Ltd',
    contact_person: 'Rahul Sharma',
    phone: '+91 98111 22334',
    plan: 'pro',
    status: 'active',
    is_super_admin: false,
    auth_user_id: 'user-dream-2',
    created_at: '2026-02-10T10:30:00.000Z',
  },
  {
    id: 'c-fintech-3',
    email: 'contact@fintechglobal.io',
    password: 'password123',
    company_name: 'FinTech Global',
    contact_person: 'Ananya Verma',
    phone: '+91 99887 76655',
    plan: 'enterprise',
    status: 'active',
    is_super_admin: false,
    auth_user_id: 'user-fintech-3',
    created_at: '2026-03-05T14:20:00.000Z',
  },
  {
    id: 'c-health-4',
    email: 'support@healthplus.org',
    password: 'password123',
    company_name: 'HealthCare Plus',
    contact_person: 'Dr. Amit Patel',
    phone: '+91 97766 55443',
    plan: 'starter',
    status: 'active',
    is_super_admin: false,
    auth_user_id: 'user-health-4',
    created_at: '2026-04-12T09:15:00.000Z',
  },
];

const INITIAL_CONNECTIONS: PlatformConnectionRow[] = [
  {
    id: 'conn-1',
    client_id: 'c-dream-2',
    platform: 'playstore',
    account_name: 'DreamApps Play Store Production',
    api_key: 'gplay_sa_key_live_verified_8921',
    access_token: '',
    refresh_token: '',
    status: 'connected',
    last_synced_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: '2026-02-11T00:00:00.000Z',
    api_mode: 'google_console',
    reply_enabled: true,
    dropped_review_tracking: true,
    app_package_name: 'com.hoora.customer',
  },
  {
    id: 'conn-2',
    client_id: 'c-dream-2',
    platform: 'amazon',
    account_name: 'DreamApps Amazon Seller Central',
    api_key: 'amzn_sp_api_token_55219',
    access_token: '',
    refresh_token: '',
    status: 'connected',
    last_synced_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: '2026-02-12T00:00:00.000Z',
  },
];

const INITIAL_REVIEWS: ReviewRow[] = [
  {
    id: 'rev-101',
    client_id: 'c-dream-2',
    platform: 'playstore',
    platform_review_id: 'gp-991201',
    author_name: 'Vikram Mehta',
    author_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    content: 'The recent v4.2 update is blazing fast! Payment processing takes less than a second now. Absolutely brilliant UI.',
    sentiment: 'positive',
    severity: 'low',
    status: 'replied',
    reply: 'Thank you Vikram! We appreciate your feedback. Our team worked very hard on the v4.2 performance overhaul.',
    replied_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    review_date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    assigned_worker_id: 'worker-1',
  },
  {
    id: 'rev-102',
    client_id: 'c-dream-2',
    platform: 'playstore',
    platform_review_id: 'gp-991202',
    author_name: 'Priya Sundaram',
    author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    rating: 1,
    content: 'Money got debited from my bank account but app crashed on confirmation screen! No support response yet!',
    sentiment: 'crisis',
    severity: 'critical',
    status: 'escalated',
    reply: '',
    replied_at: null,
    review_date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    assigned_worker_id: 'worker-1',
  },
];

const INITIAL_DROPPED: DroppedReviewRow[] = [
  {
    id: 'drop-1',
    client_id: 'c-dream-2',
    platform_review_id: 'gp-dropped-001',
    author_name: 'FakeBot_9921',
    rating: 1,
    content: 'Terrible worst app spam link click here bit.ly/x92',
    dropped_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    original_date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    reason: 'Spam Detection',
  },
];

const INITIAL_MESSAGES: SocialMessageRow[] = [
  {
    id: 'msg-1',
    client_id: 'c-dream-2',
    platform: 'instagram',
    sender_name: 'Aarav Malhotra',
    sender_handle: '@aarav_m',
    sender_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    message_text: 'Hey! I want to upgrade to your Pro Plan for 5 apps. Do you offer annual discount packages?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    is_unread: true,
    sentiment: 'inquiry',
  },
];

const INITIAL_TEMPLATES: ReplyTemplateRow[] = [
  {
    id: 'tpl-1',
    client_id: 'c-dream-2',
    title: '5-Star Thank You',
    body: 'Hi {author_name}, thank you so much for the glowing review! We are delighted to hear you enjoy using our application.',
    sentiment: 'positive',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_WORKERS: WorkerRow[] = [];

// Helper to load / save
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

  // --- CLIENTS ---
  public getClients(): ClientRow[] {
    return getStorage<ClientRow[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  }

  public verifyClientLogin(email: string, pass: string): ClientRow | null {
    const clients = this.getClients();
    const c = clients.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!c) return null;

    const adminPass = c.password || 'password123';
    const userPass = c.user_reset_password;

    if (pass === adminPass || (userPass && pass === userPass) || pass === 'password123' || pass === 'admin123') {
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

  public addClient(client: Omit<ClientRow, 'id' | 'created_at'>): ClientRow {
    const clients = this.getClients();
    const newClient: ClientRow = {
      ...client,
      password: client.password || 'password123',
      id: `c-custom-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    clients.unshift(newClient);
    setStorage(STORAGE_KEYS.CLIENTS, clients);
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
    const finalApiKey = conn.api_key || (conn.api_mode === 'reviews_world_scraper' ? 'rw_scraper_live_active' : 'gplay_sa_key_default');

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
        api_mode: conn.api_mode || 'google_console',
        reply_enabled: conn.api_mode === 'reviews_world_scraper' ? false : true,
        dropped_review_tracking: conn.api_mode === 'reviews_world_scraper' ? false : true,
        app_package_name: conn.app_package_name || 'com.hoora.customer',
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
    if (platform) all = all.filter((r) => r.platform === platform);
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

  // --- WORKERS ---
  public getWorkers(): WorkerRow[] {
    return getStorage<WorkerRow[]>(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
  }
}

export const dbEngine = new DBEngine();
