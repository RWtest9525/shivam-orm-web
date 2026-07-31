export type PlatformId =
  | 'playstore' | 'amazon' | 'social' | 'linkedin' | 'reddit' | 'indiamart';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'crisis';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReviewStatus = 'new' | 'replied' | 'escalated' | 'flagged';
export type PlanId = 'trial' | 'starter' | 'pro' | 'enterprise';
export type ClientStatus = 'active' | 'suspended' | 'pending';

export interface SentimentDef {
  text: string;
  bg: string;
  border: string;
  dot: string;
}

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

export interface PlatformDef {
  id: PlatformId;
  label: string;
  short: string;
  group: string;
}

export const PLATFORMS: PlatformDef[] = [
  { id: 'playstore', label: 'Play Store / App Store', short: 'Play Store', group: 'App Reviews' },
  { id: 'amazon', label: 'Amazon / Flipkart', short: 'Marketplaces', group: 'E-Commerce' },
  { id: 'social', label: 'Instagram / Facebook', short: 'Instagram', group: 'Social Media' },
  { id: 'linkedin', label: 'LinkedIn', short: 'LinkedIn', group: 'Social Media' },
  { id: 'reddit', label: 'Reddit', short: 'Reddit', group: 'Forums' },
  { id: 'indiamart', label: 'IndiaMART / JustDial', short: 'IndiaMART', group: 'Listings' },
];

export const PLATFORM_MAP: Record<PlatformId, PlatformDef> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlatformId, PlatformDef>,
);

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
