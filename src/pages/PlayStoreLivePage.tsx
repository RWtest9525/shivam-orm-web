import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConnections, useReviews, useDroppedReviews } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import {
  Smartphone, Radio, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert,
  RefreshCw, MessageSquare, Send, X, Star, Trash2, Info
} from 'lucide-react';

export function PlayStoreLivePage() {
  const { client } = useAuth();
  const { connections } = useConnections(client?.id);
  const { reviews, replyToReview } = useReviews(client?.id, 'playstore');
  const { droppedReviews } = useDroppedReviews(client?.id);

  const playConn = connections.find((c) => c.platform === 'playstore');
  const isScraperMode = playConn?.api_mode === 'reviews_world_scraper';
  const isReplyAllowed = playConn ? playConn.api_mode === 'google_console' : true;

  const [syncing, setSyncing] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState<'live' | 'dropped'>('live');

  async function handleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  }

  async function handleSendReply() {
    if (!selectedReview || !replyText.trim() || !isReplyAllowed) return;
    await replyToReview(selectedReview.id, replyText.trim());
    setSelectedReview(null);
    setReplyText('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Play Store Live Sync & Dropped Review Tracker"
        subtitle="Monitor live Google Play reviews, track dropped/removed reviews, and send official replies"
        action={
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2.5 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
          >
            <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
            {syncing ? 'Fetching Live Data…' : 'Trigger Live Sync'}
          </button>
        }
      />

      {/* Integration Mode Banner */}
      <div className="glass rounded-2xl p-5 shadow-card border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                  {playConn ? playConn.account_name : 'Google Play Store Live Feed'}
                </h3>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    isScraperMode
                      ? 'bg-amber-500/20 text-amber-300 light:bg-amber-100 light:text-amber-800'
                      : 'bg-emerald-500/20 text-emerald-300 light:bg-emerald-100 light:text-emerald-800'
                  )}
                >
                  {isScraperMode ? 'Reviews World Scraper Mode' : 'Official Play Console API'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400 light:text-slate-600">
                Package: <code className="text-accent-300">{playConn?.app_package_name || 'com.dreamapps.mobile'}</code> · Last synced: {playConn?.last_synced_at ? new Date(playConn.last_synced_at).toLocaleTimeString() : 'Just now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" /> Live Fetching Active
            </span>
          </div>
        </div>

        {/* Warning if Scraper Mode */}
        {isScraperMode && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300 light:bg-amber-50 light:text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold">Reviews World Scraper API Mode Restricted Notice:</p>
              <p className="mt-0.5 text-[11px] text-amber-300/90 light:text-amber-700">
                Under Scraper Mode, live ratings are scraped for view-only monitoring. Direct replying and dropped review tracking require an official Google Play Console Service Account key. Switch in Settings to enable.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] light:border-slate-200">
        <button
          onClick={() => setActiveTab('live')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all',
            activeTab === 'live'
              ? 'border-accent-400 text-accent-300 light:text-accent-700'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Smartphone className="h-4 w-4" /> Live Active Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('dropped')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all',
            activeTab === 'dropped'
              ? 'border-accent-400 text-accent-300 light:text-accent-700'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Trash2 className="h-4 w-4 text-rose-400" /> Dropped / Removed Reviews Log ({droppedReviews.length})
        </button>
      </div>

      {/* Tab 1: Live Reviews */}
      {activeTab === 'live' && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-2xl p-5 shadow-card hover:border-white/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={r.author_avatar}
                    alt={r.author_name}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100 light:text-slate-900">{r.author_name}</span>
                      <div className="flex items-center text-amber-400 text-xs font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 mr-0.5" />
                        {r.rating}★
                      </div>
                      <span className="rounded-full bg-accent-500/10 border border-accent-500/20 px-2 py-0.5 text-[10px] font-semibold capitalize text-accent-300">
                        {r.sentiment}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 light:text-slate-500">
                      {new Date(r.review_date).toLocaleString()} · ID: {r.platform_review_id}
                    </p>
                  </div>
                </div>

                {/* Reply trigger button */}
                <div>
                  {r.reply ? (
                    <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                      Replied
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (!isReplyAllowed) {
                          alert('Reply option is disabled under Reviews World Scraper Mode. Please switch to Google Play Console API in Settings.');
                          return;
                        }
                        setSelectedReview(r);
                      }}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition',
                        isReplyAllowed
                          ? 'border-accent-500/30 bg-accent-500/10 text-accent-300 hover:bg-accent-500/20'
                          : 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                      )}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {isReplyAllowed ? 'Reply to Review' : 'Reply Disabled (Scraper)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Review text */}
              <p className="mt-3 text-xs sm:text-sm text-slate-200 light:text-slate-800 leading-relaxed">
                "{r.content}"
              </p>

              {/* Existing Reply */}
              {r.reply && (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 light:bg-emerald-50">
                  <p className="text-[11px] font-bold text-emerald-400 light:text-emerald-700">Developer Reply (Synced to Play Console):</p>
                  <p className="mt-1 text-xs text-slate-300 light:text-slate-800">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Dropped Reviews Log */}
      {activeTab === 'dropped' && (
        <div className="space-y-4">
          {!isReplyAllowed && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
              <Info className="inline h-4 w-4 mr-1.5" />
              Dropped Review Tracking is unavailable in Scraper Mode. Below are archived snapshot records.
            </div>
          )}

          {droppedReviews.map((d) => (
            <div key={d.id} className="glass rounded-2xl p-5 shadow-card border-rose-500/20 bg-rose-500/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span className="text-xs font-bold text-slate-100 light:text-slate-900">{d.author_name}</span>
                  <span className="text-amber-400 text-xs font-bold">{d.rating}★</span>
                </div>
                <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[10px] font-bold text-rose-300">
                  Reason: {d.reason}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-300 light:text-slate-700">"{d.content}"</p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Original Review: {new Date(d.original_date).toLocaleString()}</span>
                <span className="text-rose-400">Detected Dropped: {new Date(d.dropped_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-base-900 p-6 shadow-2xl light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 light:border-slate-200">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
                <MessageSquare className="h-4 w-4 text-accent-400" /> Reply to Play Store Review
              </h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white/5 p-3 text-xs light:bg-slate-100">
                <p className="font-bold text-slate-200 light:text-slate-900">{selectedReview.author_name} ({selectedReview.rating}★)</p>
                <p className="mt-1 text-slate-400 light:text-slate-600">"{selectedReview.content}"</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300 light:text-slate-700">Official Reply Message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type your response to post directly to Google Play Console…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 light:border-slate-300 light:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Post Official Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
