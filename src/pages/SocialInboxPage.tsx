import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocialMessages } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import {
  Instagram, Linkedin, MessageCircle, MessageSquare, Send, CheckCheck,
  Search, Filter, User, Sparkles
} from 'lucide-react';

export function SocialInboxPage() {
  const { client } = useAuth();
  const { messages, replyToSocialMessage } = useSocialMessages(client?.id);

  const [activeMessageId, setActiveMessageId] = useState<string>(messages[0]?.id || '');
  const [replyInput, setReplyInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeMsg = messages.find((m) => m.id === activeMessageId) || messages[0];

  async function handleSendReply() {
    if (!activeMsg || !replyInput.trim()) return;
    await replyToSocialMessage(activeMsg.id, replyInput.trim());
    setReplyInput('');
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="h-4 w-4 text-pink-400" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4 text-sky-400" />;
      case 'reddit':
        return <MessageSquare className="h-4 w-4 text-amber-400" />;
      default:
        return <MessageCircle className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Media Live Messenger"
        subtitle="Unified cross-platform direct messaging for Instagram, LinkedIn, Reddit, and WhatsApp"
      />

      <div className="glass rounded-2xl shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] border">
        {/* Left Column: Messages List */}
        <div className="lg:col-span-5 border-r border-white/[0.08] light:border-slate-200 flex flex-col">
          {/* Search bar */}
          <div className="p-3 border-b border-white/[0.08] light:border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] light:divide-slate-200 no-scrollbar">
            {filteredMessages.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No conversations found.</p>
            ) : (
              filteredMessages.map((m) => {
                const isActive = m.id === activeMsg?.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMessageId(m.id)}
                    className={cn(
                      'cursor-pointer p-4 transition-all flex items-start gap-3',
                      isActive
                        ? 'bg-accent-500/15 border-l-4 border-l-accent-400 light:bg-accent-50'
                        : 'hover:bg-white/[0.02] light:hover:bg-slate-50'
                    )}
                  >
                    <img
                      src={m.sender_avatar}
                      alt={m.sender_name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getPlatformIcon(m.platform)}
                          <span className="truncate text-xs font-bold text-slate-100 light:text-slate-900">
                            {m.sender_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-400 light:text-slate-600">{m.message_text}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-7 flex flex-col bg-white/[0.01] light:bg-white">
          {activeMsg ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/[0.08] flex items-center justify-between light:border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={activeMsg.sender_avatar}
                    alt={activeMsg.sender_name}
                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100 light:text-slate-900">{activeMsg.sender_name}</span>
                      <span className="text-xs text-slate-400">{activeMsg.sender_handle}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-300 capitalize">
                        {getPlatformIcon(activeMsg.platform)} {activeMsg.platform} DM
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {/* Incoming message */}
                <div className="flex items-start gap-3 max-w-md">
                  <img
                    src={activeMsg.sender_avatar}
                    alt={activeMsg.sender_name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="rounded-2xl rounded-tl-none border border-white/10 bg-white/5 p-3.5 text-xs text-slate-200 light:bg-slate-100 light:border-slate-200 light:text-slate-900">
                    <p>{activeMsg.message_text}</p>
                    <span className="mt-1.5 block text-[9px] text-slate-500">
                      {new Date(activeMsg.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Reply message if exists */}
                {activeMsg.reply_text && (
                  <div className="flex items-end justify-end gap-2">
                    <div className="max-w-md rounded-2xl rounded-tr-none bg-gradient-to-r from-accent-500/20 to-electric-600/20 border border-accent-500/30 p-3.5 text-xs text-accent-100 light:bg-accent-100 light:text-accent-900">
                      <p>{activeMsg.reply_text}</p>
                      <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-accent-400">
                        <span>{activeMsg.replied_at ? new Date(activeMsg.replied_at).toLocaleTimeString() : 'Sent'}</span>
                        <CheckCheck className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-white/[0.08] light:border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder={`Reply directly to ${activeMsg.sender_name} on ${activeMsg.platform}…`}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyInput.trim()}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2.5 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-xs text-slate-500">
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
