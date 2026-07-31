import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useReplyTemplates } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import {
  Zap, MessageSquare, Star, CheckCircle2, Clock, ShieldAlert, Send, FileText, Sparkles
} from 'lucide-react';

export function WorkerDashboard() {
  const { client } = useAuth();
  const { reviews, replyToReview } = useReviews(client?.id);
  const { templates } = useReplyTemplates(client?.id);

  const pendingReviews = reviews.filter((r) => r.status !== 'replied');
  const repliedReviews = reviews.filter((r) => r.status === 'replied');

  const [activeReviewId, setActiveReviewId] = useState<string>(pendingReviews[0]?.id || reviews[0]?.id || '');
  const [responseText, setResponseText] = useState('');

  const activeReview = reviews.find((r) => r.id === activeReviewId);

  async function handlePostReply() {
    if (!activeReview || !responseText.trim()) return;
    await replyToReview(activeReview.id, responseText.trim());
    setResponseText('');
  }

  function applyTemplate(body: string) {
    if (!activeReview) return;
    const filled = body.replace('{author_name}', activeReview.author_name);
    setResponseText(filled);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderator Rapid Reply Queue"
        subtitle="High-velocity review moderation studio & template assistant"
      />

      {/* Stats bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Queue</p>
              <p className="text-xl font-bold text-slate-100 light:text-slate-900">{pendingReviews.length} Reviews</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Today</p>
              <p className="text-xl font-bold text-emerald-300 light:text-emerald-700">{repliedReviews.length} Replied</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/20 text-accent-400">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg SLA Speed</p>
              <p className="text-xl font-bold text-accent-300 light:text-accent-700">7.5 mins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Review list */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Unresolved Reviews</h3>
          <div className="space-y-3 max-h-[550px] overflow-y-auto no-scrollbar">
            {reviews.map((r) => {
              const isSelected = r.id === activeReview?.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveReviewId(r.id);
                    setResponseText(r.reply || '');
                  }}
                  className={cn(
                    'cursor-pointer glass rounded-2xl p-4 transition-all border',
                    isSelected
                      ? 'border-accent-400 bg-accent-500/10 shadow-glow'
                      : 'hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 light:text-slate-900">{r.author_name}</span>
                    <span className="text-amber-400 text-xs font-bold">{r.rating}★</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400 light:text-slate-600">{r.content}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="uppercase text-slate-500">{r.platform}</span>
                    <span
                      className={cn(
                        'font-bold px-2 py-0.5 rounded-full',
                        r.status === 'replied' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rapid Reply Workspace */}
        <div className="lg:col-span-7 glass rounded-2xl p-5 shadow-card space-y-4 border">
          {activeReview ? (
            <>
              <div className="border-b border-white/10 pb-4 light:border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeReview.author_avatar}
                      alt={activeReview.author_name}
                      className="h-9 w-9 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 light:text-slate-900">{activeReview.author_name}</h4>
                      <p className="text-[10px] text-slate-400">{activeReview.platform} · {new Date(activeReview.review_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-amber-400 text-sm font-bold">{activeReview.rating}★</span>
                </div>
                <p className="mt-3 text-xs text-slate-200 light:text-slate-800 leading-relaxed">
                  "{activeReview.content}"
                </p>
              </div>

              {/* Template Quick Insert Pills */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Quick Canned Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.body)}
                      className="flex items-center gap-1 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-300 hover:bg-accent-500/20 transition light:bg-accent-100 light:text-accent-800"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700">Moderator Response</label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={5}
                  placeholder="Type response or click a template above…"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handlePostReply}
                  disabled={!responseText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-5 py-2.5 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Submit & Mark Replied
                </button>
              </div>
            </>
          ) : (
            <p className="p-8 text-center text-xs text-slate-500">Select a review from the queue.</p>
          )}
        </div>
      </div>
    </div>
  );
}
