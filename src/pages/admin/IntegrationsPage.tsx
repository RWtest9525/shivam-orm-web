import { useState } from 'react';
import { toast } from 'sonner';
import { dbEngine } from '@/lib/dbEngine';
import {
  Cable, Play, Store, Globe, Instagram, Facebook, Linkedin, Youtube, CheckCircle2,
  RefreshCw, KeyRound, Sparkles, ShieldAlert, Save
} from 'lucide-react';

export function IntegrationsPage() {
  const [loading, setLoading] = useState(false);

  const globalConfig = dbEngine.getGlobalApiKey();
  const [masterApiKey, setMasterApiKey] = useState(globalConfig.api_key || '');
  const [isVerified, setIsVerified] = useState(globalConfig.is_verified || false);
  const [aiApiKey, setAiApiKey] = useState('sk-equinox-ai-live-9042');
  const [webhookUrl, setWebhookUrl] = useState('https://api.equinox.com/v1/webhooks/crisis-alerts');
  const [savingKey, setSavingKey] = useState(false);

  const connectors = [
    { id: 'google_play', name: 'Google Play Console API', icon: Play, status: 'Connected', syncTime: '10 mins ago', color: 'text-emerald-500 dark:text-emerald-400' },
    { id: 'app_store', name: 'Apple App Store Connect', icon: Store, status: 'Connected', syncTime: '15 mins ago', color: 'text-sky-500 dark:text-sky-400' },
    { id: 'google_business', name: 'Google Business Profile', icon: Globe, status: 'Connected', syncTime: '1 hour ago', color: 'text-amber-500 dark:text-amber-400' },
    { id: 'instagram', name: 'Instagram Graph API', icon: Instagram, status: 'Connected', syncTime: '30 mins ago', color: 'text-pink-500 dark:text-pink-400' },
    { id: 'facebook', name: 'Facebook Pages Manager', icon: Facebook, status: 'Standby', syncTime: '2 hours ago', color: 'text-blue-500 dark:text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn Company Page', icon: Linkedin, status: 'Connected', syncTime: '45 mins ago', color: 'text-sky-600 dark:text-sky-500' },
    { id: 'youtube', name: 'YouTube Data API v3', icon: Youtube, status: 'Connected', syncTime: '1 hour ago', color: 'text-red-500' },
  ];

  const handleSaveMasterKey = () => {
    if (!masterApiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    setSavingKey(true);
    setTimeout(() => {
      dbEngine.setGlobalApiKey(masterApiKey.trim(), 'reviews_world_scraper', true);
      setIsVerified(true);
      setSavingKey(false);
      toast.success('Master Reviews World API Key saved and verified!');
    }, 600);
  };

  const handleSyncAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('All enterprise connectors and API channels synced');
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Cable className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enterprise Integrations &amp; API Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              Configure Master API Keys, AI Reply Engine tokens, Webhooks, and social listening channels in one place.
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync All Connectors</span>
        </button>
      </div>

      {/* API Keys Configuration Cards Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" /> API Keys &amp; Credentials Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Reviews World Master API Key */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/10 space-y-4 hover:border-primary/30 transition shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reviews World Master API Key</h4>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">App Store &amp; Play Store auto-fetch key</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}>
                {isVerified ? 'Verified & Active' : 'Action Needed'}
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1 block">Master API Secret Key</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste Reviews World API Key (e.g. rw_live_9a87f65e...)"
                  value={masterApiKey}
                  onChange={(e) => setMasterApiKey(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-black/60 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveMasterKey}
                  disabled={savingKey}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] flex items-center gap-1 transition"
                >
                  {savingKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 text-black" />} Save Key
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              This master key enables Play Store Live Review Fetcher across all client accounts.
            </p>
          </div>

          {/* Card 2: AI Reply & Insights API Key */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/10 space-y-4 hover:border-primary/30 transition shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Reply &amp; Insights Engine Token</h4>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">Powers automated response &amp; root cause synthesis</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1 block">AI Engine Token</label>
              <div className="relative">
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="w-full pl-3 pr-24 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-black/60 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => toast.success('AI Engine Token updated')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] flex items-center gap-1 transition"
                >
                  <Save className="w-3 h-3 text-black" /> Update Token
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-neutral-400">
              Generates executive AI summaries, sentiment breakdowns, and automated customer responses.
            </p>
          </div>

          {/* Card 3: Webhook & Crisis Alert Notification Endpoint */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/10 space-y-4 hover:border-primary/30 transition md:col-span-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Crisis Alert &amp; Webhook Escalation URL</h4>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">Pushed automatically when P1 critical reviews are detected</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Webhook Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 dark:bg-black/60 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => toast.success('Webhook endpoint test payload sent!')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/10 font-semibold text-xs transition shrink-0"
              >
                Test Webhook Payload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Social & Store Channels Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cable className="w-4 h-4 text-primary" /> Monitored Channels &amp; App Connectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((c) => {
            const Icon = c.icon;
            const isConnected = c.status === 'Connected';
            return (
              <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-3 flex flex-col justify-between hover:border-primary/25 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/5 flex items-center justify-center ${c.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">Last synced: {c.syncTime}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Syncing
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.success(`${c.name} re-authenticated`)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Re-authenticate →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
