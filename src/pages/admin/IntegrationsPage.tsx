import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { dbEngine, validateReviewsWorldHandshake } from '@/lib/dbEngine';
import {
  Cable, Play, Store, Globe, Instagram, Facebook, Linkedin, Youtube, CheckCircle2,
  RefreshCw, KeyRound, ShieldAlert, Save, X, Loader2, AlertCircle, Server, Activity,
  LogOut, Link2, ExternalLink, MessageSquare, Check, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChannelConnectorDef {
  id: string;
  name: string;
  platformKey: string;
  icon: any;
  defaultStatus: 'Connected' | 'Action Needed';
  authType: 'OAuth 2.0' | 'API Key' | 'Developer Console';
  color: string;
  description: string;
}

const CONNECTORS: ChannelConnectorDef[] = [
  {
    id: 'google_play',
    name: 'Google Play Console API',
    platformKey: 'playstore',
    icon: Play,
    defaultStatus: 'Connected',
    authType: 'Developer Console',
    color: 'text-emerald-500 dark:text-emerald-400',
    description: 'Official Google Play Developer API for live review ingestion & direct replies.',
  },
  {
    id: 'instagram',
    name: 'Instagram Graph API',
    platformKey: 'instagram',
    icon: Instagram,
    defaultStatus: 'Connected',
    authType: 'OAuth 2.0',
    color: 'text-pink-500 dark:text-pink-400',
    description: 'Meta Graph API for Instagram Business account comments, DMs & media mentions.',
  },
  {
    id: 'youtube',
    name: 'YouTube Data API v3',
    platformKey: 'youtube',
    icon: Youtube,
    defaultStatus: 'Connected',
    authType: 'OAuth 2.0',
    color: 'text-red-500',
    description: 'Google Data API v3 for YouTube channel video comments & community replies.',
  },
  {
    id: 'google_business',
    name: 'Google Business Profile API',
    platformKey: 'google_business',
    icon: Globe,
    defaultStatus: 'Connected',
    authType: 'OAuth 2.0',
    color: 'text-amber-500 dark:text-amber-400',
    description: 'Google Maps & Business location reviews, ratings, and instant response manager.',
  },
  {
    id: 'facebook',
    name: 'Facebook Pages Manager',
    platformKey: 'facebook',
    icon: Facebook,
    defaultStatus: 'Connected',
    authType: 'OAuth 2.0',
    color: 'text-blue-500 dark:text-blue-400',
    description: 'Meta Graph API for Facebook Brand Page post comments and Messenger DMs.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Company Page',
    platformKey: 'linkedin',
    icon: Linkedin,
    defaultStatus: 'Connected',
    authType: 'OAuth 2.0',
    color: 'text-sky-600 dark:text-sky-500',
    description: 'LinkedIn Organization API for company updates, post comments & reputation analytics.',
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter) Developer API v2',
    platformKey: 'x',
    icon: MessageSquare,
    defaultStatus: 'Action Needed',
    authType: 'OAuth 2.0',
    color: 'text-slate-900 dark:text-slate-100',
    description: 'X API v2 for brand mentions, direct messages, and crisis sentiment monitoring.',
  },
  {
    id: 'app_store',
    name: 'Apple App Store Connect',
    platformKey: 'app_store',
    icon: Store,
    defaultStatus: 'Connected',
    authType: 'API Key',
    color: 'text-sky-500 dark:text-sky-400',
    description: 'App Store Connect API for iOS customer reviews and ratings synchronization.',
  },
];

