import { useState } from 'react';
import type { ReviewRow, ReplyTemplateRow } from '@/lib/supabase';
import { SentimentBadge } from '@/components/ui/SentimentBadge';
import { PlatformIcon } from '@/components/ui/PlatformIcon';
import { PLATFORM_MAP, STATUS_DEF, SEVERITY_DEF } from '@/data/constants';
import { cn, formatMinutesAgo } from '@/lib/utils';
import { Star, MessageSquareReply, ArrowUpRight, Flag, Check, X, FileText } from 'lucide-react';

interface Props {
  review: ReviewRow;
  templates: ReplyTemplateRow[];
  onReply: (id: string, reply: string) => Promise<void>;
  onStatusChange: (id: string, status: 'escalated' | 'flagged') => Promise<void>;
}

export function ReviewCard({ review, templates, onReply, onStatusChange }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<'' | 'replied' | 'escalated' | 'flagged'>(
    review.status === 'replied' ? 'replied' : review.status === 'escalated' ? 'escalated' : review.status === 'flagged' ? 'flagged' : '',
  );

  const platform = PLATFORM_MAP[review.platform as keyof typeof PLATFORM_MAP];
  const sev = SEVERITY_DEF[review.severity];
  const status = STATUS_DEF[review.status];

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onReply(review.id, replyText.trim());
      setDone('replied');
      setShowReply(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(s: 'escalated' | 'flagged') {
    try {
      await onStatusChange(review.id, s);
      setDone(s);
    } catch (e) {
      console.error(e);
    }
  }

  const minutesAgo = (Date.now() - new Date(review.review_date).getTime()) / 60000;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4.5 transition shadow-sm hover:shadow-md dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20">
      <div className="flex gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${review.sentiment === 'crisis' ? '#f43f5e, #9f1239' : review.sentiment === 'negative' ? '#f59e0b, #b45309' : review.sentiment === 'positive' ? '#06b6d4, #0891b2' : '#64748b, #475569'})` }}
        >
          {review.author_name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">{review.author_name}</span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">· {formatMinutesAgo(minutesAgo)}</span>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                <PlatformIcon platform={review.platform as any} /> {platform?.short || review.platform}
              </span>
              <SentimentBadge sentiment={review.sentiment} pulse={review.sentiment === 'crisis'} />
            </div>
          </div>

          {/* Rating */}
          {review.rating != null && (
            <div className="mt-1 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn('h-3.5 w-3.5', i <= review.rating! ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600')} />
              ))}
              <span className="ml-1 text-[11px] font-extrabold text-slate-700 dark:text-slate-400">{review.rating}.0</span>
            </div>
          )}

          {/* Content */}
          <p className="mt-2 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed dark:text-slate-200">"{review.content}"</p>

          {/* Tags */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black', sev.tone)}>
              {sev.label}
            </span>
            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black', status.tone)}>
              {status.label}
            </span>
            {done === 'replied' && review.reply && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                <Check className="h-3 w-3" /> Replied
              </span>
            )}
          </div>

          {/* Existing reply */}
          {review.reply && (
            <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/[0.05]">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">Your reply</p>
              <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-200">{review.reply}</p>
            </div>
          )}

          {/* Reply box */}
          {showReply && (
            <div className="mt-3 rounded-xl border border-accent-300 bg-accent-50/50 p-3.5 dark:border-accent-500/20 dark:bg-accent-500/[0.05]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-black text-accent-900 dark:text-accent-300">Write a reply</span>
                <button onClick={() => setShowReply(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Template picker */}
              {templates.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setReplyText(t.body)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-accent-300"
                    >
                      <FileText className="h-3 w-3" /> {t.title}
                    </button>
                  ))}
                </div>
              )}
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Type your response..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="rounded-lg bg-gradient-to-r from-accent-500 to-electric-600 px-3.5 py-1.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {done === '' && !showReply && (
              <>
                <button
                  onClick={() => setShowReply(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent-300 bg-accent-50 px-3 py-1.5 text-[11px] font-black text-accent-900 transition hover:bg-accent-100 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-200"
                >
                  <MessageSquareReply className="h-3.5 w-3.5" /> Reply
                </button>
                <button
                  onClick={() => handleStatusChange('escalated')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-900 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" /> Escalate
                </button>
                <button
                  onClick={() => handleStatusChange('flagged')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                >
                  <Flag className="h-3.5 w-3.5" /> Flag
                </button>
              </>
            )}
            {done === 'replied' && !showReply && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Replied
              </span>
            )}
            {done === 'escalated' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <ArrowUpRight className="h-3.5 w-3.5" /> Escalated
              </span>
            )}
            {done === 'flagged' && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-[11px] font-black text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <Flag className="h-3.5 w-3.5" /> Flagged
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
