import { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useReplyTemplates, useConnections } from '@/hooks/useData';
import { computeStats, buildSentimentSeries } from '@/lib/analytics';
import { PageHeader } from '@/components/AppLayout';
import { ReviewCard } from '@/components/ReviewCard';
import { SentimentChart } from '@/components/charts/SentimentChart';
import { PLATFORMS, PLATFORM_MAP } from '@/data/constants';
import type { PlatformId, SentimentType, ReviewStatus } from '@/types';
import type { ReviewRow } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Filter, Smartphone, ShoppingCart, Instagram, Linkedin,
  MessageCircle, Store, CheckCircle2, Star, ChevronLeft, ChevronRight,
  ArrowUpDown, X, Search, AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Partial<Record<PlatformId, LucideIcon>> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
  google_business: Store,
  facebook: MessageCircle,
  instagram: Instagram,
  x: MessageCircle,
  youtube: Smartphone,
};

const SENTIMENT_FILTERS: { id: 'all' | SentimentType; label: string }[] = [
  { id: 'all', label: 'All Sentiment' },
  { id: 'positive', label: 'Positive' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'negative', label: 'Negative' },
  { id: 'crisis', label: 'Crisis' },
];

const STATUS_FILTERS: { id: 'all' | ReviewStatus; label: string }[] = [
  { id: 'all', label: 'All Status' },
  { id: 'new', label: 'New' },
  { id: 'replied', label: 'Replied' },
  { id: 'escalated', label: 'Escalated' },
  { id: 'flagged', label: 'Flagged' },
];

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest' | 'critical';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'highest', label: 'Highest Rating' },
  { key: 'lowest', label: 'Lowest Rating' },
  { key: 'critical', label: 'Most Critical' },
];

const PAGE_SIZES = [10, 20, 50];

interface RatingDist {
  total: number;
  rated: number;
  avg: number;
  buckets: Record<number, number>;
}

function computeRatingDist(reviews: ReviewRow[]): RatingDist {
  const buckets: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;
  let rated = 0;
  for (const r of reviews) {
    if (r.rating != null && r.rating >= 1 && r.rating <= 5) {
      const key = Math.floor(r.rating);
      buckets[key] = (buckets[key] ?? 0) + 1;
      sum += r.rating;
      rated++;
    }
  }
  return {
    total: reviews.length,
    rated,
    avg: rated ? Math.round((sum / rated) * 10) / 10 : 0,
    buckets,
  };
}

