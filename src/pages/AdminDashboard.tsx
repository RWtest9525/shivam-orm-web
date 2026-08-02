import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAllClients, useReviews } from '@/hooks/useData';
import { dbEngine } from '@/lib/dbEngine';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, MessageSquare, Radar, Zap, AlertTriangle, Clock, Star, Sparkles, Calendar, TrendingUp, Users, Smartphone, KeyRound, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { GOLD, BLUE, CHART_COLORS, PLATFORM_META, DeltaBadge } from '@/lib/equinox/design';

const RANGE_PRESETS = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
];

function KpiCard({
  label, value, hint, icon: Icon, tone = 'gold', delta, onClick
}: {
  label: string; value: string | number; hint: string; icon: any; tone?: 'gold' | 'blue' | 'danger' | 'neutral'; delta?: number; onClick?: () => void;
}) {
  const ring = tone === 'gold' ? 'gold-border gold-glow border-primary/30' : tone === 'blue' ? 'border-secondary/40 blue-glow' : tone === 'danger' ? 'border-rose-500/40' : 'border-slate-200 dark:border-white/10';
  const iconTone = tone === 'gold' ? 'text-primary' : tone === 'blue' ? 'text-secondary' : tone === 'danger' ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-neutral-300';
  
  return (
    <button
      onClick={onClick}
      type="button"
      className={`text-left w-full relative rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 dark:bg-black/40 dark:border-white/10 backdrop-blur ${ring} transition-all hover:-translate-y-0.5 hover:shadow-xl group shadow-sm`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">{label}</div>
          <div className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight text-slate-900 dark:text-white">{value}</div>
        </div>
        <div className={`w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/5 flex items-center justify-center ${iconTone} group-hover:scale-110 transition shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-muted-foreground">{hint}</span>
        <DeltaBadge value={delta} />
      </div>
    </button>
  );
}

function ChartCard({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none ${className}`}>
      <div className="pb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function AdminDashboard() {
  const { client } = useAuth();
  const navigate = useNavigate();
  const { clients } = useAllClients(client?.is_super_admin ?? false);
  const { reviews } = useReviews();
  const [range, setRange] = useState('30d');

  const globalConfig = dbEngine.getGlobalApiKey();
  const isApiConfigured = !!(globalConfig.api_key && globalConfig.api_key.trim() && globalConfig.is_verified);

  const activeClients = clients.filter((c) => !c.is_super_admin);
  const activeClientsCount = activeClients.filter((c) => c.status === 'active').length;
  const totalReviewsCount = reviews.length || 1482;

  const ratingTrendData = [
    { date: 'Jul 01', rating: 4.1 }, { date: 'Jul 06', rating: 4.2 },
    { date: 'Jul 12', rating: 4.0 }, { date: 'Jul 18', rating: 4.5 },
    { date: 'Jul 24', rating: 4.3 }, { date: 'Jul 30', rating: 4.7 },
  ];

  const platformDistData = [
    { platform: 'google_play', count: 620 },
    { platform: 'app_store', count: 410 },
    { platform: 'google_business', count: 280 },
    { platform: 'instagram', count: 110 },
    { platform: 'x', count: 62 },
  ];

  const sentimentTrendData = [
    { date: 'Week 1', positive: 120, neutral: 30, negative: 15 },
    { date: 'Week 2', positive: 145, neutral: 25, negative: 10 },
    { date: 'Week 3', positive: 180, neutral: 40, negative: 8 },
    { date: 'Week 4', positive: 210, neutral: 35, negative: 12 },
  ];

  const monthlyData = [
    { month: 'Mar', reviews: 320, mentions: 450 },
    { month: 'Apr', reviews: 410, mentions: 580 },
    { month: 'May', reviews: 560, mentions: 710 },
    { month: 'Jun', reviews: 690, mentions: 890 },
    { month: 'Jul', reviews: 840, mentions: 1120 },
  ];

  const categoryBreakdownData = [
    { category: 'App Performance', count: 340 },
    { category: 'Customer Support', count: 280 },
    { category: 'UI & Usability', count: 210 },
    { category: 'Billing & Refund', count: 120 },
    { category: 'Feature Request', count: 95 },
  ];

  const reputationScore = 86;

  return (
    <div className="space-y-6">
      {/* Top Header & Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Welcome back, Shivam!
          </h2>
          <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 font-medium">
            Live executive overview of all client apps &amp; online reputation across platforms.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 overflow-x-auto no-scrollbar shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground ml-2 shrink-0" />
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setRange(p.key)}
              className={`text-xs px-3 py-1 rounded-lg transition whitespace-nowrap shrink-0 font-medium ${
                range === p.key
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Super Admin Quick Executive Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-primary/30 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
              {activeClientsCount} Active
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">Total Client Accounts</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{activeClients.length}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-primary/30 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
              Auto-Fetched
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">Ingested Play Store Apps</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{activeClients.filter((c) => c.app_package_name).length}</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-primary/30 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${
              isApiConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              {isApiConfigured ? 'Live & Syncing' : 'Action Needed'}
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">Reviews World API</p>
          <p className={`mt-1 text-lg font-bold ${isApiConfigured ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {isApiConfigured ? 'Master API Active' : 'Unlinked Key'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-primary/30 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
              Agency MRR
            </span>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">Monthly Recurring Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">₹ {(activeClients.length * 49000).toLocaleString('en-IN')} / mo</p>
        </div>
      </div>

      {!isApiConfigured && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <KeyRound className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Reviews World Master API Key Not Configured</p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">Link your master API key in Integrations to auto-sync Play Store &amp; App Store reviews across all clients.</p>
            </div>
          </div>
          <Link
            to="/app/integrations"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 transition"
          >
            Configure Master API →
          </Link>
        </div>
      )}

      {/* Main Reputation Radial Score + KPI Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radial Score Card */}
        <div className="lg:col-span-1 bg-white dark:bg-gradient-to-br dark:from-black dark:to-neutral-950 border border-slate-200 dark:border-primary/20 rounded-2xl p-6 gold-glow overflow-hidden relative flex flex-col justify-between shadow-sm">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="relative">
            <div className="uppercase tracking-widest text-[10px] text-slate-500 dark:text-muted-foreground font-semibold">Reputation Score</div>
            <div className="text-6xl gold-text font-bold mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              {reputationScore}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30">
                {reputationScore >= 80 ? 'Excellent' : 'Strong'}
              </span>
              <span className="text-xs text-slate-500 dark:text-muted-foreground">Industry avg 68</span>
            </div>
          </div>

          <div className="relative my-4 h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: reputationScore, fill: GOLD }]} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(0,0,0,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <div className="relative grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-white/10 pt-3 text-center">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">4.6</div>
              <div className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-semibold">Avg Rating</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">96.8%</div>
              <div className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-semibold">SLA</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">92</div>
              <div className="text-[10px] text-slate-500 dark:text-muted-foreground uppercase font-semibold">AI Health</div>
            </div>
          </div>
        </div>

        {/* 8 Interactive KPI Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Reviews" value={totalReviewsCount} hint="in range" icon={MessageSquare} delta={8.4} onClick={() => navigate('/app/social')} />
          <KpiCard label="Reviews Today" value={42} hint="last 24 hrs" icon={Activity} tone="blue" delta={12.1} onClick={() => navigate('/app/social')} />
          <KpiCard label="Mentions Today" value={128} hint="social + news" icon={Radar} tone="blue" delta={-4.2} onClick={() => navigate('/app/social')} />
          <KpiCard label="Open Cases" value={6} hint="need reply" icon={Zap} delta={-6.0} onClick={() => navigate('/app/social')} />
          <KpiCard label="Crisis Alerts" value={1} hint="P1 active" icon={AlertTriangle} tone="danger" onClick={() => navigate('/app/crisis')} />
          <KpiCard label="Response SLA" value="96.8%" hint="within 4h" icon={Clock} delta={2.3} />
          <KpiCard label="Avg Rating" value="4.6" hint="5 platforms" icon={Star} delta={0.2} />
          <KpiCard label="AI Health" value="92" hint="brand pulse" icon={Sparkles} delta={1.8} onClick={() => navigate('/app/insights')} />
        </div>
      </div>

      {/* Chart Rows 1: Rating Trend & Platform Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Rating Trend" subtitle="Rolling daily average across platforms" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ratingTrendData}>
              <defs>
                <linearGradient id="gradRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12 }} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
              <Area type="monotone" dataKey="rating" stroke={GOLD} strokeWidth={2.5} fill="url(#gradRating)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Share" subtitle="Review distribution by source">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={platformDistData} dataKey="count" nameKey="platform" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {platformDistData.map((d, i) => (
                  <Cell key={i} fill={PLATFORM_META[d.platform]?.hex || CHART_COLORS.gold} className="cursor-pointer" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} formatter={(v: any, n: any, p: any) => [`${v} reviews`, PLATFORM_META[p.payload.platform]?.name || p.payload.platform]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Chart Rows 2: Sentiment Trend & Monthly Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Sentiment Trend" subtitle="Weekly sentiment distribution breakdown" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={sentimentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="positive" stackId="a" fill={CHART_COLORS.pos} />
              <Bar dataKey="neutral" stackId="a" fill={CHART_COLORS.neu} />
              <Bar dataKey="negative" stackId="a" fill={CHART_COLORS.neg} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Growth" subtitle="Reviews vs Social Mentions">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
              <Line type="monotone" dataKey="reviews" stroke={GOLD} strokeWidth={2.5} dot={{ fill: GOLD, r: 4 }} />
              <Line type="monotone" dataKey="mentions" stroke={BLUE} strokeWidth={2.5} dot={{ fill: BLUE, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Issue Categories Chart */}
      <ChartCard title="Top Issue Categories" subtitle="AI-classified review themes &amp; driver analysis">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={categoryBreakdownData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis type="number" stroke="#94a3b8" fontSize={11} />
            <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={130} />
            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
            <Bar dataKey="count" fill={GOLD} radius={[0, 6, 6, 0]} className="cursor-pointer" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
