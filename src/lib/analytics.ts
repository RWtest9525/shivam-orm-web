import type { ReviewRow } from '@/lib/supabase';
import type { SentimentType, PlatformId } from '@/types';

export interface DashboardStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  crisis: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  avgRating: number;
  replied: number;
  new: number;
  escalated: number;
  flagged: number;
  criticalCount: number;
}

export function computeStats(reviews: ReviewRow[]): DashboardStats {
  const total = reviews.length;
  const counts = { positive: 0, neutral: 0, negative: 0, crisis: 0 };
  let ratingSum = 0;
  let ratingCount = 0;
  let replied = 0, newCount = 0, escalated = 0, flagged = 0, criticalCount = 0;

  for (const r of reviews) {
    counts[r.sentiment as SentimentType]++;
    if (r.rating != null) { ratingSum += r.rating; ratingCount++; }
    if (r.status === 'replied') replied++;
    else if (r.status === 'new') newCount++;
    else if (r.status === 'escalated') escalated++;
    else if (r.status === 'flagged') flagged++;
    if (r.severity === 'critical') criticalCount++;
  }

  return {
    total,
    positive: counts.positive,
    neutral: counts.neutral,
    negative: counts.negative,
    crisis: counts.crisis,
    positivePct: total ? Math.round((counts.positive / total) * 100) : 0,
    neutralPct: total ? Math.round((counts.neutral / total) * 100) : 0,
    negativePct: total ? Math.round(((counts.negative + counts.crisis) / total) * 100) : 0,
    avgRating: ratingCount ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    replied,
    new: newCount,
    escalated,
    flagged,
    criticalCount,
  };
}

export interface PlatformStat {
  platform: PlatformId;
  total: number;
  positive: number;
  negative: number;
  critical: number;
}

export function computePlatformStats(reviews: ReviewRow[]): PlatformStat[] {
  const map = new Map<string, PlatformStat>();
  for (const r of reviews) {
    const p = r.platform as PlatformId;
    const stat = map.get(p) ?? { platform: p, total: 0, positive: 0, negative: 0, critical: 0 };
    stat.total++;
    if (r.sentiment === 'positive') stat.positive++;
    if (r.sentiment === 'negative' || r.sentiment === 'crisis') stat.negative++;
    if (r.severity === 'critical') stat.critical++;
    map.set(p, stat);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export function buildSentimentSeries(reviews: ReviewRow[], days: number = 7): { label: string; positive: number; neutral: number; negative: number }[] {
  const out: { label: string; positive: number; neutral: number; negative: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayReviews = reviews.filter((r) => {
      const rd = new Date(r.review_date);
      return rd >= d && rd < next;
    });
    out.push({
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      positive: dayReviews.filter((r) => r.sentiment === 'positive').length,
      neutral: dayReviews.filter((r) => r.sentiment === 'neutral').length,
      negative: dayReviews.filter((r) => r.sentiment === 'negative' || r.sentiment === 'crisis').length,
    });
  }
  return out;
}