export function PlatformPage() {
  const { platformId } = useParams<{ platformId: string }>();
  const platform = platformId as PlatformId;
  const { client } = useAuth();
  const { reviews, replyToReview, updateReviewStatus } = useReviews(client?.id, platform);
  const { templates } = useReplyTemplates(client?.id);
  const { connections } = useConnections(client?.id);
  const [searchParams, setSearchParams] = useSearchParams();

  const [sentimentFilter, setSentimentFilter] = useState<'all' | SentimentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const p = parseInt(searchParams.get('p') ?? '0', 10);
    if (!isNaN(p) && p >= 0) setPage(p);
  }, [searchParams]);

  const platformDef = PLATFORM_MAP[platform];
  const Icon = ICONS[platform] || Smartphone;
  const connection = connections.find((c) => c.platform === platform);
  const isConnected = !!connection;

  const stats = useMemo(() => computeStats(reviews), [reviews]);
  const series = useMemo(() => buildSentimentSeries(reviews, 7), [reviews]);
  const ratingDist = useMemo(() => computeRatingDist(reviews), [reviews]);

  const filtered = useMemo(() => {
    let out = reviews.filter((r) => {
      if (sentimentFilter !== 'all' && r.sentiment !== sentimentFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (ratingFilter !== 'all') {
        if (r.rating == null || Math.floor(r.rating) !== ratingFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!r.content.toLowerCase().includes(q) && !r.author_name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    out = [...out].sort((a, b) => {
      switch (sortKey) {
        case 'oldest':
          return new Date(a.review_date).getTime() - new Date(b.review_date).getTime();
        case 'highest':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'lowest':
          return (a.rating ?? -1) - (b.rating ?? -1);
        case 'critical': {
          const order = { critical: 0, high: 1, medium: 2, low: 3 };
          return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
        }
        default:
          return new Date(b.review_date).getTime() - new Date(a.review_date).getTime();
      }
    });

    return out;
  }, [reviews, sentimentFilter, statusFilter, ratingFilter, search, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  useEffect(() => {
    if (page !== 0) {
      setPage(0);
      setSearchParams({});
    }
  }, [sentimentFilter, statusFilter, ratingFilter, search, sortKey, pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPage(p: number) {
    const clamped = Math.max(0, Math.min(p, totalPages - 1));
    setPage(clamped);
    setSearchParams(clamped === 0 ? {} : { p: String(clamped) });
  }

  const hasActiveFilters =
    sentimentFilter !== 'all' || statusFilter !== 'all' || ratingFilter !== 'all' || search !== '';

  function clearAllFilters() {
    setSentimentFilter('all');
    setStatusFilter('all');
    setRatingFilter('all');
    setSearch('');
    setSortKey('newest');
  }

  if (!platformDef) {
    return <div className="text-center text-slate-500 font-bold py-12">Unknown platform.</div>;
  }

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortKey)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title={platformDef.label}
        subtitle={isConnected ? `Connected Account: ${connection.account_name}` : 'Not connected — go to Settings to connect API key'}
      />

      {/* Connection Status Banner */}
      {!isConnected ? (
        <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-amber-900 dark:text-amber-200">Platform Not Connected</p>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Connect your API key or account in Settings to start receiving live reviews.</p>
            </div>
          </div>
          <Link
            to="/app/settings"
            className="rounded-xl border border-amber-400 bg-amber-200 px-3.5 py-2 text-xs font-black text-amber-950 transition hover:bg-amber-300 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200"
          >
            Configure API Key →
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">Channel Sync Active</p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Mode: {connection.api_mode === 'google_console' ? 'Official Google Play Console API (Direct Reply Active)' : 'Reviews World Live Scraper API'}
            </p>
          </div>
        </div>
      )}

      {/* Rating Breakdown Card */}
      {ratingDist.rated > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Average rating star block */}
            <div className="flex shrink-0 flex-col items-center border-b border-slate-200 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-8 dark:border-white/10">
              <p className="text-4xl font-black text-slate-900 dark:text-white">{ratingDist.avg.toFixed(1)}</p>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn('h-4 w-4', i <= Math.round(ratingDist.avg) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">{ratingDist.rated} verified reviews</p>
            </div>

            {/* Rating breakdown bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDist.buckets[star] ?? 0;
                const pct = ratingDist.rated ? (count / ratingDist.rated) * 100 : 0;
                const active = ratingFilter === star;
                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(active ? 'all' : star)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-1.5 transition border',
                      active
                        ? 'border-accent-400 bg-accent-50 text-accent-900 dark:bg-accent-500/20 dark:text-accent-300'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    )}
                  >
                    <span className={cn('flex w-12 shrink-0 items-center gap-1 text-xs font-black', active ? 'text-accent-900 dark:text-accent-300' : 'text-slate-700 dark:text-slate-300')}>
                      {star}
                      <Star className={cn('h-3.5 w-3.5', active ? 'fill-accent-500 text-accent-600' : 'fill-slate-400 text-slate-500')} />
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-black text-slate-900 dark:text-slate-200">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Reviews</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Positive</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.positive}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Negative / Crisis</p>
          <p className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">{stats.negative + stats.crisis}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg Rating</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{stats.avgRating.toFixed(1)}★</p>
        </div>
      </div>

      {/* Sentiment Chart */}
      {reviews.length > 0 && (
        <SentimentChart data={series} />
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" />
              {currentSort.label}
              <ChevronRight className={cn('h-3.5 w-3.5 transition', showSortMenu && 'rotate-90')} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                <div className="absolute left-0 top-full z-40 mt-1 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl dark:border-white/10 dark:bg-base-900">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                      className={cn(
                        'flex w-full items-center justify-between px-3.5 py-2 text-xs font-bold transition',
                        sortKey === opt.key ? 'bg-accent-50 text-accent-900 dark:bg-accent-500/20 dark:text-accent-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                      )}
                    >
                      {opt.label}
                      {sortKey === opt.key && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sentiment filters */}
          <div className="flex flex-wrap gap-1">
            {SENTIMENT_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSentimentFilter(f.id)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  sentimentFilter === f.id
                    ? 'bg-accent-500/20 text-accent-900 dark:text-accent-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search platform reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-2.5 text-xs font-bold text-slate-700 dark:bg-white/5 dark:text-slate-300">
            <span>Showing {filtered.length} of {reviews.length} reviews</span>
            <button onClick={clearAllFilters} className="text-rose-600 hover:underline">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Review List */}
      {paged.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-base-900">
          No reviews match your filter for this platform.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {paged.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              templates={templates}
              onReply={replyToReview}
              onStatusChange={updateReviewStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
