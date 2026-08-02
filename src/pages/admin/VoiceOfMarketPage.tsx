import { useState } from 'react';
import { Mic, MessageSquare, Sparkles, Filter, ChevronRight } from 'lucide-react';

export function VoiceOfMarketPage() {
  const [filter, setFilter] = useState('all');

  const topics = [
    { title: 'UPI Checkout Speed & Reliability', volume: 420, sentiment: 88, category: 'Payments' },
    { title: 'Android App Crash on Payment Gateway', volume: 180, sentiment: 22, category: 'Technical' },
    { title: 'Customer Support Response SLA', volume: 310, sentiment: 76, category: 'Service' },
    { title: 'Packaging Box Quality & Logistics', volume: 140, sentiment: 45, category: 'Delivery' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Voice of Market &amp; Customer Sentiment Clusters
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              AI-clustered feedback themes extracted from customer reviews, app stores, and social conversations.
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-4 hover:border-primary/30 transition shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary uppercase">
                  {t.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{t.title}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-muted-foreground">{t.volume} mentions</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-muted-foreground">Positive Sentiment Ratio</span>
                <span className={`font-bold ${t.sentiment >= 70 ? 'text-emerald-600 dark:text-emerald-400' : t.sentiment >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.sentiment}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${t.sentiment >= 70 ? 'bg-emerald-500' : t.sentiment >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${t.sentiment}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
