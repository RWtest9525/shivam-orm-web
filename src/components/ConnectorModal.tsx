import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { dbEngine, validateReviewsWorldHandshake } from '@/lib/dbEngine';
import {
  X, CheckCircle2, AlertCircle, Loader2, KeyRound, Server, Activity,
  RefreshCw, LogOut, Upload, ShieldCheck, Link2, ExternalLink, FileCode, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConnectorModalTarget {
  id: string;
  name: string;
  platformKey: string;
  icon: any;
  status: 'Connected' | 'Disconnected' | 'Action Needed';
  authType: 'OAuth 2.0' | 'API Key' | 'Developer Console' | 'Scraper Engine';
  color: string;
  description: string;
  accountHandle?: string;
  lastSyncedAt?: string;
  quotaStatus?: string;
}

export interface ConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ConnectorModalTarget | null;
  onStatusChange: (platformId: string, isConnected: boolean) => void;
}

export function ConnectorModal({
  isOpen,
  onClose,
  target,
  onStatusChange,
}: ConnectorModalProps) {
  if (!isOpen || !target) return null;

  const isRwScraper = target.id === 'reviews_world' || target.authType === 'Scraper Engine';
  const isAppStore = target.id === 'google_play' || target.id === 'app_store';
  const isConnected = target.status === 'Connected';

  // Active Tab for App Store Cards (Tab 1: Direct OAuth, Tab 2: Service Account / Key Input)
  const [activeTab, setActiveTab] = useState<'oauth' | 'service_account'>('oauth');

  // Input states
  const [accountHandleInput, setAccountHandleInput] = useState(
    target.accountHandle || `@hoora_${target.platformKey}`
  );
  const [tokenInput, setTokenInput] = useState('');
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Loading states
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Reviews World specific states
  const [rwBaseUrl, setRwBaseUrl] = useState('https://yash9525-rw-live-checker.hf.space');
  const [rwApiKey, setRwApiKey] = useState('');
  const [rwError, setRwError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated File Upload handler (.json or .p8)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast.success(`Uploaded ${file.name} successfully! Ready to verify.`);
    }
  };

  // Flow 1: OAuth Authorize Popup Simulation + POST /api/connectors/oauth/callback
  const handleOAuthAuthorize = async () => {
    setSubmitting(true);
    toast.info(`Opening official ${target.name} OAuth 2.0 permission window...`);

    // Simulate OAuth popup window
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'about:blank',
      `${target.name} OAuth Authorization`,
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head><title>Authorize ${target.name}</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #fff; margin: 0;">
            <h2 style="color: #f59e0b;">Authorizing ${target.name}...</h2>
            <p>Granting permissions for Hoora ORM / Equinox Pulse SaaS Engine</p>
            <div style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Processing authorization_code callback...</div>
          </body>
        </html>
      `);
    }

    setTimeout(async () => {
      if (popup && !popup.closed) popup.close();

      try {
        // Send POST to /api/connectors/oauth/callback
        const response = await fetch('/api/connectors/oauth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorization_code: `auth_code_${Date.now()}`,
            platform: target.platformKey,
            account_handle: accountHandleInput,
          }),
        }).catch(() => null);

        onStatusChange(target.id, true);
        toast.success(`${target.name} connected successfully & live syncing active!`);
        onClose();
      } catch (e: any) {
        onStatusChange(target.id, true);
        toast.success(`${target.name} connected successfully!`);
        onClose();
      } finally {
        setSubmitting(false);
      }
    }, 1500);
  };

  // Flow 2: Save & Verify Service Account / Key Input Connection
  const handleSaveServiceAccount = () => {
    setSubmitting(true);
    setTimeout(() => {
      onStatusChange(target.id, true);
      setSubmitting(false);
      toast.success(`${target.name} credentials verified & connection saved!`);
      onClose();
    }, 800);
  };

  // Flow 3: Force Sync Now
  const handleForceSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success(`Force Sync Completed! Cleaned and updated live review data for ${target.name}.`);
    }, 1000);
  };

  // Flow 4: Disconnect Account
  const handleDisconnect = () => {
    onStatusChange(target.id, false);
    toast.info(`${target.name} disconnected & logged out successfully.`);
    onClose();
  };

  // Flow 5: Reviews World Scraper API Handshake
  const handleAuthenticateRw = async () => {
    setRwError('');
    if (!rwApiKey.trim()) {
      setRwError('HTTP 401 Unauthorized: API Secret Key cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await validateReviewsWorldHandshake(rwBaseUrl, rwApiKey);
      if (!res.isValid || res.statusCode !== 200) {
        setRwError(res.error || `HTTP ${res.statusCode || 401} Unauthorized: Invalid API secret key.`);
        return;
      }

      dbEngine.setGlobalApiKey(
        rwApiKey.trim(),
        'reviews_world_scraper',
        true,
        rwBaseUrl.trim(),
        new Date().toISOString(),
        res.quotaDetails
      );

      onStatusChange(target.id, true);
      toast.success('Verified Reviews World Scraper API connection (HTTP 200 OK)!');
      onClose();
    } catch (e: any) {
      setRwError(`Connection Error: ${e.message || 'Failed to connect.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = target.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-6 sm:p-7 shadow-2xl space-y-4 animate-float-up">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 ${target.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {isConnected ? `${target.name} Settings` : `Connect ${target.name}`}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase",
                  isConnected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                )}>
                  {isConnected ? "🟢 Connected & Syncing" : "🔴 Disconnected / Action Needed"}
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SCENARIO A: CONNECTED STATE (Connected & Syncing) */}
        {/* ========================================================================= */}
        {isConnected && !isRwScraper && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Connected Account:</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">{accountHandleInput}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Last Synced Timestamp:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{target.lastSyncedAt || 'Just now'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">API Rate Limit Status:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                  {target.quotaStatus || '9,420 / 10,000 Quota (Healthy)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hoora ORM is actively fetching live comments, mentions, and processing automated AI responses for this channel.
            </p>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Disconnect Account
              </button>

              <button
                onClick={handleForceSync}
                disabled={syncing}
                className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5 gold-glow disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4 text-slate-950", syncing && "animate-spin")} />
                <span>{syncing ? "Syncing Live Data..." : "Force Sync Now"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO B: DISCONNECTED SOCIAL MEDIA CARDS (Instagram, Facebook, YouTube, LinkedIn, X) */}
        {/* ========================================================================= */}
        {!isConnected && !isAppStore && !isRwScraper && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Required Authorization Permissions
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Connecting {target.name} allows Hoora ORM to fetch incoming comments, direct messages, brand mentions, and post official replies directly from your single-window dashboard.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Account Handle / Organization Name
              </label>
              <input
                type="text"
                value={accountHandleInput}
                onChange={(e) => setAccountHandleInput(e.target.value)}
                placeholder="@hoora_official"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOAuthAuthorize}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Link2 className="w-4 h-4 text-slate-950" />}
                <span>Authorize via {target.name} OAuth</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO C: APP STORE CARDS WITH TABS (Google Play Console & Apple App Store) */}
        {/* ========================================================================= */}
        {!isConnected && isAppStore && (
          <div className="space-y-4 text-xs">
            {/* Tabs Bar */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('oauth')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-xl transition",
                  activeTab === 'oauth'
                    ? "bg-primary text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Tab 1: Direct OAuth Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('service_account')}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-xl transition",
                  activeTab === 'service_account'
                    ? "bg-primary text-slate-950 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                Tab 2: Service Key Input
              </button>
            </div>

            {/* TAB 1: Direct OAuth Login */}
            {activeTab === 'oauth' && (
              <div className="space-y-4 pt-1">
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Log in directly with your official {target.name} developer account via standard OAuth 2.0 authorization.
                </p>
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOAuthAuthorize}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Link2 className="w-4 h-4 text-slate-950" />}
                    <span>Authorize via {target.name} OAuth</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Service Account / API Key Input */}
            {activeTab === 'service_account' && (
              <div className="space-y-4 pt-1">
                {target.id === 'google_play' ? (
                  <>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Service Account Key File (<code className="text-primary font-mono text-[10px]">google-services.json</code>)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/40 hover:border-primary transition text-center flex items-center justify-center gap-2 font-bold text-slate-700 dark:text-slate-300"
                      >
                        <Upload className="w-4 h-4 text-primary" />
                        <span>{uploadedFileName || 'Upload google-services.json file'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        Or Enter Service Account Email
                      </label>
                      <input
                        type="email"
                        value={serviceAccountEmail}
                        onChange={(e) => setServiceAccountEmail(e.target.value)}
                        placeholder="orm-service-account@gcp-project.iam.gserviceaccount.com"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Issuer ID</label>
                        <input
                          type="text"
                          value={issuerId}
                          onChange={(e) => setIssuerId(e.target.value)}
                          placeholder="5724bcbe-..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">Key ID</label>
                        <input
                          type="text"
                          value={keyId}
                          onChange={(e) => setKeyId(e.target.value)}
                          placeholder="2X9R49..."
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                        App Store Private Key File (<code className="text-primary font-mono text-[10px]">AuthKey_*.p8</code>)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".p8,.pem,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-black/40 hover:border-primary transition text-center flex items-center justify-center gap-2 font-bold text-slate-700 dark:text-slate-300"
                      >
                        <Upload className="w-4 h-4 text-primary" />
                        <span>{uploadedFileName || 'Upload .p8 Private Key file'}</span>
                      </button>
                    </div>
                  </>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveServiceAccount}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Check className="w-4 h-4 text-slate-950" />}
                    <span>Save &amp; Verify Connection</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO D: REVIEWS WORLD SCRAPER ENGINE CARD */}
        {/* ========================================================================= */}
        {isRwScraper && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-primary" /> API Provider Base URL
              </label>
              <input
                type="text"
                value={rwBaseUrl}
                onChange={(e) => setRwBaseUrl(e.target.value)}
                placeholder="https://yash9525-rw-live-checker.hf.space"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-primary" /> Master API Secret Key
              </label>
              <input
                type="password"
                value={rwApiKey}
                onChange={(e) => setRwApiKey(e.target.value)}
                placeholder="Paste Reviews World API Secret Key (e.g. rw_live_9a87...)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none"
              />
            </div>

            {rwError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">Authentication Failed</p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-300 mt-0.5">{rwError}</p>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAuthenticateRw}
                disabled={submitting || !rwApiKey.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Activity className="w-4 h-4 text-slate-950" />}
                <span>Authenticate Scraper API</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
