import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReplyTemplates } from '@/hooks/useData';
import { useUnifiedInbox } from '@/hooks/useUnifiedInbox';
import { PageHeader } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import type { InboxSourceType, ConversationStatus } from '@/types';
import {
  Globe, Instagram, Linkedin, MessageCircle, MessageSquare, Send, CheckCheck,
  Search, Filter, User, RefreshCw, Star, Pin, Paperclip, FileText, CheckCircle2,
  AlertCircle, ShieldCheck, History, CornerDownRight, Tag, Lock, Loader2, Sparkles,
  Smartphone, ShoppingCart, UserCheck, X
} from 'lucide-react';

const SOURCE_TABS: { id: InboxSourceType; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'All Sources', icon: Globe, color: 'text-slate-400' },
  { id: 'google_reviews', label: 'Google Reviews', icon: Star, color: 'text-amber-500' },
  { id: 'facebook_messages', label: 'Facebook DMs', icon: MessageCircle, color: 'text-sky-500' },
  { id: 'instagram_messages', label: 'Instagram DMs', icon: Instagram, color: 'text-pink-500' },
  { id: 'comments', label: 'Comments', icon: MessageSquare, color: 'text-emerald-500' },
  { id: 'mentions', label: 'Mentions', icon: Tag, color: 'text-purple-500' },
];

const STATUS_FILTERS: { id: ConversationStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Status' },
  { id: 'OPEN', label: 'Open' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'RESOLVED', label: 'Resolved' },
  { id: 'ESCALATED', label: 'Escalated' },
];

