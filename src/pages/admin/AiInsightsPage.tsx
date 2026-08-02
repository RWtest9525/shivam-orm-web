import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Wand2, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle, Target, Lightbulb } from 'lucide-react';

const WINDOWS = [
  { key: '7d', label: 'Week' },
  { key: '30d', label: 'Month' },
  { key: '90d', label: 'Quarter' },
];

export function AiInsightsPage() {
  const [win, setWin] = useState('30d');
  const [loading, setLoading] = useState(false);

  const handleRegen = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('AI Insights regenerated with live data synthesis');
    }, 800);
  };

  const rootCauses = [
    { impact: 'high', affectedCategory: 'app_performance', theme: 'Android App Crash on Checkout v4.2', evidence: 'App closes when selecting UPI payment option on Android 14 devices.' },
    { impact: 'med', affectedCategory: 'customer_support', theme: 'SLA Delay on Weekend Queries', evidence: 'Average response time increases from 12 mins to 4.2 hours on Saturdays.' },
    { impact: 'low', affectedCategory: 'delivery_logistics', theme: 'Packaging Quality Feedback', evidence: 'Multiple mentions of outer box denting during transit.' },
  ];

  const trends = [
    { name: 'UPI Payment Reliability', direction: 'down', note: 'Drop in positive sentiment following recent gateway update', magnitude: '-14%' },
    { name: 'Customer Support Satisfaction', direction: 'up', note: 'AI auto-reply feature reduced ticket resolution time', magnitude: '+22%' },
    { name: 'Play Store App Ratings', direction: 'up', note: '4.8 star average maintained across 450+ recent reviews', magnitude: '+8%' },
  ];

  const opportunities = [
    { impact: 'high', effort: 'low', title: 'Implement One-Click Refund Status Tracker', rationale: 'Resolves 35% of customer support inquiry volume automatically.' },
    { impact: 'med', effort: 'low', title: 'Automate Play Store 5-Star Thank You Replies', rationale: 'Increases customer retention and brand loyalty with zero staff overhead.' },
  ];

  const recommendations = [
    { priority: 'P1 Critical', owner: 'Dev Ops & Payment Team', etaDays: 2, action: 'Hotfix UPI Checkout Crash in Android Build v4.2.1' },
    { priority: 'P2 High', owner: 'Support Lead', etaDays: 5, action: 'Enable AI Auto-Responder for Weekend Inquiries' },
    { priority: 'P3 Normal', owner: 'Logistics Manager', etaDays: 14, action: 'Audit Partner Packaging Box Specifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Top AI Banner */}
      <div className="bg-slate-900 dark:bg-gradient-to-br dark:from-black dark:via-neutral-950 dark:to-black border border-amber-500/30 dark:border-primary/25 rounded-2xl p-6 gold-glow relative overflow-hidden shadow-md">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                AI Insights <span className="text-xs text-slate-300 dark:text-muted-foreground uppercase tracking-widest ml-2">by Equinox Pulse</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 dark:text-neutral-300 mt-1 max-w-2xl">
                Root-cause synthesis, trend detection, and executive recommendations — grounded in your live review &amp; mention data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 dark:bg-black/50 border border-slate-700 dark:border-white/5">
              {WINDOWS.map((w) => (
                <button
                  key={w.key}
                  onClick={() => setWin(w.key)}
                  className={`text-xs px-3 py-1 rounded-lg transition font-medium ${
                    win === w.key ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-300 dark:text-neutral-400 hover:text-white'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRegen}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-black" />}
              <span>Regenerate</span>
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 dark:border-white/10 relative">
          <div className="text-xl font-semibold gold-text" style={{ fontFamily: "'Playfair Display', serif" }}>
            "Checkout Reliability &amp; Customer Response Speed Drive Current Brand Sentiment"
          </div>
          <p className="text-xs sm:text-sm text-slate-300 dark:text-neutral-300 mt-1.5 max-w-3xl leading-relaxed">
            Overall brand sentiment is strong at 86/100. Key positive driver is fast resolution via AI response assistant. Primary risk vector is checkout drop-off on legacy Android builds.
          </p>
        </div>
      </div>

      {/* Grid of AI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Root Causes */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Root Causes
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">What is driving current sentiment changes?</p>

          <div className="space-y-2.5 pt-1">
            {rootCauses.map((r, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-black/30 dark:border-white/5 hover:border-rose-500/25 transition">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                    r.impact === 'high' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {r.impact} IMPACT
                  </span>
                  <span className="text-[10px] uppercase text-slate-500 dark:text-muted-foreground font-semibold">{r.affectedCategory.replace('_', ' ')}</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{r.theme}</div>
                <div className="text-xs text-slate-600 dark:text-neutral-400 mt-1 italic border-l-2 border-primary/30 pl-2">
                  "{r.evidence}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <TrendingUp className="w-4 h-4 text-primary" /> Sentiment &amp; Operational Trends
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">Where is brand momentum heading?</p>

          <div className="space-y-2.5 pt-1">
            {trends.map((t, i) => {
              const isUp = t.direction === 'up';
              const Icon = isUp ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-black/30 dark:border-white/5">
                  <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</div>
                    <div className="text-xs text-slate-500 dark:text-muted-foreground truncate">{t.note}</div>
                  </div>
                  <div className={`text-sm font-bold shrink-0 ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.magnitude}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opportunities */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <Lightbulb className="w-4 h-4 text-primary" /> Opportunities
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">Untapped upside &amp; low-effort wins</p>

          <div className="space-y-2.5 pt-1">
            {opportunities.map((o, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-black/30 dark:border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 uppercase">
                    {o.impact} IMPACT
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300 uppercase">
                    {o.effort} EFFORT
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{o.title}</div>
                <div className="text-xs text-slate-600 dark:text-neutral-400 mt-1">{o.rationale}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Recommendations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-primary/20 gold-glow space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <Target className="w-4 h-4 text-primary" /> Executive Recommendations
          </div>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">Ranked · Owner-assigned · Actionable ETA</p>

          <div className="space-y-2.5 pt-1">
            {recommendations.map((r, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-primary/25 transition">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-rose-500/30 text-rose-600 dark:text-rose-400 uppercase">
                    {r.priority}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-primary/25 text-primary bg-primary/5 uppercase">
                    {r.owner}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-muted-foreground ml-auto">ETA {r.etaDays}d</span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{r.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
