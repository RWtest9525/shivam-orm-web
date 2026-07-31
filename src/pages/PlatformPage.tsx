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
import type { ReviewRow, ReplyTemplateRow } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Filter, Smartphone, ShoppingCart, Instagram, Linkedin,
  MessageCircle, Store, CheckCircle2, Star, ChevronLeft, ChevronRight,
  ArrowUpDown, X, Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<PlatformId, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

const SENTIMENT_FILTERS: { id: 'all' | SentimentType; label: string }[] = [
  { id: 'all', label: 'All' },
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
  buckets: Record<number, number>; // 5..1
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
  const { reviews, loading, replyToReview, updateReviewStatus } = useReviews(client?.id, platform);
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

  // Sync page from URL
  useEffect(() => {
    const p = parseInt(searchParams.get('p') ?? '0', 10);
    if (!isNaN(p) && p >= 0) setPage(p);
  }, [searchParams]);

  const platformDef = PLATFORM_MAP[platform];
  const Icon = ICONS[platform];
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

  // Reset to page 0 when filters change
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
    return <div className="text-center text-slate-400">Unknown platform.</div>;
  }

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortKey)!;

  return (
    <div>
      <PageHeader
        title={platformDef.label}
        subtitle={isConnected ? `Connected as ${connection.account_name}` : 'Not connected — go to Settings to connect'}
      />

      {/* Not connected banner */}
      {!isConnected && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Icon className="h-5 w-5 text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-200">This platform is not connected</p>
              <p className="text-xs text-amber-400/80">Connect your {platformDef.label} account in Settings to start receiving reviews.</p>
            </div>
          </div>
          <Link
            to="/app/settings"
            className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/30"
          >
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Rating distribution — Play Store style */}
      {ratingDist.rated > 0 && (
        <div className="glass mb-5 rounded-2xl p-5 shadow-card">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Big average */}
            <div className="flex shrink-0 flex-col items-center sm:w-36">
              <p className="text-4xl font-bold text-white">{ratingDist.avg.toFixed(1)}</p>
              <div className="mt-1 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn('h-4 w-4', i <= Math.round(ratingDist.avg) ? 'fill-amber-300 text-amber-300' : 'text-slate-600')}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">{ratingDist.rated} rated reviews</p>
            </div>

            {/* Rating bars */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDist.buckets[star] ?? 0;
                const pct = ratingDist.rated ? (count / ratingDist.rated) * 100 : 0;
                const active = ratingFilter === star;
                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(active ? 'all' : star)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-1 transition',
                      active ? 'bg-accent-500/10' : 'hover:bg-white/[0.04]',
                    )}
                  >
                    <span className={cn('flex w-12 shrink-0 items-center gap-0.5 text-xs font-medium', active ? 'text-accent-200' : 'text-slate-400')}>
                      {star}
                      <Star className={cn('h-3 w-3', active ? 'fill-accent-300 text-accent-300' : 'fill-slate-500 text-slate-500')} />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          star >= 4 ? 'bg-emerald-400' : star === 3 ? 'bg-amber-400' : 'bg-rose-400',
                          active && 'opacity-100',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className={cn('w-10 shrink-0 text-right text-xs font-semibold tabular-nums', active ? 'text-accent-200' : 'text-slate-400')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {ratingFilter !== 'all' && (
            <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
              <span className="text-xs text-slate-500">
                Filtering: <span className="font-semibold text-accent-200">{ratingFilter} star only</span>
              </span>
              <button
                onClick={() => setRatingFilter('all')}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass rounded-xl p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Total Reviews</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass rounded-xl p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Positive</p>
          <p className="mt-1 text-xl font-bold text-emerald-300">{stats.positive}</p>
        </div>
        <div className="glass rounded-xl p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Negative</p>
          <p className="mt-1 text-xl font-bold text-amber-300">{stats.negative + stats.crisis}</p>
        </div>
        <div className="glass rounded-xl p-3.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Avg Rating</p>
          <p className="mt-1 text-xl font-bold text-white">{stats.avgRating.toFixed(1)}★</p>
        </div>
      </div>

      {/* Chart */}
      {reviews.length > 0 && (
        <div className="mb-5">
          <SentimentChart data={series} />
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-accent-500/30 hover:text-slate-100"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-accent-300" />
              {currentSort.label}
              <ChevronRight className={cn('h-3 w-3 transition', showSortMenu && 'rotate-90')} />
            </button>
            {showSortMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
                <div className="absolute left-0 top-full z-40 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-base-850 py-1 shadow-card">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                      className={cn(
                        'flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition',
                        sortKey === opt.key ? 'bg-accent-500/10 text-accent-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
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

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
          </div>

          {/* Sentiment filters */}
          <div className="flex flex-wrap gap-1">
            {SENTIMENT_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSentimentFilter(f.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition',
                  sentimentFilter === f.id ? 'bg-accent-500/15 text-accent-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-slate-700">|</span>

          {/* Status filters */}
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition',
                  statusFilter === f.id ? 'bg-electric-500/15 text-electric-200' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search reviews…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder:text-slate-600 focus:border-accent-500/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Active filter summary + clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-200">{filtered.length}</span> of {reviews.length} reviews
            </span>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <X className="h-3 w-3" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Loading reviews…</div>
      ) : paged.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">
            {hasActiveFilters ? 'No reviews match your filters.' : 'No reviews yet for this platform.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-3 inline-flex items-center gap-1 rounded-md border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-200 transition hover:bg-accent-500/20"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-4 sm:flex-row">
              {/* Page size */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Rows per page:</span>
                <div className="flex gap-1">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setPageSize(size); goToPage(0); }}
                      className={cn(
                        'rounded-md px-2 py-0.5 text-xs font-medium transition',
                        pageSize === size ? 'bg-accent-500/15 text-accent-200' : 'text-slate-400 hover:bg-white/5',
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="ml-2 hidden sm:inline">
                  {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`gap-${i}`} className="px-1.5 text-xs text-slate-600">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={cn(
                        'inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition',
                        p === currentPage
                          ? 'bg-accent-500/20 text-accent-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)]'
                          : 'border border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200',
                      )}
                    >
                      {p + 1}
                    </button>
                  ),
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '…')[] = [0];
  if (current > 2) pages.push('…');
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 3) pages.push('…');
  pages.push(total - 1);
  return pages;
}
