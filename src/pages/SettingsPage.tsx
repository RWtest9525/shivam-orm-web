import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConnections, useReplyTemplates } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { PLATFORMS } from '@/data/constants';
import type { PlatformId } from '@/types';
import { cn } from '@/lib/utils';
import {
  Smartphone, ShoppingCart, Instagram, Linkedin, MessageCircle, Store,
  KeyRound, CheckCircle2, Loader2, Plus, Trash2, FileText, AlertCircle,
  ShieldCheck, Radio, MessageSquare, ExternalLink, Zap
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
  const [accountName, setAccountName] = useState('DreamApps Play Store Production');
  const [packageName, setPackageName] = useState('com.hoora.customer');
  const [apiKey, setApiKey] = useState('');
  const [apiMode, setApiMode] = useState<'google_console' | 'reviews_world_scraper'>('google_console');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Template form
  const [tplTitle, setTplTitle] = useState('');
  const [tplBody, setTplBody] = useState('');
  const [tplSentiment, setTplSentiment] = useState<string>('');

  const connection = connections.find((c) => c.platform === activePlatform);

  // Sync state when connection or active platform changes
  useEffect(() => {
    const conn = connections.find((c) => c.platform === activePlatform);
    if (conn) {
      setAccountName(conn.account_name || 'DreamApps Play Store Production');
      setApiMode(conn.api_mode || 'google_console');
      setPackageName(conn.app_package_name || 'com.hoora.customer');
      setApiKey(conn.api_key || '');
    } else {
      setAccountName('DreamApps Play Store Production');
      setApiMode('google_console');
      setPackageName('com.hoora.customer');
      setApiKey('');
    }
    setJsonError('');
    setSavedMsg('');
  }, [activePlatform, connections]);

  // Validate JSON if in Official Google Play Console Service Account mode
  function validateJsonInput(val: string): boolean {
    if (apiMode === 'reviews_world_scraper') return true;
    if (!val.trim()) {
      setJsonError('Service Account JSON Key is required for Official Play Console mode.');
      return false;
    }
    try {
      JSON.parse(val);
      setJsonError('');
      return true;
    } catch {
      setJsonError('Invalid JSON format. Please paste a valid Google Play Console Service Account JSON object.');
      return false;
    }
  }

  async function handleSaveConnection() {
    if (!accountName.trim()) return;

    if (apiMode === 'google_console') {
      const isValid = validateJsonInput(apiKey);
      if (!isValid) return;
    }

    setSaving(true);
    setSavedMsg('');
    try {
      await upsertConnection({
        platform: activePlatform,
        account_name: accountName.trim(),
        api_key: apiMode === 'google_console' ? apiKey.trim() : 'rw_scraper_live_active',
        access_token: '',
        refresh_token: '',
        status: 'connected',
        api_mode: apiMode,
        reply_enabled: apiMode === 'google_console',
        dropped_review_tracking: apiMode === 'google_console',
        app_package_name: packageName.trim() || 'com.hoora.customer',
      });

      setSavedMsg(
        apiMode === 'google_console'
          ? 'Official Google Play Console Service Account connected! Direct reply capability active.'
          : 'Reviews World Scraper Mode Active! Saved successfully in view-only scraper mode.'
      );
    } catch (e: any) {
      setSavedMsg(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(id: string) {
    await deleteConnection(id);
    setSavedMsg('Platform connection removed.');
    setApiKey('');
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Settings & API Key Management"
        subtitle="Configure Play Store connection modes, app package parameters, and social media integration"
      />

      {/* Main Connection Setup Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-accent-600 dark:text-accent-400" /> Platform Connections & API Key Setup
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Select platform and configure connection mode parameters.
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {PLATFORMS.map((p) => {
            const Icon = ICONS[p.id];
            const isConn = connections.some((c) => c.platform === p.id);
            return (
              <button
                key={p.id}
                onClick={() => setActivePlatform(p.id)}
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

        {/* Active Connection Info Pill */}
        {connection && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:bg-emerald-500/10 dark:border-emerald-500/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  Active Connection: {connection.account_name}
                </p>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Mode: {connection.api_mode === 'reviews_world_scraper' ? 'Reviews World Scraper Mode (View-Only)' : 'Official Play Console Service Account'}
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

        {/* 1. Radio Selection Cards for Connection Mode */}
        {activePlatform === 'playstore' && (
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Connection Mode Selection
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option A: Official Play Console */}
              <div
                onClick={() => { setApiMode('google_console'); setJsonError(''); }}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4.5 transition-all duration-200',
                  apiMode === 'google_console'
                    ? 'border-accent-500 bg-accent-50/70 shadow-sm dark:border-accent-400 dark:bg-accent-500/15'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Official Play Console Service Account
                  </span>
                  <input type="radio" name="api_mode" checked={apiMode === 'google_console'} readOnly className="accent-accent-500 h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  Full review sync, direct reply posting capability, and dropped review detection. Requires Service Account JSON key.
                </p>
              </div>

              {/* Option B: Reviews World API (Scraper Mode) */}
              <div
                onClick={() => { setApiMode('reviews_world_scraper'); setJsonError(''); }}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4.5 transition-all duration-200',
                  apiMode === 'reviews_world_scraper'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm dark:border-amber-400 dark:bg-amber-500/15'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.02]'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Reviews World API (Scraper Mode)
                  </span>
                  <input type="radio" name="api_mode" checked={apiMode === 'reviews_world_scraper'} readOnly className="accent-amber-500 h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  Live public rating fetcher. View-only mode — no JSON credential or API key input required!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Dynamic Input Fields & Dynamic Info Banners */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Account Label / App Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. DreamApps Play Store Production"
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
                  placeholder="e.g. com.hoora.customer"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Render JSON Textarea ONLY in Official Google Play Console Mode */}
          {apiMode === 'google_console' && (
            <div className="space-y-1.5 transition-all duration-200">
              <label className="mb-1 flex items-center justify-between text-xs font-extrabold text-slate-900 dark:text-slate-100">
                <span>Google Play Console Service Account JSON Credential</span>
                <span className="text-[10px] text-accent-600 dark:text-accent-400">JSON Format Required</span>
              </label>
              <textarea
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); validateJsonInput(e.target.value); }}
                rows={4}
                placeholder='{"type": "service_account", "project_id": "shivam-orm", "private_key_id": "...", "private_key": "..."}'
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              {jsonError && (
                <p className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {jsonError}
                </p>
              )}
            </div>
          )}

          {/* Dynamic Info Banners */}
          {apiMode === 'reviews_world_scraper' ? (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs font-bold text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 shadow-sm transition-all duration-200">
              <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                ⚡ <strong>Reviews World Scraper Mode Active:</strong> Fetching live public Play Store reviews in view-only mode. Direct reply posting is disabled until official Google Play Console Service Account is linked.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-xs font-bold text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 shadow-sm transition-all duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                ✅ <strong>Official Integration Active:</strong> Full review sync, dropped review detection, and direct reply capability enabled.
              </span>
            </div>
          )}

          {savedMsg && (
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-xl border p-3 text-xs font-bold',
                savedMsg.startsWith('Error')
                  ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              )}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {savedMsg}
            </div>
          )}

          <button
            onClick={handleSaveConnection}
            disabled={saving || !accountName.trim() || (apiMode === 'google_console' && !apiKey.trim())}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-6 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {connection ? 'Update Connection Settings' : 'Save & Connect Platform'}
          </button>
        </div>
      </div>

      {/* Social Media Integration Section */}
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
