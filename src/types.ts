export type PlatformId =
  | 'playstore'
  | 'amazon'
  | 'social'
  | 'linkedin'
  | 'reddit'
  | 'indiamart'
  | 'google_business'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'youtube';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'crisis';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReviewStatus = 'new' | 'replied' | 'escalated' | 'flagged';
export type PlanId = 'trial' | 'starter' | 'pro' | 'enterprise';
export type ClientStatus = 'active' | 'suspended' | 'pending';

export type ConnectionStatus = 'connected' | 'expired' | 'disconnected' | 'error';

export type ConnectionHealthStatus =
  | 'healthy'
  | 'token_expiring_soon'
  | 'token_expired'
  | 'permissions_revoked'
  | 'disconnected';

export interface SentimentDef {
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export interface PlatformDef {
  id: PlatformId;
  label: string;
  short: string;
  group: string;
  officialOAuth?: boolean;
}

export interface SeriesPoint {
  label: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface PlatformConnectionExtended {
  id: string;
  client_id: string;
  platform: PlatformId;
  account_name: string;
  business_name?: string;
  page_name?: string;
  external_account_id?: string;
  status: ConnectionStatus;
  health_status: ConnectionHealthStatus;
  connected_at: string;
  last_synced_at: string | null;
  token_expires_at?: string | null;
  avatar_url?: string;
  error_message?: string;
  api_mode?: 'google_console' | 'reviews_world_scraper';
  app_package_name?: string;
}

export interface ConnectionHistoryItem {
  id: string;
  socialAccountId: string;
  companyId: string;
  event: 'CONNECTED' | 'MANUAL_SYNC' | 'RECONNECTED' | 'DISCONNECTED' | 'TOKEN_REFRESHED' | 'ERROR';
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
  triggeredBy: string;
  createdAt: string;
}
