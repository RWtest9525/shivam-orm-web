import { useState, useEffect } from 'react';
import type { AIReplyTone, AIReplyLogItem, AIAnalysisResult } from '@/types';
import { generateAIReplyApi, approveAIReplyApi } from '@/lib/apiAi';
import { cn } from '@/lib/utils';
import {
  Sparkles, X, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle,
  FileText, History, Zap, Check, Lock, Globe, Tag, AlertTriangle
} from 'lucide-react';

interface AiReplyAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
  content: string;
  platform?: string;
  rating?: number;
  targetId: string;
  targetType?: 'REVIEW' | 'CONVERSATION';
  onApproveAndApply: (finalText: string) => Promise<void> | void;
}

const TONES: { id: AIReplyTone; label: string; description: string }[] = [
  { id: 'Professional', label: 'Professional', description: 'Balanced, polite, and corporate' },
  { id: 'Friendly', label: 'Friendly', description: 'Warm, empathetic, with emojis' },
  { id: 'Formal', label: 'Formal', description: 'Strict executive & legal compliance tone' },
  { id: 'Short', label: 'Short', description: 'Concise 1-2 sentence response' },
  { id: 'Detailed', label: 'Detailed', description: 'In-depth, comprehensive response' },
];

export function AiReplyAssistantModal({
  isOpen,
  onClose,
  authorName,
  content,
  platform = 'Play Store',
  rating,
  targetId,
  targetType = 'REVIEW',
  onApproveAndApply,
}: AiReplyAssistantModalProps) {
  const [selectedTone, setSelectedTone] = useState<AIReplyTone>('Professional');
  const [editableReply, setEditableReply] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);

  const [currentLog, setCurrentLog] = useState<AIReplyLogItem | null>(null);
  const [versionHistory, setVersionHistory] = useState<AIReplyLogItem[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  useEffect(() => {
    if (isOpen && content) {
      handleGenerate(selectedTone, 1);
    }
  }, [isOpen]);

  async function handleGenerate(toneToUse: AIReplyTone, targetVersion?: number) {
    setGenerating(true);
    try {
      const v = targetVersion || versionHistory.length + 1;
      const res = await generateAIReplyApi({
        authorName,
        content,
        platform,
        tone: toneToUse,
        rating,
        targetId,
        targetType,
        currentVersion: v,
      });

      setCurrentLog(res.replyLog);
      setEditableReply(res.replyLog.generatedReply);
      setAnalysis(res.replyLog.analysis || null);
      if (res.allVersions && res.allVersions.length > 0) {
        setVersionHistory(res.allVersions);
      } else {
        setVersionHistory((prev) => [...prev, res.replyLog]);
      }
    } catch (e: any) {
      console.error('AI generation error:', e);
    } finally {
      setGenerating(false);
    }
  }

  function handleSwitchVersion(vLog: AIReplyLogItem) {
    setCurrentLog(vLog);
    setSelectedTone(vLog.tone);
    setEditableReply(vLog.userEditedReply || vLog.generatedReply);
    if (vLog.analysis) setAnalysis(vLog.analysis);
  }

  async function handleApproveAndSubmit() {
    if (!editableReply.trim()) return;
    setApproving(true);
    try {
      if (currentLog) {
        await approveAIReplyApi(currentLog.id, editableReply.trim());
      }
      await onApproveAndApply(editableReply.trim());
      onClose();
    } catch (e: any) {
      console.error('Approval failed:', e);
    } finally {
      setApproving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-base-900 space-y-5 animate-float-up my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                AI Smart Reply & Intelligence Assistant
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {authorName} · {platform}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Customer Input Context */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02] space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400">Customer Review / Message</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">"{content}"</p>
        </div>

        {/* AI Intelligence Signals Badges Grid */}
        {analysis && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {/* Sentiment */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Sentiment</span>
              <span
                className={cn(
                  'text-[11px] font-black uppercase',
                  analysis.sentiment === 'POSITIVE' && 'text-emerald-500',
                  analysis.sentiment === 'NEUTRAL' && 'text-slate-400',
                  analysis.sentiment === 'NEGATIVE' && 'text-amber-500',
                  analysis.sentiment === 'CRISIS' && 'text-rose-500'
                )}
              >
                {analysis.sentiment}
              </span>
            </div>

            {/* Spam Analysis */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Spam Check</span>
              <span
                className={cn(
                  'text-[11px] font-black',
                  analysis.spamStatus.isSpam ? 'text-rose-500' : 'text-emerald-500'
                )}
              >
                {analysis.spamStatus.isSpam ? `Spam (${analysis.spamStatus.spamScore}%)` : 'Clean Text'}
              </span>
            </div>

            {/* Category */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Category</span>
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate block">
                {analysis.category}
              </span>
            </div>

            {/* Priority */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Priority</span>
              <span
                className={cn(
                  'text-[11px] font-black uppercase',
                  analysis.priority === 'URGENT' && 'text-rose-500',
                  analysis.priority === 'HIGH' && 'text-amber-500',
                  analysis.priority === 'MEDIUM' && 'text-sky-500',
                  analysis.priority === 'LOW' && 'text-slate-400'
                )}
              >
                {analysis.priority}
              </span>
            </div>

            {/* Language */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Language</span>
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                {analysis.language}
              </span>
            </div>

            {/* Confidence Score */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="block text-[9px] font-extrabold uppercase text-slate-400">Confidence</span>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block">
                {Math.round(analysis.confidenceScore * 100)}% Match
              </span>
            </div>
          </div>
        )}

        {/* Tone Selector Pills */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Select AI Reply Tone
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {TONES.map((t) => {
              const isSelected = selectedTone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTone(t.id);
                    handleGenerate(t.id);
                  }}
                  className={cn(
                    'rounded-xl border px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5',
                    isSelected
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                      : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Version History Selector */}
        {versionHistory.length > 1 && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 p-2.5 dark:bg-white/5 text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <History className="h-3.5 w-3.5 text-amber-500" /> Version History:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {versionHistory.map((vLog, idx) => (
                <button
                  key={vLog.id}
                  onClick={() => handleSwitchVersion(vLog)}
                  className={cn(
                    'rounded-lg px-2 py-0.5 text-[10px] font-black transition',
                    currentLog?.id === vLog.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-white text-slate-700 dark:bg-white/10 dark:text-slate-300'
                  )}
                >
                  v{vLog.version || idx + 1} ({vLog.tone})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Editable AI Generated Reply */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              AI Generated Draft (Fully Editable)
            </label>
            <button
              onClick={() => handleGenerate(selectedTone)}
              disabled={generating}
              className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', generating && 'animate-spin')} />
              Regenerate Reply
            </button>
          </div>

          <textarea
            value={editableReply}
            onChange={(e) => setEditableReply(e.target.value)}
            rows={4}
            placeholder="AI generating draft reply…"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 font-sans text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
        </div>

        {/* Mandatory User Approval Policy Banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-bold text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Mandatory User Approval:</strong> AI will never send responses automatically. Review and edit the draft above before clicking "Approve & Apply Reply".
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
          >
            Cancel
          </button>

          <button
            onClick={handleApproveAndSubmit}
            disabled={approving || !editableReply.trim() || generating}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
          >
            {approving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Approve & Apply Reply
          </button>
        </div>
      </div>
    </div>
  );
}
