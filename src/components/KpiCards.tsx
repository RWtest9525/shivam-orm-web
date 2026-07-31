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
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function KpiCards({ stats }: Props) {
  const sentimentSplit = `${stats.positivePct}% / ${stats.neutralPct}% / ${stats.negativePct}%`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Total Reviews */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
            <MessageSquareText className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="h-3 w-3" /> Live
          </span>
        </div>
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total Reviews & Mentions</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{formatNumber(stats.total)}</p>
          <Sparkline data={[stats.positive, stats.neutral, stats.negative, stats.positive + 2, stats.positive]} color={SENTIMENT_COLORS.positive} />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">Across all connected platforms</p>
      </div>

      {/* Sentiment Score */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '40ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <Smile className="h-4 w-4" />
          </span>
          <Tooltip content={sentimentSplit}>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
              {stats.positivePct}% Positive
            </span>
          </Tooltip>
        </div>
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Sentiment Score</p>
        <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.positivePct}%</p>
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="bg-emerald-500" style={{ width: `${stats.positivePct}%` }} />
          <div className="bg-cyan-500" style={{ width: `${stats.neutralPct}%` }} />
          <div className="bg-rose-500" style={{ width: `${stats.negativePct}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pos / Neutral / Neg split</p>
      </div>

      {/* Avg Rating */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '80ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="h-3 w-3" /> +0.2
          </span>
        </div>
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">Average Rating</p>
        <div className="mt-1 flex items-end gap-1.5">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 pb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn('h-3 w-3', i <= Math.round(stats.avgRating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
            ))}
          </div>
        </div>
        <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">From rated reviews</p>
      </div>

      {/* Needs Attention */}
      <div className="glass animate-float-up rounded-2xl p-4 shadow-card border border-rose-200 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/10" style={{ animationDelay: '120ms' }}>
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase text-rose-800 dark:text-rose-300">
            Critical
          </span>
        </div>
        <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400">Needs Attention</p>
        <p className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-200">{stats.new + stats.criticalCount}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-accent-600 dark:text-accent-400" /> {stats.new} new</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400" /> {stats.criticalCount} critical</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {stats.replied} replied</span>
        </div>
      </div>
    </div>
  );
}