export function SocialInboxPage() {
  const { client } = useAuth();
  const { templates } = useReplyTemplates(client?.id);

  const {
    conversations,
    unreadCount,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    activeMessages,
    activeNotes,
    activeHistory,
    selectedSource,
    setSelectedSource,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    onlyStarred,
    setOnlyStarred,
    onlyPinned,
    setOnlyPinned,
    onlyUnread,
    setOnlyUnread,
    selectedAssignee,
    setSelectedAssignee,
    refreshing,
    isTyping,
    isViewer,
    triggerManualRefresh,
    sendReply,
    addNote,
    assignWorker,
    changeStatus,
    toggleStar,
    togglePin,
  } = useUnifiedInbox(client?.id);

  const [composerMode, setComposerMode] = useState<'reply' | 'note'>('reply');
  const [composerInput, setComposerInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [detailTab, setDetailTab] = useState<'messages' | 'notes' | 'history'>('messages');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    if (!composerInput.trim() && attachedFiles.length === 0) return;
    if (composerMode === 'reply') {
      await sendReply(composerInput.trim(), attachedFiles);
    } else {
      await addNote(composerInput.trim());
    }
    setComposerInput('');
    setAttachedFiles([]);
    setSelectedTemplateId('');
  }

  function handleSelectTemplate(e: React.ChangeEvent<HTMLSelectElement>) {
    const tid = e.target.value;
    setSelectedTemplateId(tid);
    const tmpl = templates.find((t) => t.id === tid);
    if (tmpl) {
      setComposerInput((prev) => (prev ? `${prev}\n${tmpl.body}` : tmpl.body));
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setAttachedFiles((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'google_reviews':
        return <Star className="h-3.5 w-3.5 text-amber-500" />;
      case 'facebook_messages':
        return <MessageCircle className="h-3.5 w-3.5 text-sky-500" />;
      case 'instagram_messages':
        return <Instagram className="h-3.5 w-3.5 text-pink-500" />;
      case 'comments':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />;
      case 'mentions':
        return <Tag className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Unified Customer Inbox"
        subtitle="Manage cross-channel messages, reviews, comments, and mentions in one place"
      />

      {/* Main Container */}
      <div className="glass rounded-3xl shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] border border-slate-200 dark:border-white/10 bg-white dark:bg-base-900">
        
        {/* Left Column: Conversations Navigation & List */}
        <div className="lg:col-span-5 border-r border-slate-200 dark:border-white/[0.08] flex flex-col">
          
          {/* Top Controls Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white">Conversations</h2>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              {/* Manual Refresh Button */}
              <button
                onClick={triggerManualRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20 disabled:opacity-50"
                title="Only refreshes when clicked"
              >
                <RefreshCw className={cn('h-3.5 w-3.5 text-amber-500', refreshing && 'animate-spin')} />
                {refreshing ? 'Refreshing…' : 'Refresh Inbox'}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by sender, handle, content…"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
            </div>

            {/* Source Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
              {SOURCE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedSource === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedSource(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap transition-all',
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                    )}
                  >
                    <Icon className={cn('h-3 w-3', !isActive && tab.color)} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sub-Filters: Status & Quick Toggles */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setOnlyStarred(!onlyStarred)}
                  className={cn(
                    'p-1.5 rounded-xl border transition',
                    onlyStarred
                      ? 'border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-white/10'
                  )}
                  title="Filter Starred"
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                </button>

                <button
                  onClick={() => setOnlyPinned(!onlyPinned)}
                  className={cn(
                    'p-1.5 rounded-xl border transition',
                    onlyPinned
                      ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-white/10'
                  )}
                  title="Filter Pinned"
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setOnlyUnread(!onlyUnread)}
                  className={cn(
                    'px-2 py-1 rounded-xl border text-[10px] font-bold transition',
                    onlyUnread
                      ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-white/10'
                  )}
                >
                  Unread
                </button>
              </div>
            </div>
          </div>

          {/* Conversations List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">
                No conversations found matching filters.
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConversationId(c.id)}
                    className={cn(
                      'cursor-pointer p-4 transition-all relative flex items-start gap-3',
                      isActive
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-500 dark:bg-amber-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]',
                      c.isUnread && 'bg-slate-50/80 dark:bg-white/[0.01]'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          c.senderAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(c.senderName)}&background=0284c7&color=fff`
                        }
                        alt={c.senderName}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
                      />
                      {c.isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-base-900"></span>
                      )}
                    </div>

                    {/* Meta & Snippet */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getSourceIcon(c.sourceType)}
                          <span className="truncate text-xs font-black text-slate-900 dark:text-white">
                            {c.senderName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="truncate text-xs font-bold text-slate-600 dark:text-slate-400">
                        {c.lastMessageText || 'No messages yet.'}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[9px] font-black uppercase',
                            c.status === 'OPEN' && 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
                            c.status === 'RESOLVED' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                            c.status === 'PENDING' && 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
                            c.status === 'ESCALATED' && 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                          )}
                        >
                          {c.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(c.id);
                            }}
                            className={cn(
                              'p-1 text-slate-400 hover:text-amber-500',
                              c.isStarred && 'text-amber-500'
                            )}
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(c.id);
                            }}
                            className={cn(
                              'p-1 text-slate-400 hover:text-sky-500',
                              c.isPinned && 'text-sky-500'
                            )}
                          >
                            <Pin className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window & Details Pane */}
        <div className="lg:col-span-7 flex flex-col bg-slate-50/50 dark:bg-white/[0.01]">
          {activeConversation ? (
            <>
              {/* Header Bar */}
              <div className="p-4 border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-base-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeConversation.senderAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.senderName)}&background=0284c7&color=fff`
                    }
                    alt={activeConversation.senderName}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {activeConversation.senderName}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {activeConversation.senderHandle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
                        {getSourceIcon(activeConversation.sourceType)}
                        {activeConversation.sourceType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Header Action Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Dropdown */}
                  <select
                    value={activeConversation.status}
                    onChange={(e) => changeStatus(e.target.value as any)}
                    disabled={isViewer}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-200 disabled:opacity-50"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="PENDING">Status: PENDING</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="ESCALATED">Status: ESCALATED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>

                  {/* Assignee Dropdown */}
                  <select
                    value={activeConversation.assignedWorkerId || ''}
                    onChange={(e) => assignWorker(e.target.value, e.target.options[e.target.selectedIndex].text)}
                    disabled={isViewer}
                    className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-black text-slate-800 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-200 disabled:opacity-50"
                  >
                    <option value="">Assign Employee…</option>
                    <option value="worker-rahul">Rahul Sharma (Support Lead)</option>
                    <option value="worker-ananya">Ananya Roy (Customer Success)</option>
                    <option value="worker-shivam">Shivam (Super Admin)</option>
                  </select>
                </div>
              </div>

              {/* Mode Tabs: Messages | Internal Notes | Audit History */}
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-white/[0.08] px-5 bg-white/50 dark:bg-white/[0.01]">
                <button
                  onClick={() => setDetailTab('messages')}
                  className={cn(
                    'py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5',
                    detailTab === 'messages'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Messages ({activeMessages.length})
                </button>

                <button
                  onClick={() => setDetailTab('notes')}
                  className={cn(
                    'py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5',
                    detailTab === 'notes'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  <FileText className="h-3.5 w-3.5 text-amber-500" />
                  Internal Notes ({activeNotes.length})
                </button>

                <button
                  onClick={() => setDetailTab('history')}
                  className={cn(
                    'py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5',
                    detailTab === 'history'
                      ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
                >
                  <History className="h-3.5 w-3.5 text-sky-500" />
                  Audit Trail ({activeHistory.length})
                </button>
              </div>

              {/* Main Tab Content Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {detailTab === 'messages' && (
                  <>
                    {activeMessages.map((msg) => {
                      const isCustomer = msg.senderType === 'CUSTOMER';
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex items-start gap-3 max-w-lg',
                            !isCustomer && 'ml-auto flex-row-reverse'
                          )}
                        >
                          <img
                            src={
                              msg.senderAvatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=0284c7&color=fff`
                            }
                            alt={msg.senderName}
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                          <div
                            className={cn(
                              'rounded-2xl p-4 text-xs font-bold space-y-2 shadow-sm',
                              isCustomer
                                ? 'rounded-tl-none border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-base-900 dark:text-slate-100'
                                : 'rounded-tr-none bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                            )}
                          >
                            <p>{msg.text}</p>

                            {/* Attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                {msg.attachments.map((att, idx) => (
                                  <img
                                    key={idx}
                                    src={att}
                                    alt="attachment"
                                    className="h-16 w-16 rounded-xl object-cover border border-white/20 shadow-sm"
                                  />
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[9px] opacity-75 pt-1">
                              <span>{new Date(msg.sentAt).toLocaleString()}</span>
                              {!isCustomer && (
                                <span className="flex items-center gap-1 font-black">
                                  {msg.readStatus === 'READ' ? (
                                    <>
                                      <CheckCheck className="h-3 w-3 text-slate-950" /> Read
                                    </>
                                  ) : (
                                    'Delivered'
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic py-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                        Agent is typing a response…
                      </div>
                    )}
                  </>
                )}

                {/* Internal Notes Tab */}
                {detailTab === 'notes' && (
                  <div className="space-y-3">
                    {activeNotes.length === 0 ? (
                      <div className="p-6 text-center text-xs font-bold text-slate-500">
                        No internal notes added yet. Use the composer below to add notes.
                      </div>
                    ) : (
                      activeNotes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-bold text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-black text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-amber-500" />
                              {note.authorName}
                            </span>
                            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                              {new Date(note.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p>{note.noteText}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Audit History Tab */}
                {detailTab === 'history' && (
                  <div className="space-y-3">
                    {activeHistory.length === 0 ? (
                      <div className="p-6 text-center text-xs font-bold text-slate-500">
                        No audit history recorded.
                      </div>
                    ) : (
                      activeHistory.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-xs dark:border-white/10 dark:bg-base-900"
                        >
                          <History className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 dark:text-white uppercase text-[10px]">
                                {h.action}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                {new Date(h.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{h.details}</p>
                            <span className="text-[10px] text-slate-400 block">By: {h.actorName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Reply / Internal Note Composer */}
              <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-base-900 space-y-3">
                
                {/* Composer Controls */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Mode Toggle: Public Reply vs Internal Note */}
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
                    <button
                      onClick={() => setComposerMode('reply')}
                      disabled={isViewer}
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-black transition',
                        composerMode === 'reply'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      )}
                    >
                      Public Reply
                    </button>
                    <button
                      onClick={() => setComposerMode('note')}
                      disabled={isViewer}
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-black transition',
                        composerMode === 'note'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      )}
                    >
                      Internal Note
                    </button>
                  </div>

                  {/* Reply Templates Selector */}
                  {composerMode === 'reply' && (
                    <select
                      value={selectedTemplateId}
                      onChange={handleSelectTemplate}
                      disabled={isViewer}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      <option value="">Insert Reply Template…</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Attached File Preview */}
                {attachedFiles.length > 0 && (
                  <div className="flex items-center gap-2">
                    {attachedFiles.map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={f} alt="preview" className="h-12 w-12 rounded-xl object-cover border border-amber-500" />
                        <button
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 rounded-full bg-rose-500 p-0.5 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input Text Box & Attachment Button */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {composerMode === 'reply' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isViewer}
                      className="p-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                      title="Attach Image"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  )}

                  <input
                    type="text"
                    value={composerInput}
                    onChange={(e) => setComposerInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isViewer}
                    placeholder={
                      isViewer
                        ? 'Read-only viewer account'
                        : composerMode === 'reply'
                        ? `Reply directly to ${activeConversation.senderName} on ${activeConversation.platform}…`
                        : 'Add an internal note visible to team members only…'
                    }
                    className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 disabled:opacity-50"
                  />

                  <button
                    onClick={handleSend}
                    disabled={isViewer || (!composerInput.trim() && attachedFiles.length === 0)}
                    className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50 shrink-0"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {composerMode === 'reply' ? 'Send Reply' : 'Add Note'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-xs font-bold text-slate-500">
              Select a conversation to inspect thread details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
