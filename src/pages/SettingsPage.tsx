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
  ShieldCheck, Radio, MessageSquare, ExternalLink
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          ? 'Google Play Console Service Account connected! Direct reply enabled.'
          : 'Reviews World Scraper API connected! Live scraper mode active.'
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Settings & API Key Management"
        subtitle="Configure Play Store API Key modes, linked social media accounts, and canned reply templates"
      />

      {/* Modern, Clean API Key Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent-600 dark:text-accent-400" /> Platform Connections & API Key Setup
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Select platform and enter your credentials to enable real-time reviews & direct replies.
            </p>
          </div>
        </div>

        {/* Platform Selection Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PLATFORMS.map((p) => {
            const Icon = ICONS[p.id];
            const isConn = connections.some((c) => c.platform === p.id);
            return (
              <button
                key={p.id}
                onClick={() => selectPlatform(p.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all border',
                  activePlatform === p.id
                    ? 'border-accent-500 bg-accent-50 text-accent-900 dark:border-accent-400 dark:bg-accent-500/20 dark:text-accent-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {p.label}
                {isConn && <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {connection && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:bg-emerald-500/10 dark:border-emerald-500/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  Active Connection: {connection.account_name}
                </p>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Mode: {connection.api_mode === 'google_console' ? 'Official Google Play Console Service Account' : 'Reviews World Live Scraper API'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDisconnect(connection.id)}
              className="rounded-xl border border-rose-300 bg-rose-100 px-3.5 py-1.5 text-xs font-black text-rose-800 transition hover:bg-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <Trash2 className="inline h-3.5 w-3.5 mr-1" /> Disconnect
            </button>
          </div>
        )}

        {/* Play Store API Mode selector */}
        {activePlatform === 'playstore' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setApiMode('google_console')}
              className={cn(
                'cursor-pointer rounded-2xl border p-4 transition-all',
                apiMode === 'google_console'
                  ? 'border-accent-500 bg-accent-50/60 dark:border-accent-400 dark:bg-accent-500/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Official Play Console Service Account
                </span>
                <input type="radio" checked={apiMode === 'google_console'} readOnly className="accent-accent-500" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                Full review sync, direct reply posting, and dropped review tracking.
              </p>
            </div>

            <div
              onClick={() => setApiMode('reviews_world_scraper')}
              className={cn(
                'cursor-pointer rounded-2xl border p-4 transition-all',
                apiMode === 'reviews_world_scraper'
                  ? 'border-amber-500 bg-amber-50/60 dark:border-amber-400 dark:bg-amber-500/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Reviews World API (Scraper Mode)
                </span>
                <input type="radio" checked={apiMode === 'reviews_world_scraper'} readOnly className="accent-amber-500" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                Fetches live public Play Store reviews (View-only, direct reply disabled).
              </p>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Account Label / App Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Production Mobile App"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
            />
          </div>

          {activePlatform === 'playstore' && (
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">App Package Name</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. com.dreamapps.mobile"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">API Key / Service Account JSON Credential</label>
          <textarea
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            rows={3}
            placeholder={apiMode === 'google_console' ? 'Paste Google Play Console Service Account JSON Key...' : 'Paste Reviews World API Scraper Key...'}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
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
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-6 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {connection ? 'Update Connection Credentials' : 'Save & Connect Platform'}
        </button>
      </div>

      {/* Social Media Direct Messaging Hub Link */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" /> Social Media Live Direct Messaging & Reply Hub
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Receive tags, comments, and DMs from Instagram, LinkedIn, Reddit, and WhatsApp — reply directly from Shivam ORM!
            </p>
          </div>
          <Link
            to="/app/social-inbox"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500/20 px-4 py-2 text-xs font-black text-accent-900 hover:bg-accent-500/30 dark:text-accent-300"
          >
            Open Direct Social DMs Hub <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 dark:border-white/10 dark:bg-white/[0.02]">
            <Instagram className="h-7 w-7 text-pink-500 shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Instagram DMs</p>
              <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (@dreamapps)</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 dark:border-white/10 dark:bg-white/[0.02]">
            <Linkedin className="h-7 w-7 text-sky-500 shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">LinkedIn Inquiries</p>
              <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (DreamApps Tech)</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 dark:border-white/10 dark:bg-white/[0.02]">
            <MessageSquare className="h-7 w-7 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">Reddit Mentions</p>
              <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Connected (r/DreamApps)</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex items-center gap-3 dark:border-white/10 dark:bg-white/[0.02]">
            <MessageCircle className="h-7 w-7 text-emerald-500 shrink-0" />
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-slate-100">WhatsApp Leads</p>
              <p className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">● Business API Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Canned Reply Templates */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
        <div className="border-b border-slate-200 pb-4 dark:border-white/10">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent-600 dark:text-accent-400" /> Canned Response Templates
          </h2>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
            Pre-saved text templates for 1-click replies to Play Store reviews and Social DMs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={tplTitle}
            onChange={(e) => setTplTitle(e.target.value)}
            placeholder="Template Title (e.g. 5-Star Appreciation)"
            className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
          <input
            type="text"
            value={tplBody}
            onChange={(e) => setTplBody(e.target.value)}
            placeholder="Response body text with optional {author_name}"
            className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
          />
          <button
            onClick={handleAddTemplate}
            disabled={!tplTitle.trim() || !tplBody.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Save Canned Template
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {templates.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-100">{t.title}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 line-clamp-2">"{t.body}"</p>
                </div>
                <button onClick={() => deleteTemplate(t.id)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
