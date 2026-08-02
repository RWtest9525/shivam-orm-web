import { useState } from 'react';
import { Radar, Search, Filter, MessageCircle, Star, ThumbsUp, Sparkles, ExternalLink } from 'lucide-react';
import { PlatformBadge, StarRow, DeltaBadge } from '@/lib/equinox/design';

export function SocialListeningPage() {
  const [filterPlatform, setFilterPlatform] = useState('all');

  const reviewsList = [
    {
      id: 'rev-1',
      platform: 'google_play',
      author: 'Aarav Sharma',
      rating: 5,
      content: 'Equinox app is incredibly fast! Best experience with UPI payments and instant order confirmation.',
      date: '12 mins ago',
      sentiment: 'positive',
    },
    {
      id: 'rev-2',
      platform: 'app_store',
      author: 'Vikram Malhotra',
      rating: 1,
      content: 'App crashed during payment processing. Money debited but order status says pending.',
      date: '45 mins ago',
      sentiment: 'negative',
    },
    {
      id: 'rev-3',
      platform: 'x',
      author: '@TechGuruIndia',
      rating: 4,
      content: 'Shoutout to @EquinoxPulse for resolving my support inquiry within 15 minutes! Great AI response.',
      date: '2 hours ago',
      sentiment: 'positive',
    },
    {
      id: 'rev-4',
      platform: 'google_business',
      author: 'Neha Kapoor',
      rating: 5,
      content: 'Visited the flagship showroom. Excellent customer service and smooth digital check-in.',
      date: '3 hours ago',
      sentiment: 'positive',
    },
  ];

  const filtered = filterPlatform === 'all' ? reviewsList : reviewsList.filter((r) => r.platform === filterPlatform);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Radar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Social Listening &amp; Live Reviews
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Omnichannel review feed from Google Play, App Store, X, and Google Business.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPlatform('all')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition font-semibold ${
              filterPlatform === 'all' ? 'bg-primary/15 text-primary border-primary/30' : 'border-white/10 text-neutral-400'
            }`}
          >
            All Channels
          </button>
          <button
            onClick={() => setFilterPlatform('google_play')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition font-semibold ${
              filterPlatform === 'google_play' ? 'bg-primary/15 text-primary border-primary/30' : 'border-white/10 text-neutral-400'
            }`}
          >
            Play Store
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 hover:border-primary/25 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlatformBadge platform={r.platform} />
                <StarRow rating={r.rating} />
              </div>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>

            <div>
              <div className="text-xs font-bold text-white">{r.author}</div>
              <p className="text-xs sm:text-sm text-neutral-200 mt-1">{r.content}</p>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                r.sentiment === 'positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {r.sentiment}
              </span>

              <button className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Reply Assistant
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
