import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useConnections } from '@/hooks/useData';
import { computeStats, computePlatformStats, buildSentimentSeries } from '@/lib/analytics';
import { PageHeader } from '@/components/AppLayout';
import { KpiCards } from '@/components/KpiCards';
import { SentimentChart } from '@/components/charts/SentimentChart';
import { PLATFORMS } from '@/data/constants';
import { cn } from '@/lib/utils';
import {
  Smartphone, ShoppingCart, Instagram, Linkedin,
  MessageCircle, Store, ArrowRight, Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

export function ClientDashboard() {
  const { client } = useAuth();
  const { reviews } = useReviews(client?.id);
  const { connections } = useConnections(client?.id);

  const stats = useMemo(() => computeStats(reviews), [reviews]);
  const platformStats = useMemo(() => computePlatformStats(reviews), [reviews]);
  const series = useMemo(() => buildSentimentSeries(reviews, 7), [reviews]);

  const connectedPlatforms = connections.map((c) => c.platform);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${client?.company_name ?? 'Client'}`}
        subtitle="Your real-time executive reputation overview across all connected platforms"
      />

      {/* Executive KPIs */}
      <KpiCards stats={stats} />

      {/* Main Charts & Connected Platforms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SentimentChart data={series} />
        </div>

        {/* Connected Platforms Quick Launch */}
        <div className="glass rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
          <h3 className="mb-4 text-sm font-black text-slate-900 dark:text-slate-100">Monitored Platform Channels</h3>
          <div className="space-y-2.5">
            {PLATFORMS.map((p) => {
              const Icon = ICONS[p.id] || Globe;
              const isConnected = connectedPlatforms.includes(p.id);
              const ps = platformStats.find((s) => s.platform === p.id);
              return (
                <Link
                  key={p.id}
                  to={`/app/platform/${p.id}`}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border p-3 transition-all',
                    isConnected
                      ? 'border-slate-200 bg-white hover:border-accent-500 hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-accent-400'
                      : 'border-slate-200/50 bg-slate-100/50 opacity-60 dark:border-white/[0.04] dark:bg-white/[0.01]'
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-200">{p.label}</p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {isConnected ? `${ps?.total ?? 0} reviews · ${ps?.negative ?? 0} negative` : 'Not connected'}
                    </p>
                  </div>
                  {isConnected && (
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-accent-500 dark:group-hover:text-accent-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
