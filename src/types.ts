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

export type InboxSourceType =
  | 'all'
  | 'google_reviews'
  | 'facebook_messages'
  | 'instagram_messages'
  | 'comments'
  | 'mentions';

export type ConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export type AIReplyTone = 'Professional' | 'Friendly' | 'Formal' | 'Short' | 'Detailed';

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

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachments?: string[];
  readStatus?: 'DELIVERED' | 'READ';
  sentAt: string;
}

export interface InternalNoteItem {
  id: string;
  conversationId: string;
  authorName: string;
  authorAvatar?: string;
  noteText: string;
  createdAt: string;
}

export interface ConversationHistoryLog {
  id: string;
  conversationId: string;
  action: string;
  details: string;
  actorName: string;
  createdAt: string;
}

export interface ConversationItem {
  id: string;
  companyId: string;
  platform: PlatformId;
  sourceType: InboxSourceType;
  senderName: string;
  senderHandle?: string;
  senderAvatar?: string;
  status: ConversationStatus;
  isUnread: boolean;
  isStarred: boolean;
  isPinned: boolean;
  assignedWorkerId?: string | null;
  lastMessageText?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'CRISIS';
  spamStatus: {
    isSpam: boolean;
    spamScore: number;
    reason: string;
  };
  category:
    | 'Product Quality'
    | 'Customer Service'
    | 'Delivery & Shipping'
    | 'Pricing & Billing'
    | 'App Bug / Technical Issue'
    | 'General Feedback';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  language: string;
  confidenceScore: number;
}

export interface AIReplyLogItem {
  id: string;
  companyId: string;
  targetType: string;
  targetId: string;
  promptUsed: string;
  tone: AIReplyTone;
  generatedReply: string;
  confidenceScore: number;
  version: number;
  status: 'GENERATED' | 'EDITED' | 'APPROVED' | 'REJECTED';
  userEditedReply?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  analysis?: AIAnalysisResult;
}
