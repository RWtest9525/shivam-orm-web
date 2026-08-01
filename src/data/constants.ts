import type {
  PlatformId,
  SentimentType,
  Severity,
  ReviewStatus,
  PlanId,
  ClientStatus,
  PlatformDef,
  SentimentDef,
  ConnectionHealthStatus,
} from '@/types';

export { PlatformId, SentimentType, Severity, ReviewStatus, PlanId, ClientStatus, PlatformDef, SentimentDef };

export const SENTIMENTS: Record<SentimentType, SentimentDef> = {
  positive: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  neutral: { text: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  negative: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  crisis: { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/40', dot: 'bg-rose-400' },
};

export const SENTIMENT_COLORS: Record<SentimentType, string> = {
  positive: '#10b981',
  neutral: '#64748b',
  negative: '#f59e0b',
  crisis: '#f43f5e',
};

export const PLATFORMS: PlatformDef[] = [
  { id: 'google_business', label: 'Google Business Profile', short: 'Google Business', group: 'Listings & Reviews', officialOAuth: true },
  { id: 'facebook', label: 'Facebook Pages', short: 'Facebook', group: 'Social Media', officialOAuth: true },
  { id: 'instagram', label: 'Instagram Business', short: 'Instagram', group: 'Social Media', officialOAuth: true },
  { id: 'linkedin', label: 'LinkedIn Company Pages', short: 'LinkedIn', group: 'Social Media', officialOAuth: true },
  { id: 'x', label: 'X (Twitter)', short: 'X (Twitter)', group: 'Social Media', officialOAuth: true },
  { id: 'youtube', label: 'YouTube Channels', short: 'YouTube', group: 'Video & Community', officialOAuth: true },
  { id: 'playstore', label: 'Play Store / App Store', short: 'Play Store', group: 'App Reviews', officialOAuth: false },
  { id: 'amazon', label: 'Amazon / Flipkart', short: 'Marketplaces', group: 'E-Commerce', officialOAuth: false },
  { id: 'social', label: 'Legacy Social Feed', short: 'Social Feed', group: 'Social Media', officialOAuth: false },
  { id: 'reddit', label: 'Reddit', short: 'Reddit', group: 'Forums', officialOAuth: false },
  { id: 'indiamart', label: 'IndiaMART / JustDial', short: 'IndiaMART', group: 'Listings', officialOAuth: false },
];

export const PLATFORM_MAP: Record<PlatformId, PlatformDef> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlatformId, PlatformDef>,
);

export const HEALTH_STATUS_DEF: Record<ConnectionHealthStatus, { label: string; tone: string; description: string }> = {
  healthy: {
    label: 'Healthy',
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30',
    description: 'OAuth token is valid and connection is fully operational.',
  },
  token_expiring_soon: {
    label: 'Expiring Soon',
    tone: 'text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30',
    description: 'OAuth access token expires within 7 days. Reconnect to renew.',
  },
  token_expired: {
    label: 'Token Expired',
    tone: 'text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30',
    description: 'Token expired. Click Reconnect to authenticate again.',
  },
  permissions_revoked: {
    label: 'Permissions Revoked',
    tone: 'text-rose-800 bg-rose-100 border-rose-400 dark:text-rose-200 dark:bg-rose-900/40 dark:border-rose-500/50',
    description: 'Access revoked on platform. Reconnect required.',
  },
  disconnected: {
    label: 'Disconnected',
    tone: 'text-slate-600 bg-slate-100 border-slate-300 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700',
    description: 'Account manually disconnected.',
  },
};

export const SEVERITY_DEF: Record<Severity, { label: string; tone: string }> = {
  low: { label: 'Low', tone: 'text-slate-300 border-slate-500/30 bg-slate-500/10' },
  medium: { label: 'Medium', tone: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
  high: { label: 'High', tone: 'text-orange-300 border-orange-500/30 bg-orange-500/10' },
  critical: { label: 'Critical', tone: 'text-rose-300 border-rose-500/40 bg-rose-500/10' },
};

export const STATUS_DEF: Record<ReviewStatus, { label: string; tone: string }> = {
  new: { label: 'New', tone: 'text-accent-300 border-accent-500/30 bg-accent-500/10' },
  replied: { label: 'Replied', tone: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
  escalated: { label: 'Escalated', tone: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
  flagged: { label: 'Flagged', tone: 'text-rose-300 border-rose-500/30 bg-rose-500/10' },
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: 'Free',
  trial: 'Trial',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const CLIENT_STATUS_DEF: Record<ClientStatus, { label: string; tone: string }> = {
  active: { label: 'Active', tone: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
  suspended: { label: 'Suspended', tone: 'text-rose-300 border-rose-500/30 bg-rose-500/10' },
  pending: { label: 'Pending', tone: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
};
