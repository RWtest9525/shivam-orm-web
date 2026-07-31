import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useReplyTemplates, useConnections } from '@/hooks/useData';
import { computeStats, computePlatformStats, buildSentimentSeries } from '@/lib/analytics';
import { PageHeader } from '@/components/AppLayout';
import { ReviewCard } from '@/components/ReviewCard';
import { KpiCards } from '@/components/KpiCards';
import { SentimentChart } from '@/components/charts/SentimentChart';
import { PLATFORMS, PLATFORM_MAP } from '@/data/constants';
import type { PlatformId } from '@/types';
import { cn } from '@/lib/utils';
import { MessageSquareText, Star, TrendingUp, AlertTriangle, ArrowRight, Smartphone, ShoppingCart, Instagram, Linkedin, MessageCircle, Store, CheckCircle2, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<PlatformId, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

export function ClientDashboard() {
  const { client } = useAuth();
  const { reviews, loading, replyToReview, updateReviewStatus } = useReviews(client?.id);
  const { templates } = useReplyTemplates(client?.id);
  const { connections } = useConnections(client?.id);

  const stats = useMemo(() => computeStats(reviews), [reviews]);
  const platformStats = useMemo(() => computePlatformStats(reviews), [reviews]);
  const series = useMemo(() => buildSentimentSeries(reviews, 7), [reviews]);
  const recentReviews = reviews.slice(0, 6);

  const connectedPlatforms = connections.map((c) => c.platform);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${client?.company_name ?? 'Client'}`}
        subtitle="Your real-time reputation overview across all connected platforms"
      />

      {/* KPIs */}
      <KpiCards stats={stats} />

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentChart data={series} />
        </div>

        {/* Platform cards */}
        <div className="glass rounded-2xl p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-slate-100">Connected Platforms</h3>
          <div className="space-y-2.5">
            {PLATFORMS.map((p) => {
              const Icon = ICONS[p.id];
              const isConnected = connectedPlatforms.includes(p.id);
              const ps = platformStats.find((s) => s.platform === p.id);
              return (
                <Link
                  key={p.id}
                  to={`/app/platform/${p.id}`}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition',
                    isConnected ? 'border-white/10 bg-white/[0.02] hover:border-accent-500/30 hover:bg-white/[0.05]' : 'border-white/[0.04] bg-white/[0.01] opacity-50',
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent-500/20 bg-accent-500/10 text-accent-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-200">{p.label}</p>
                    <p className="text-[11px] text-slate-500">
                      {isConnected ? `${ps?.total ?? 0} reviews · ${ps?.negative ?? 0} negative` : 'Not connected'}
                    </p>
                  </div>
                  {isConnected && (
                    <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:text-accent-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent reviews */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">Recent Reviews & Mentions</h2>
          <Link to="/app/platform/playstore" className="text-xs font-medium text-accent-300 hover:text-accent-200">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading reviews…</div>
        ) : recentReviews.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-400">No reviews yet. Connect a platform in Settings to start receiving reviews.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {recentReviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                templates={templates}
                onReply={replyToReview}
                onStatusChange={updateReviewStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
