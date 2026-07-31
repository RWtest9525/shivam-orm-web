import type { DashboardStats } from '@/lib/analytics';
import { SENTIMENT_COLORS } from '@/data/constants';
import { Tooltip } from '@/components/ui/Tooltip';
import { TrendingUp, MessageSquareText, Smile, Star, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface Props {
  stats: DashboardStats;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(1, max - min);
  const w = 80;
  const h = 26;
  const pts = data.map((v, i) => `${(i / Math.max(1, data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-90">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function KpiCards({ stats }: Props) {
  const sentimentSplit = `${stats.positivePct}% / ${stats.neutralPct}% / ${stats.negativePct}%`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Reviews */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent-500/20 bg-accent-500/10 text-accent-300">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
            <TrendingUp className="h-3 w-3" /> Live
          </span>
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Total Reviews & Mentions</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-2xl font-bold text-white">{formatNumber(stats.total)}</p>
          <Sparkline data={[stats.positive, stats.neutral, stats.negative, stats.positive + 2, stats.positive]} color={SENTIMENT_COLORS.positive} />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">Across all connected platforms</p>
      </div>

      {/* Sentiment Score */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card" style={{ animationDelay: '40ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <Smile className="h-4 w-4" />
          </span>
          <Tooltip content={sentimentSplit}>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              {stats.positivePct}% Positive
            </span>
          </Tooltip>
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Sentiment Score</p>
        <p className="mt-1 text-2xl font-bold text-white">{stats.positivePct}%</p>
        <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div className="bg-emerald-400" style={{ width: `${stats.positivePct}%` }} />
          <div className="bg-slate-400" style={{ width: `${stats.neutralPct}%` }} />
          <div className="bg-amber-400" style={{ width: `${stats.negativePct}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">Pos / Neutral / Neg split</p>
      </div>

      {/* Avg Rating */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card" style={{ animationDelay: '80ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300">
            <Star className="h-4 w-4 fill-amber-300" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
            <TrendingUp className="h-3 w-3" /> +0.2
          </span>
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Average Rating</p>
        <div className="mt-1 flex items-end gap-1.5">
          <p className="text-2xl font-bold text-white">{stats.avgRating.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn('h-3 w-3', i <= Math.round(stats.avgRating) ? 'fill-amber-300 text-amber-300' : 'text-slate-600')} />
            ))}
          </div>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">From rated reviews</p>
      </div>

      {/* Needs Attention */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card ring-1 ring-rose-500/20" style={{ animationDelay: '120ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 animate-pulse-glow-rose">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-300">
            Critical
          </span>
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">Needs Attention</p>
        <p className="mt-1 text-2xl font-bold text-rose-200">{stats.new + stats.criticalCount}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-accent-400" /> {stats.new} new</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-rose-400" /> {stats.criticalCount} critical</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> {stats.replied} replied</span>
        </div>
      </div>
    </div>
  );
}
