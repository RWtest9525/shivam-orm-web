import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConnections, useReplyTemplates } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { PLATFORMS } from '@/data/constants';
import type { PlatformId } from '@/types';
import { cn } from '@/lib/utils';
import {
  Smartphone, ShoppingCart, Instagram, Linkedin, MessageCircle, Store,
  KeyRound, CheckCircle2, XCircle, Loader2, Plus, Trash2, FileText, Link2, AlertCircle,
  ShieldCheck, Radio, MessageSquare
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

export function SettingsPage() {
  const { client } = useAuth();
  const { connections, upsertConnection, deleteConnection } = useConnections(client?.id);
  const { templates, addTemplate, deleteTemplate } = useReplyTemplates(client?.id);

  const [activePlatform, setActivePlatform] = useState<PlatformId>('playstore');
  const [accountName, setAccountName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiMode, setApiMode] = useState<'google_console' | 'reviews_world_scraper'>('google_console');
  const [packageName, setPackageName] = useState('com.dreamapps.mobile');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  // Template form
  const [tplTitle, setTplTitle] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplSentiment, setTplSentiment] = useState<string>('');

  const connection = connections.find((c) => c.platform === activePlatform);

  async function handleSaveConnection() {
    if (!accountName.trim() || !apiKey.trim()) return;
    setSaving(true);
    setSavedMsg('');
    try {
      await upsertConnection({
        platform: activePlatform,
        account_name: accountName.trim(),
        api_key: apiKey.trim(),
        access_token: '',
        refresh_token: '',
        status: 'connected',
        api_mode: apiMode,
        reply_enabled: apiMode === 'google_console',
        dropped_review_tracking: apiMode === 'google_console',
        app_package_name: packageName.trim(),
      });
      setSavedMsg(
        apiMode === 'google_console'
          ? 'Google Play Console Service Account connected! Live reply & dropped review tracking enabled.'
          : 'Reviews World Scraper API connected! Live scraper mode active (Reply & Dropped tracking disabled).'
      );
      setApiKey('');
    } catch (e: any) {
      setSavedMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(id: string) {
    await deleteConnection(id);
    setSavedMsg('Platform account disconnected.');
    setAccountName('');
  }

  async function handleAddTemplate() {
    if (!tplTitle.trim() || !tplBody.trim()) return;
    try {
      await addTemplate(tplTitle.trim(), tplBody.trim(), (tplSentiment || null) as any);
      setTplTitle('');
      setTplBody('');
      setTplSentiment('');
    } catch (e) {
      console.error(e);
    }
  }

  function selectPlatform(p: PlatformId) {
    setActivePlatform(p);
    setSavedMsg('');
    const conn = connections.find((c) => c.platform === p);
    setAccountName(conn?.account_name ?? '');
    setApiMode(conn?.api_mode ?? 'google_console');
    setPackageName(conn?.app_package_name ?? 'com.dreamapps.mobile');
    setApiKey('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & API Key Management"
        subtitle="Configure Play Store API Key modes, linked social media accounts, and reply templates"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Platform connections & API Modes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main API Card */}
          <div className="glass rounded-2xl shadow-card overflow-hidden border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <Link2 className="h-5 w-5 text-accent-600 dark:text-accent-400" /> Platform Connections & Mode Management
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                Choose between Official Google Play Console Service Account or Reviews World Live Scraper API
              </p>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3 no-scrollbar dark:border-white/[0.08]">
              {PLATFORMS.map((p) => {
                const Icon = ICONS[p.id];
                const isConn = connections.some((c) => c.platform === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => selectPlatform(p.id)}
                    className={cn(
                      'flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all',
                      activePlatform === p.id
                        ? 'bg-accent-500/20 text-accent-900 border border-accent-300 dark:border-transparent dark:text-accent-300 dark:bg-accent-500/20'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {p.short}
                    {isConn && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Connection Details & API Mode Switcher */}
            <div className="p-5 space-y-5">
              {connection && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 dark:bg-emerald-500/10 dark:border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                        Active Connection: {connection.account_name}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        Mode: {connection.api_mode === 'google_console' ? 'Official Play Console API' : 'Reviews World Scraper API'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(connection.id)}
                    className="rounded-lg border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800 transition hover:bg-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    <Trash2 className="inline h-3.5 w-3.5 mr-1" /> Disconnect
                  </button>
                </div>
              )}

              {/* Special Mode Switcher for Play Store */}
              {activePlatform === 'playstore' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Select Integration Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Mode 1: Official Google Play Console */}
                    <div
                      onClick={() => setApiMode('google_console')}
                      className={cn(
                        'cursor-pointer rounded-xl border p-4 transition-all',
                        apiMode === 'google_console'
                          ? 'border-accent-500 bg-accent-50 text-slate-900 dark:border-accent-400 dark:bg-accent-500/10 dark:text-slate-100'
                          : 'border-slate-300 bg-white hover:border-slate-400 dark:border-white/10 dark:bg-white/[0.02]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-black">Google Play Console API</span>
                        </div>
                        <input type="radio" checked={apiMode === 'google_console'} readOnly className="accent-accent-500" />
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Official Google Service Account JSON key integration.
                      </p>
                      <div className="mt-3 space-y-1 text-[10px] font-bold">
                        <p className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Live Play Store review sync</p>
                        <p className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Direct Reply to reviews (Zero glitches)</p>
                        <p className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Dropped / Removed review tracking</p>
                      </div>
                    </div>

                    {/* Mode 2: Reviews World Live Management API Key */}
                    <div
                      onClick={() => setApiMode('reviews_world_scraper')}
                      className={cn(
                        'cursor-pointer rounded-xl border p-4 transition-all',
                        apiMode === 'reviews_world_scraper'
                          ? 'border-amber-500 bg-amber-50 text-slate-900 dark:border-amber-400 dark:bg-amber-500/10 dark:text-slate-100'
                          : 'border-slate-300 bg-white hover:border-slate-400 dark:border-white/10 dark:bg-white/[0.02]'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span className="text-xs font-black">Reviews World API (Scraper)</span>
                        </div>
                        <input type="radio" checked={apiMode === 'reviews_world_scraper'} readOnly className="accent-amber-500" />
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        Live scraper API mode for fetching public store ratings.
                      </p>
                      <div className="mt-3 space-y-1 text-[10px] font-bold">
                        <p className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Live public review fetching</p>
                        <p className="text-rose-700 dark:text-rose-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Reply option disabled (Read-only)</p>
                        <p className="text-rose-700 dark:text-rose-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> Dropped reviews not tracked</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Account Name / Label</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. My App Play Console Production Account"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  />
                </div>

                {activePlatform === 'playstore' && (
                  <div>
                    <label className="mb-1.5 block text-xs font-extrabold text-slate-900 dark:text-slate-100">App Package Name</label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="e.g. com.company.app"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    <KeyRound className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                    {apiMode === 'google_console' ? 'Google Play Console Service Account JSON / Private Key' : 'Reviews World API Access Key'}
                  </label>
                  <textarea
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    rows={4}
                    placeholder={
                      apiMode === 'google_console'
                        ? '{"type": "service_account", "project_id": "shivam-orm", "private_key_id": "...", ...}'
                        : 'rw_live_scraper_key_88921471029381'
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  />
                </div>

                {savedMsg && (
                  <div
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border p-3 text-xs font-bold',
                      savedMsg.startsWith('Error')
                        ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                    )}
                  >
                    {savedMsg.startsWith('Error') ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {savedMsg}
                  </div>
                )}

                <button
                  onClick={handleSaveConnection}
                  disabled={saving || !accountName.trim() || !apiKey.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {connection ? 'Update Connection Credentials' : 'Save & Connect Platform'}
                </button>
              </div>
            </div>
          </div>

          {/* Social Media Integration Section */}
          <div className="glass rounded-2xl shadow-card overflow-hidden border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <Instagram className="h-5 w-5 text-pink-500" /> Linked Social Accounts (Direct Messaging Integration)
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                Connect your social accounts so clients can view and reply to DMs directly inside Shivam ORM
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Instagram className="h-6 w-6 text-pink-500" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">Instagram DMs & Comments</p>
                    <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (@dreamapps_official)</p>
                  </div>
                </div>
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200">
                  Manage
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <Linkedin className="h-6 w-6 text-sky-500" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">LinkedIn Page Inquiries</p>
                    <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (DreamApps Tech)</p>
                  </div>
                </div>
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200">
                  Manage
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-emerald-500" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">WhatsApp Business API</p>
                    <p className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">● Pending Setup</p>
                  </div>
                </div>
                <button className="rounded-lg bg-accent-500/20 px-3 py-1 text-[11px] font-extrabold text-accent-900 dark:text-accent-300">
                  Connect
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">Reddit Brand Mentions</p>
                    <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (r/DreamApps)</p>
                  </div>
                </div>
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-[11px] font-extrabold text-slate-800 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-200">
                  Manage
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reply templates card */}
        <div>
          <div className="glass rounded-2xl shadow-card overflow-hidden border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <FileText className="h-5 w-5 text-accent-600 dark:text-accent-400" /> Canned Reply Templates
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                Save response snippets for 1-click review replies
              </p>
            </div>
            <div className="p-5 space-y-4">
              {/* Form */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={tplTitle}
                  onChange={(e) => setTplTitle(e.target.value)}
                  placeholder="Template Title (e.g. 5-Star Appreciation)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
                <textarea
                  value={tplBody}
                  onChange={(e) => setTplBody(e.target.value)}
                  rows={3}
                  placeholder="Response body text with optional {author_name} variable..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
                <select
                  value={tplSentiment}
                  onChange={(e) => setTplSentiment(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                >
                  <option value="">Target Sentiment: Any</option>
                  <option value="positive">Positive (5-Star)</option>
                  <option value="neutral">Neutral (3-Star)</option>
                  <option value="negative">Negative (1-2 Star)</option>
                  <option value="crisis">Crisis / Payment Bug</option>
                </select>
                <button
                  onClick={handleAddTemplate}
                  disabled={!tplTitle.trim() || !tplBody.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-300 bg-accent-50 py-2.5 text-xs font-black text-accent-900 transition hover:bg-accent-100 disabled:opacity-50 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300"
                >
                  <Plus className="h-4 w-4" /> Save Canned Template
                </button>
              </div>

              {/* Template list */}
              <div className="space-y-2.5 pt-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Saved Templates ({templates.length})</p>
                {templates.length === 0 ? (
                  <p className="py-6 text-center text-xs font-bold text-slate-500">No canned templates created yet.</p>
                ) : (
                  templates.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.02]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-900 dark:text-slate-100">{t.title}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">{t.body}</p>
                          {t.sentiment && (
                            <span className="mt-2 inline-block rounded-full bg-accent-500/20 px-2.5 py-0.5 text-[9px] font-black capitalize text-accent-800 dark:text-accent-300">
                              {t.sentiment}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="shrink-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
