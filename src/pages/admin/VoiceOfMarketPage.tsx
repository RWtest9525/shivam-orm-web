import { useState } from 'react';
import { Mic, Sparkles, MessageCircle, Heart, ThumbsDown } from 'lucide-react';

export function VoiceOfMarketPage() {
  const topics = [
    { title: 'UPI Auto-Pay & Refund Speed', volume: '420 mentions', sentiment: '88% Positive', tags: ['Payments', 'UX', 'Fintech'] },
    { title: 'Play Store App Stability v4.2', volume: '310 mentions', sentiment: '72% Positive', tags: ['Android', 'App Store', 'Bugs'] },
    { title: 'Customer Support Response SLA', volume: '190 mentions', sentiment: '94% Positive', tags: ['Support', 'SLA', 'Resolution'] },
    { title: 'Festival Campaign Discussions', volume: '140 mentions', sentiment: '85% Positive', tags: ['Marketing', 'Discounts', 'Social'] },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Mic className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Voice of Market
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consumer perception cloud, keyword extraction, and market narrative signals.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t, i) => (
          <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 hover:border-primary/25 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{t.volume}</span>
              <span className="text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                {t.sentiment}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{t.title}</h3>

            <div className="flex items-center gap-2 pt-1">
              {t.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
