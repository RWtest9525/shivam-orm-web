import { useState } from 'react';
import { Radar, MessageSquare, Star, Filter, Heart, Repeat, Eye } from 'lucide-react';
import { PLATFORM_META } from '@/lib/equinox/design';

export function SocialListeningPage() {
  const [platform, setPlatform] = useState('all');

  const mentions = [
    { id: '1', platform: 'google_play', author: 'Vikram Sethi', content: 'Equinox app payment flow is smooth and instantaneous. Great job team!', rating: 5, time: '10m ago' },
    { id: '2', platform: 'x', author: '@tech_guru_india', content: 'Testing out Equinox Motors India app. UI feels super clean and responsive! #Equinox', rating: null, time: '25m ago' },
    { id: '3', platform: 'instagram', author: 'Priya_M', content: 'Customer support resolved my query in less than 5 minutes on WhatsApp! Recommended.', rating: null, time: '1h ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Radar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Social Listening &amp; Brand Stream
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              Live unified feed across Google Play Store, App Store, X (Twitter), Instagram, and Google Business Profile.
            </p>
          </div>
        </div>
      </div>

      {/* Feed Stream */}
      <div className="space-y-3">
        {mentions.map((m) => (
          <div key={m.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-2 hover:border-primary/30 transition shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{m.author}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/25 text-primary">
                  {PLATFORM_META[m.platform]?.name || m.platform}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-muted-foreground">{m.time}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-200">{m.content}</p>

            {m.rating && (
              <div className="flex items-center gap-1 text-primary text-xs font-bold pt-1">
                {m.rating} <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
