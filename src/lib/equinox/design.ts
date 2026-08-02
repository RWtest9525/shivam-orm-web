import React from 'react';
import {
  Play, Store, Package, ShoppingCart, Globe, Newspaper, Youtube,
  MessageCircle, Instagram, Facebook, Linkedin, Twitter, Rss, Star,
  TrendingUp, TrendingDown,
} from 'lucide-react';

export const GOLD = '#D4AF37';
export const BLUE = '#2563EB';
export const CHART_COLORS = {
  pos: '#22C55E',
  neu: '#94A3B8',
  neg: '#EF4444',
  gold: GOLD,
  blue: BLUE,
  purple: '#A855F7',
  pink: '#EC4899',
  amber: '#F59E0B'
};

export const PLATFORM_META: Record<string, { name: string; icon: any; color: string; hex: string }> = {
  google_play: { name: 'Google Play', icon: Play, color: 'text-emerald-400', hex: '#22C55E' },
  app_store: { name: 'App Store', icon: Store, color: 'text-sky-400', hex: '#38BDF8' },
  google_business: { name: 'Google Business', icon: Globe, color: 'text-amber-400', hex: '#F59E0B' },
  amazon: { name: 'Amazon', icon: Package, color: 'text-orange-400', hex: '#FB923C' },
  flipkart: { name: 'Flipkart', icon: ShoppingCart, color: 'text-yellow-400', hex: '#FACC15' },
  shopify: { name: 'Shopify', icon: Store, color: 'text-green-400', hex: '#4ADE80' },
  instagram: { name: 'Instagram', icon: Instagram, color: 'text-pink-400', hex: '#F472B6' },
  facebook: { name: 'Facebook', icon: Facebook, color: 'text-blue-400', hex: '#60A5FA' },
  linkedin: { name: 'LinkedIn', icon: Linkedin, color: 'text-sky-500', hex: '#0EA5E9' },
  reddit: { name: 'Reddit', icon: MessageCircle, color: 'text-orange-500', hex: '#F97316' },
  youtube: { name: 'YouTube', icon: Youtube, color: 'text-red-500', hex: '#EF4444' },
  x: { name: 'X (Twitter)', icon: Twitter, color: 'text-neutral-300', hex: '#D4D4D4' },
  news: { name: 'News', icon: Newspaper, color: 'text-amber-300', hex: '#FCD34D' },
  blogs: { name: 'Blogs', icon: Rss, color: 'text-purple-400', hex: '#C084FC' },
  forums: { name: 'Forums', icon: MessageCircle, color: 'text-cyan-400', hex: '#22D3EE' },
};

export const SENT_COLOR = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  neutral: 'text-neutral-300 bg-neutral-500/10 border-neutral-500/30',
  negative: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
};

export const PRI_COLOR = {
  p1_critical: 'text-rose-400 bg-rose-500/10 border-rose-500/40',
  p2_high: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
  p3_normal: 'text-sky-400 bg-sky-500/10 border-sky-500/40',
};

export const PRI_LABEL = { p1_critical: 'P1 Critical', p2_high: 'P2 High', p3_normal: 'P3 Normal' };

export const ROLE_META = {
  super_admin: { label: 'Super Admin', color: 'bg-primary/15 text-primary border-primary/30' },
  admin: { label: 'Admin', color: 'bg-primary/15 text-primary border-primary/30' },
  manager: { label: 'Manager', color: 'bg-secondary/15 text-secondary border-secondary/30' },
  analyst: { label: 'Analyst', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  viewer: { label: 'Viewer', color: 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30' },
  client: { label: 'Client', color: 'bg-neutral-500/15 text-neutral-300 border-neutral-500/30' },
};

export function PlatformBadge({ platform, size = 'sm' }: { platform: string; size?: 'sm' | 'lg' }) {
  const meta = PLATFORM_META[platform] || { name: platform, icon: Globe, color: 'text-neutral-400' };
  const Icon = meta.icon;
  return React.createElement(
    'span',
    { className: `inline-flex items-center gap-1.5 ${size === 'lg' ? 'text-sm' : 'text-xs'} font-medium ${meta.color}` },
    React.createElement(Icon, { className: size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5' }),
    meta.name
  );
}

export function StarRow({ rating }: { rating: number }) {
  return React.createElement(
    'div',
    { className: 'flex items-center gap-0.5' },
    Array.from({ length: 5 }).map((_, i) =>
      React.createElement(Star, { key: i, className: `w-3.5 h-3.5 ${i < rating ? 'fill-primary text-primary' : 'text-neutral-700'}` })
    )
  );
}

export function DeltaBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return React.createElement(
    'span',
    { className: `inline-flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}` },
    React.createElement(Icon, { className: 'w-3 h-3' }),
    `${positive ? '+' : ''}${value}%`
  );
}
