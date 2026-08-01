import { useAuth } from '@/hooks/useAuth';
import { useAllClients, useReviews } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { dbEngine } from '@/lib/dbEngine';
import { cn } from '@/lib/utils';
import {
  Users, Building2, TrendingUp, Smartphone, KeyRound, DollarSign,
  ArrowRight, ShieldCheck, Zap, Activity, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { client } = useAuth();
  const { clients } = useAllClients(client?.is_super_admin ?? false);
  const { reviews } = useReviews();

  // Global API Key state check
  const globalConfig = dbEngine.getGlobalApiKey();
  const isApiConfigured = !!(globalConfig.api_key && globalConfig.api_key.trim() && globalConfig.is_verified);

  const activeClients = clients.filter((c) => !c.is_super_admin);
  const activeClientsCount = activeClients.filter((c) => c.status === 'active').length;
  const totalReviewsCount = reviews.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome Shivam !"
        subtitle="Manage all social media and apps at one place."
      />

      {/* Admin Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass animate-float-up rounded-3xl p-6 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Users className="h-6 w-6" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-300">
              {activeClientsCount} Active
            </span>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Client Accounts</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{activeClients.length}</p>
        </div>

        <div className="glass animate-float-up rounded-3xl p-6 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '40ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Smartphone className="h-6 w-6" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300">
              Auto-Fetched
            </span>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ingested Play Store Apps</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{activeClients.filter((c) => c.app_package_name).length}</p>
        </div>

        {/* Reviews World API Status */}
        <div className="glass animate-float-up rounded-3xl p-6 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <TrendingUp className="h-6 w-6" />
            </span>
            <span className={cn('rounded-full px-3 py-1 text-[10px] font-black', isApiConfigured ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300')}>
              {isApiConfigured ? '100% Live' : 'Action Needed'}
            </span>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Reviews World API Status</p>
          <p className={cn('mt-1 text-xl font-black', isApiConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
            {isApiConfigured ? 'Active & Syncing' : 'Not Configured Yet'}
          </p>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="glass animate-float-up rounded-3xl p-6 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <DollarSign className="h-6 w-6" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300">
              Agency Revenue
            </span>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Recurring Revenue</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">₹ {activeClients.length * 49000} / mo</p>
        </div>
      </div>

      {/* API Key Not Configured Alert Banner */}
      {!isApiConfigured && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-black text-amber-900 dark:text-amber-200">Reviews World Master API Key Not Linked</p>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">Validate and link your master API key in Settings so all client apps can fetch live Play Store reviews.</p>
            </div>
          </div>
          <Link
            to="/app/settings"
            className="rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400 shrink-0"
          >
            Configure Master API Key →
          </Link>
        </div>
      )}


    </div>
  );
}
