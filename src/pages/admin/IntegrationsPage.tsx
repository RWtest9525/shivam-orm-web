import { useState } from 'react';
import { toast } from 'sonner';
import { dbEngine, validateReviewsWorldHandshake, type ReviewsWorldQuotaDetails } from '@/lib/dbEngine';
import {
  Cable, Play, Store, Globe, Instagram, Facebook, Linkedin, Youtube, CheckCircle2,
  RefreshCw, KeyRound, ShieldAlert, Save, X, Loader2, AlertCircle, Server, Activity
} from 'lucide-react';

export function IntegrationsPage() {
  const [loading, setLoading] = useState(false);

  // Global Reviews World API State
  const [globalConfig, setGlobalConfig] = useState(() => dbEngine.getGlobalApiKey());

  // Modal State for Reviews World API authentication
  const [showRwModal, setShowRwModal] = useState(false);
  const [baseUrl, setBaseUrl] = useState(globalConfig.base_url || 'https://yash9525-rw-live-checker.hf.space');
  const [apiKeyInput, setApiKeyInput] = useState(globalConfig.api_key || '');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleSyncAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGlobalConfig(dbEngine.getGlobalApiKey());
      toast.success('All enterprise connectors and API channels synced');
    }, 900);
  };

  const handleAuthenticateReviewsWorld = async () => {
    setAuthError('');
    setAuthSuccess('');

    if (!apiKeyInput.trim()) {
      setAuthError('HTTP 401 Unauthorized: API secret key cannot be empty.');
      return;
    }

    setVerifying(true);

    try {
      // Perform strict server handshake check (HTTP 200 OK required)
      const res = await validateReviewsWorldHandshake(baseUrl, apiKeyInput);

      if (!res.isValid || res.statusCode !== 200) {
        setAuthError(res.error || `HTTP ${res.statusCode || 401} Unauthorized: Invalid API key or unverified provider endpoint.`);
        return;
      }

      // Success HTTP 200 OK
      dbEngine.setGlobalApiKey(
        apiKeyInput.trim(),
        'reviews_world_scraper',
        true,
        baseUrl.trim(),
        new Date().toISOString(),
        res.quotaDetails
      );

      const updated = dbEngine.getGlobalApiKey();
      setGlobalConfig(updated);
      setAuthSuccess('Handshake Successful! Verified Reviews World API connection (HTTP 200 OK).');
      toast.success('Reviews World API verified and connected successfully!');
      
      setTimeout(() => {
        setShowRwModal(false);
        setAuthSuccess('');
      }, 1000);
    } catch (err: any) {
      setAuthError(`Connection Error: ${err.message || 'Failed to establish handshake with API server.'}`);
    } finally {
      setVerifying(false);
    }
  };

  const connectors = [
    { id: 'google_play', name: 'Google Play Console API', icon: Play, status: 'Connected', syncTime: '10 mins ago', color: 'text-emerald-500 dark:text-emerald-400' },
    { id: 'app_store', name: 'Apple App Store Connect', icon: Store, status: 'Connected', syncTime: '15 mins ago', color: 'text-sky-500 dark:text-sky-400' },
    { id: 'google_business', name: 'Google Business Profile', icon: Globe, status: 'Connected', syncTime: '1 hour ago', color: 'text-amber-500 dark:text-amber-400' },
    { id: 'instagram', name: 'Instagram Graph API', icon: Instagram, status: 'Connected', syncTime: '30 mins ago', color: 'text-pink-500 dark:text-pink-400' },
    { id: 'facebook', name: 'Facebook Pages Manager', icon: Facebook, status: 'Standby', syncTime: '2 hours ago', color: 'text-blue-500 dark:text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn Company Page', icon: Linkedin, status: 'Connected', syncTime: '45 mins ago', color: 'text-sky-600 dark:text-sky-500' },
    { id: 'youtube', name: 'YouTube Data API v3', icon: Youtube, status: 'Connected', syncTime: '1 hour ago', color: 'text-red-500' },
  ];

  const isRwConnected = globalConfig.is_verified && !!globalConfig.api_key;

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
              Manage social listening channels, app connectors, and Reviews World master API keys.
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

      {/* Social & Store Channels Grid (Includes Reviews World API at the end) */}
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

          {/* Last Connector Card: Reviews World API Engine (Master Connector) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-primary/30 space-y-3 flex flex-col justify-between hover:border-primary/50 transition shadow-sm gold-glow">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isRwConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {isRwConnected ? 'Verified & Connected' : 'Action Needed'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Reviews World API Engine</h3>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                {isRwConnected ? `Base URL: ${globalConfig.base_url}` : 'App Store & Play Store auto-fetch key unlinked'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${isRwConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isRwConnected ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                {isRwConnected ? 'HTTP 200 Handshake OK' : 'Not Authenticated'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthSuccess('');
                  setShowRwModal(true);
                }}
                className="text-xs text-primary hover:underline font-bold"
              >
                {isRwConnected ? 'Manage API & Base URL →' : 'Authenticate API →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews World API Authentication & Handshake Modal */}
      {showRwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Authenticate Reviews World API
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                    Strict HTTP 200 OK Server Handshake Verification
                  </p>
                </div>
              </div>
              <button onClick={() => setShowRwModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" /> API Provider Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://yash9525-rw-live-checker.hf.space"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-primary" /> Master API Secret Key
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste Reviews World API Secret Key (e.g. rw_live_9a87...)"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              {/* Handshake Error Alert */}
              {authError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Authentication Failed</p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{authError}</p>
                  </div>
                </div>
              )}

              {/* Handshake Success Alert */}
              {authSuccess && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Handshake Verified</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-300 mt-0.5">{authSuccess}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowRwModal(false)}
                  className="rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-neutral-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAuthenticateReviewsWorld}
                  disabled={verifying || !apiKeyInput.trim()}
                  className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-primary-foreground transition gold-glow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4 text-black" />}
                  {verifying ? 'Verifying Handshake (HTTP 200)...' : 'Authenticate & Save Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
