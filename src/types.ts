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

export interface PlatformDef {
  id: PlatformId;
  label: string;
  short: string;
  group: string;
}

export interface SeriesPoint {
  label: string;
  positive: number;
  neutral: number;
  negative: number;
}
