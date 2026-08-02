import { useState } from 'react';
import { Trophy, TrendingUp, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { GOLD, BLUE } from '@/lib/equinox/design';

export function CompetitorsPage() {
  const [metric, setMetric] = useState<'rating' | 'volume' | 'sentiment'>('rating');

  const competitors = [
    { name: 'Equinox Motors (You)', rating: 4.6, reviews: 1482, sentiment: 86, isSelf: true },
    { name: 'Tesla Motors India', rating: 4.5, reviews: 3410, sentiment: 82, isSelf: false },
    { name: 'Tata Passenger Electric', rating: 4.4, reviews: 5120, sentiment: 78, isSelf: false },
    { name: 'Mahindra Auto Tech', rating: 4.2, reviews: 2890, sentiment: 74, isSelf: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Competitive Brand Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              Benchmark your reputation score, star rating, and customer sentiment against top market competitors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 dark:bg-black/40 dark:border-white/5">
          {(['rating', 'volume', 'sentiment'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition font-semibold ${
                metric === m ? 'bg-primary/20 text-primary border border-primary/30' : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Competitors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map((c, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl border transition space-y-4 shadow-sm ${
              c.isSelf
                ? 'bg-amber-500/5 border-amber-500/30 gold-glow'
                : 'bg-white border-slate-200 dark:bg-black/40 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  c.isSelf ? 'bg-primary text-black' : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white'
                }`}>
                  #{i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {c.name} {c.isSelf && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">Your Brand</span>}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">{c.reviews} total indexed reviews</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {c.rating} <Star className="w-4 h-4 fill-primary text-primary" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-muted-foreground font-semibold">Avg Rating</div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-muted-foreground">Brand Health Index</span>
                <span className="font-bold text-slate-900 dark:text-white">{c.sentiment}/100</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${c.sentiment}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
