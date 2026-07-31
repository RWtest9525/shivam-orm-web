import { useState } from 'react';
import { PageHeader } from '@/components/AppLayout';
import { parsePlayStoreLink, dbEngine, type ReviewRow } from '@/lib/dbEngine';
import { cn } from '@/lib/utils';
import {
  Sparkles, Search, Download, Star, Filter, Calendar, AlertCircle,
  CheckCircle2, Loader2, RefreshCw, Zap, ShieldAlert, FileText
} from 'lucide-react';

export function LiveFetcherPage() {
  const globalConfig = dbEngine.getGlobalApiKey();
  const hasValidApiKey = !!(globalConfig.api_key && globalConfig.api_key.trim());

  // Input states
  const [playInput, setPlayInput] = useState('https://play.google.com/store/apps/details?id=com.hoora.customer');
  const [dateRange, setDateRange] = useState('30');
  const [starFilter, setStarFilter] = useState('all');
  const [fetchLimit, setFetchLimit] = useState('50');

  // Quota simulation (e.g. 500 max limit)
  const [apiQuotaUsed, setApiQuotaUsed] = useState(120);
  const apiQuotaMax = 500;

  // Execution states
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fetchedReviews, setFetchedReviews] = useState<ReviewRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const parsedApp = parsePlayStoreLink(playInput);

  async function handleFetchReviews() {
    setErrorMsg('');
    setSuccessMsg('');

    if (!hasValidApiKey) {
      setErrorMsg('API Key Not Found: Please configure and validate your Reviews World API Key in Settings first.');
      return;
    }

    // Check API Limit
    if (apiQuotaUsed >= apiQuotaMax) {
      setErrorMsg('API Limit Has Exceeded: Please top up more usage credits in your Reviews World API Provider console to continue fetching.');
      return;
    }

    setFetching(true);
    await new Promise((r) => setTimeout(r, 1500));

    // Simulate API quota deduction
    const requestedCount = parseInt(fetchLimit, 10);
    const newUsed = apiQuotaUsed + requestedCount;
    setApiQuotaUsed(newUsed);

    // Generate mock scraped live reviews matching filters
    const targetRating = starFilter === 'all' ? null : parseInt(starFilter, 10);
    const mockAuthors = ['Rohit V.', 'Neha Sharma', 'Karan Patel', 'Meera Kapoor', 'Siddharth M.', 'Deepak R.', 'Pooja Verma', 'Amit Kumar'];
    const mockComments = [
      'App is working smooth after recent update!',
      'Faced issue with payment confirmation screen yesterday.',
      'Great UI design and easy navigation. Highly recommended.',
      'Customer support was very quick to resolve my ticket.',
      'Sometimes lags on slow 3G connection, please optimize.',
      'Best app in its category! 5 stars from my side.',
    ];

    const generated: ReviewRow[] = Array.from({ length: requestedCount }).map((_, i) => {
      const rating = targetRating ?? Math.floor(Math.random() * 5) + 1;
      let sentiment: 'positive' | 'neutral' | 'negative' | 'crisis' = 'positive';
      if (rating <= 2) sentiment = rating === 1 ? 'crisis' : 'negative';
      else if (rating === 3) sentiment = 'neutral';

      return {
        id: `fetch-${Date.now()}-${i}`,
        client_id: 'live-fetcher',
        platform: 'playstore',
        platform_review_id: `gp-live-${Date.now()}-${i}`,
        author_name: mockAuthors[i % mockAuthors.length],
        author_avatar: `https://images.unsplash.com/photo-${1535713875002 + i}?w=100&auto=format&fit=crop&q=80`,
        rating,
        content: `${mockComments[i % mockComments.length]} (${parsedApp.app_name})`,
        sentiment,
        severity: rating <= 2 ? 'high' : 'low',
        status: 'new',
        reply: '',
        replied_at: null,
        review_date: new Date(Date.now() - i * 1000 * 60 * 60 * 8).toISOString(),
        created_at: new Date().toISOString(),
      };
    });

    setFetchedReviews(generated);
    setSuccessMsg(`Successfully fetched ${generated.length} live Play Store reviews for ${parsedApp.app_name}! API Quota Remaining: ${apiQuotaMax - newUsed} requests.`);
    setFetching(false);
  }

  // Filter fetched results by search query
  const filteredReviews = fetchedReviews.filter(
    (r) =>
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function exportCSV() {
    if (!fetchedReviews.length) return;
    const headers = ['Review ID', 'Author', 'Rating', 'Sentiment', 'Content', 'Date'];
    const rows = fetchedReviews.map((r) => [r.id, `"${r.author_name}"`, r.rating, r.sentiment, `"${r.content}"`, r.review_date]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${parsedApp.package_name}_reviews.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Live Play Store Review Fetcher"
        subtitle="Extract live Play Store reviews by App Link, Date Range, and Star Ratings using Reviews World API"
      />

      {/* API Quota & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-base-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">Reviews World API Quota Tracker</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Used: <span className="font-mono text-amber-600 dark:text-amber-400">{apiQuotaUsed}</span> / {apiQuotaMax} requests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2.5 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                apiQuotaUsed >= apiQuotaMax ? 'bg-rose-500' : 'bg-amber-500'
              )}
              style={{ width: `${Math.min(100, (apiQuotaUsed / apiQuotaMax) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => setApiQuotaUsed(500)} // Test quota overflow trigger
            className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          >
            Simulate Quota Limit
          </button>
          <button
            onClick={() => setApiQuotaUsed(0)} // Reset quota
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            Reset Quota
          </button>
        </div>
      </div>

      {/* Fetch Control Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-5">
        <div className="border-b border-slate-200 pb-3 dark:border-white/10">
          <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Live Extraction Controls
          </h2>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
            Specify the Play Store App URL, Target Date Range, Star Filter, and Request Limit.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Play Store App Link or Package ID</label>
            <input
              type="text"
              value={playInput}
              onChange={(e) => setPlayInput(e.target.value)}
              placeholder="e.g. https://play.google.com/store/apps/details?id=com.hoora.customer"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Date Range Filter</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">All Time</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Star Rating Filter</label>
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              >
                <option value="all">⭐ All Star Ratings</option>
                <option value="1">⭐ 1-Star Only (Critical)</option>
                <option value="2">⭐⭐ 2-Star Only</option>
                <option value="3">⭐⭐⭐ 3-Star Only</option>
                <option value="4">⭐⭐⭐⭐ 4-Star Only</option>
                <option value="5">⭐⭐⭐⭐⭐ 5-Star Only (Positive)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Fetch Count Limit</label>
              <select
                value={fetchLimit}
                onChange={(e) => setFetchLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              >
                <option value="25">25 Reviews</option>
                <option value="50">50 Reviews</option>
                <option value="100">100 Reviews</option>
                <option value="250">250 Reviews</option>
              </select>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleFetchReviews}
            disabled={fetching || !playInput.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
          >
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {fetching ? 'Calling Reviews World API & Fetching…' : 'Fetch Live Play Store Reviews'}
          </button>
        </div>
      </div>

      {/* Results Table & Export */}
      {fetchedReviews.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Extracted Live Reviews ({filteredReviews.length})
              </h3>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                Target App: <span className="text-amber-600 dark:text-amber-400 font-mono">{parsedApp.package_name}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-56">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter extracted list..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <button
                onClick={exportCSV}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">Review Content</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold dark:divide-white/[0.04]">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <img src={r.author_avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                      {r.author_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-amber-500 font-black">
                        {r.rating} <Star className="h-3.5 w-3.5 fill-amber-400" />
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                        r.sentiment === 'positive' && 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                        r.sentiment === 'neutral' && 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
                        (r.sentiment === 'negative' || r.sentiment === 'crisis') && 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      )}>
                        {r.sentiment}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 max-w-md truncate">
                      "{r.content}"
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(r.review_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