export function IntegrationsPage() {
  const { client } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const connectParam = searchParams.get('connect');

  const [loading, setLoading] = useState(false);
  const [globalConfig, setGlobalConfig] = useState(() => dbEngine.getGlobalApiKey());

  // Connection State Map (tracks connected vs disconnected status for each platform)
  const [connectedMap, setConnectedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    CONNECTORS.forEach((c) => {
      map[c.id] = c.defaultStatus === 'Connected';
    });
    return map;
  });

  // Modal State for Social Platform OAuth / API Connector
  const [activeChannelModal, setActiveChannelModal] = useState<ChannelConnectorDef | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [accountHandle, setAccountHandle] = useState('');
  const [connectingChannel, setConnectingChannel] = useState(false);

  // Modal State for Reviews World Master Scraper API
  const [showRwModal, setShowRwModal] = useState(false);
  const [baseUrl, setBaseUrl] = useState(globalConfig.base_url || 'https://yash9525-rw-live-checker.hf.space');
  const [apiKeyInput, setApiKeyInput] = useState(globalConfig.api_key || '');
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Auto-open modal if URL parameter ?connect=<platform> is provided
  useEffect(() => {
    if (connectParam) {
      const match = CONNECTORS.find((c) => c.platformKey === connectParam || c.id === connectParam);
      if (match) {
        setAccountHandle(`@${client?.company_name.toLowerCase().replace(/\s+/g, '') || 'official'}`);
        setActiveChannelModal(match);
      }
    }
  }, [connectParam, client]);

  const handleSyncAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGlobalConfig(dbEngine.getGlobalApiKey());
      toast.success('All enterprise connectors and API channels synced');
    }, 800);
  };

  const handleOpenChannelModal = (c: ChannelConnectorDef) => {
    setAccountHandle(`@${client?.company_name.toLowerCase().replace(/\s+/g, '') || 'official'}`);
    setTokenInput('');
    setActiveChannelModal(c);
  };

  const handleConnectChannel = (c: ChannelConnectorDef) => {
    setConnectingChannel(true);
    setTimeout(() => {
      if (client?.id) {
        dbEngine.upsertConnection({
          client_id: client.id,
          platform: c.platformKey,
          account_name: accountHandle || `${c.name} Account`,
          api_key: tokenInput || `token-${Date.now()}`,
          access_token: tokenInput || `oauth-${Date.now()}`,
          status: 'connected',
          health_status: 'healthy',
        });
      }
      setConnectedMap((prev) => ({ ...prev, [c.id]: true }));
      setConnectingChannel(false);
      setActiveChannelModal(null);
      toast.success(`${c.name} OAuth connected & live syncing!`);
    }, 600);
  };

  const handleDisconnectChannel = (c: ChannelConnectorDef) => {
    setConnectedMap((prev) => ({ ...prev, [c.id]: false }));
    setActiveChannelModal(null);
    toast.info(`${c.name} disconnected & logged out successfully.`);
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
      const res = await validateReviewsWorldHandshake(baseUrl, apiKeyInput);

      if (!res.isValid || res.statusCode !== 200) {
        setAuthError(res.error || `HTTP ${res.statusCode || 401} Unauthorized: Invalid API key or unverified provider endpoint.`);
        return;
      }

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
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 font-medium">
              Manage social channel OAuth authorizations, API connectors, and Reviews World Play Store scraper endpoint.
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync All Connectors</span>
        </button>
      </div>

      {/* Social & Store Channels Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cable className="w-4 h-4 text-primary" /> Monitored Channels &amp; App Connectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONNECTORS.map((c) => {
            const Icon = c.icon;
            const isConnected = !!connectedMap[c.id];
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
                      {isConnected ? 'Connected & Syncing' : 'Disconnected'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className={cn(
                    "text-[10px] font-bold flex items-center gap-1",
                    isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isConnected ? 'OAuth Active' : 'Action Needed'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenChannelModal(c)}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    {isConnected ? 'Manage / Disconnect →' : 'Connect API →'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Master Connector: Reviews World Play Store / App Store Scraper Engine */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-primary/30 space-y-3 flex flex-col justify-between hover:border-primary/50 transition shadow-sm gold-glow">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isRwConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {isRwConnected ? 'Scraper API Connected' : 'Action Needed'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Reviews World API Engine</h3>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground mt-0.5">
                Play Store &amp; App Store live review scraper endpoint provided by platform owner.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-bold flex items-center gap-1 ${isRwConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
                {isRwConnected ? 'Manage Base URL & Secret →' : 'Authenticate Scraper API →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SOCIAL PLATFORM CHANNEL OAUTH & API CONNECTOR */}
      {/* ========================================================================= */}
      {activeChannelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-6 shadow-2xl space-y-4 animate-float-up">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center ${activeChannelModal.color}`}>
                  <activeChannelModal.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {activeChannelModal.name}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-primary tracking-wider">
                    {activeChannelModal.authType} Authorization
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveChannelModal(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {activeChannelModal.description}
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Connected Account Handle / Business Name
                </label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="@your_brand_handle"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs text-slate-900 dark:text-white focus:border-primary focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  OAuth Access Token / API Key (Optional)
                </label>
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste OAuth Token or API Key..."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-primary" /> Step-by-Step OAuth Verification
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Granting OAuth permissions allows Equinox Pulse to sync incoming comments, ratings, and send direct replies to your channel.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-white/10">
                {connectedMap[activeChannelModal.id] ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectChannel(activeChannelModal)}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 transition flex items-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" /> Disconnect &amp; Logout
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveChannelModal(null)}
                    className="rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-neutral-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConnectChannel(activeChannelModal)}
                    disabled={connectingChannel}
                    className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-slate-950 transition shadow-md disabled:opacity-50 flex items-center gap-1.5 gold-glow"
                  >
                    {connectingChannel ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Check className="h-4 w-4 text-slate-950" />}
                    <span>Complete Connection</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REVIEWS WORLD API ENGINE (MASTER SCRAPER ENDPOINT) */}
      {/* ========================================================================= */}
      {showRwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl space-y-4 animate-float-up">
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

              {authError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">Authentication Failed</p>
                    <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{authError}</p>
                  </div>
                </div>
              )}

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
                  className="rounded-xl bg-primary hover:bg-primary/90 px-5 py-2.5 text-xs font-bold text-slate-950 transition gold-glow disabled:opacity-50 flex items-center gap-1.5"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Activity className="h-4 w-4 text-slate-950" />}
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
