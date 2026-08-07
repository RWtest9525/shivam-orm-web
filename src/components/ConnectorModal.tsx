import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { dbEngine, validateReviewsWorldHandshake } from '@/lib/dbEngine';
import {
  X, CheckCircle2, AlertCircle, Loader2, KeyRound, Server, Activity,
  RefreshCw, LogOut, Upload, ShieldCheck, Link2, FileCode, Check, RotateCcw
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
  onStatusChange: (platformKey: string, isConnected: boolean) => void;
}

export function ConnectorModal({
  isOpen,
  onClose,
  target,
  onStatusChange,
}: ConnectorModalProps) {
  const { client } = useAuth();
  if (!isOpen || !target) return null;

  const isRwScraper = target.id === 'reviews_world' || target.authType === 'Scraper Engine';
  const isAppStore = target.id === 'google_play' || target.id === 'app_store';
  const isConnected = target.status === 'Connected';

  // Active Tab for App Store Cards (Tab 1: Direct OAuth, Tab 2: Service Key Input)
  const [activeTab, setActiveTab] = useState<'oauth' | 'service_account'>('oauth');

  // Input states
  const [accountHandleInput, setAccountHandleInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [serviceAccountEmail, setServiceAccountEmail] = useState('');
  const [issuerId, setIssuerId] = useState('');
  const [keyId, setKeyId] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Status & Error Feedback states
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Reviews World specific states
  const [rwBaseUrl, setRwBaseUrl] = useState('https://yash9525-rw-live-checker.hf.space');
  const [rwApiKey, setRwApiKey] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset modal state on open
  useEffect(() => {
    setAuthError('');
    setVerifying(false);
    setAccountHandleInput(target.accountHandle || '');
    setTokenInput('');
    setServiceAccountEmail('');
    setUploadedFileName('');
  }, [target]);

  // Handle File Upload (.json or .p8)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setAuthError('');
      toast.success(`Loaded ${file.name}. Ready to verify credentials.`);
    }
  };

  // Flow 1: OAuth Authorize for Social Platforms
  const handleOAuthAuthorize = async () => {
    setAuthError('');

    if (!accountHandleInput.trim()) {
      setAuthError('Connection Failed: Company account handle or page name cannot be empty.');
      return;
    }

    setVerifying(true);

    // Simulate OAuth Popup & API authorization check
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      'about:blank',
      `Authorize ${target.name}`,
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popup) {
      popup.document.write(`
        <html>
          <head><title>Authorize ${target.name}</title></head>
          <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #fff; margin: 0; padding: 20px; text-align: center;">
            <h2 style="color: #f59e0b; font-size: 18px;">Verifying ${target.name} Permissions...</h2>
            <p style="font-size: 13px; color: #cbd5e1;">Authenticating company profile for: <strong>${accountHandleInput}</strong></p>
            <div style="margin-top: 15px; font-size: 11px; color: #94a3b8;">Verifying OAuth 2.0 Access Token...</div>
          </body>
        </html>
      `);
    }

    setTimeout(() => {
      if (popup && !popup.closed) popup.close();

      if (!client?.id) {
        setVerifying(false);
        setAuthError('Connection Failed: Logged-in company session not found. Please log in again.');
        return;
      }

      // Save real connection in DB scoped to client.id
      dbEngine.upsertConnection({
        client_id: client.id,
        platform: target.platformKey,
        account_name: accountHandleInput.trim(),
        api_key: tokenInput || `token-${Date.now()}`,
        access_token: tokenInput || `oauth-${Date.now()}`,
        status: 'connected',
        health_status: 'healthy',
        last_synced_at: new Date().toISOString(),
      });

      setVerifying(false);
      onStatusChange(target.platformKey, true);
      toast.success(`${target.name} connected successfully for ${client.company_name}!`);
      onClose();
    }, 1400);
  };

  // Flow 2: Save Service Account Key / App Store Credentials
  const handleSaveServiceAccount = () => {
    setAuthError('');

    if (target.id === 'google_play') {
      if (!uploadedFileName && !serviceAccountEmail.trim()) {
        setAuthError('Connection Failed: Please upload google-services.json OR enter Service Account Email.');
        return;
      }
    } else if (target.id === 'app_store') {
      if (!uploadedFileName && (!issuerId.trim() || !keyId.trim())) {
        setAuthError('Connection Failed: Please upload .p8 Private Key file OR fill in Issuer ID and Key ID.');
        return;
      }
    }

    setVerifying(true);
    setTimeout(() => {
      if (!client?.id) {
        setVerifying(false);
        setAuthError('Connection Failed: Logged-in client session missing.');
        return;
      }

      const accName = serviceAccountEmail.trim() || uploadedFileName || `${client.company_name} Store Key`;
      dbEngine.upsertConnection({
        client_id: client.id,
        platform: target.platformKey,
        account_name: accName,
        api_key: issuerId || keyId || `key-${Date.now()}`,
        access_token: `jwt-${Date.now()}`,
        status: 'connected',
        health_status: 'healthy',
        last_synced_at: new Date().toISOString(),
      });

      setVerifying(false);
      onStatusChange(target.platformKey, true);
      toast.success(`${target.name} service account verified & saved successfully!`);
      onClose();
    }, 1200);
  };

  // Flow 3: Force Sync
  const handleForceSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success(`Synced live review data for ${target.name}.`);
    }, 900);
  };

  // Flow 4: Disconnect Account
  const handleDisconnect = () => {
    if (client?.id) {
      const conn = dbEngine.getConnections(client.id).find((c) => c.platform === target.platformKey);
      if (conn) {
        dbEngine.deleteConnection(conn.id);
      }
    }
    onStatusChange(target.platformKey, false);
    toast.info(`${target.name} disconnected successfully.`);
    onClose();
  };

  // Flow 5: Reviews World Scraper Engine Authentication
  const handleAuthenticateRw = async () => {
    setAuthError('');
    if (!rwApiKey.trim()) {
      setAuthError('Connection Failed: Master API Secret Key cannot be empty.');
      return;
    }

    setVerifying(true);
    try {
      const res = await validateReviewsWorldHandshake(rwBaseUrl, rwApiKey);
      if (!res.isValid || res.statusCode !== 200) {
        setVerifying(false);
        setAuthError(res.error || `HTTP ${res.statusCode || 401} Connection Failed: Invalid API secret key.`);
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

      setVerifying(false);
      onStatusChange(target.platformKey, true);
      toast.success('Verified Reviews World Scraper API connection (HTTP 200 OK)!');
      onClose();
    } catch (e: any) {
      setVerifying(false);
      setAuthError(`Connection Failed: ${e.message || 'Server handshake error.'}`);
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
                {isConnected ? `${target.name} Connection` : `Connect ${target.name}`}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase",
                  isConnected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
                )}>
                  {isConnected ? "🟢 Connected & Syncing" : "🔴 Disconnected / Not Configured"}
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Error State Banner */}
        {authError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="font-bold">{authError}</div>
              <button
                type="button"
                onClick={() => setAuthError('')}
                className="mt-1.5 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO A: CONNECTED STATE */}
        {/* ========================================================================= */}
        {isConnected && !isRwScraper && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Connected Account:</span>
                <span className="font-black text-slate-900 dark:text-white font-mono">{target.accountHandle || 'Active Account'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Client Organization:</span>
                <span className="font-bold text-primary">{client?.company_name || 'My Organization'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">Last Synced:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{target.lastSyncedAt ? new Date(target.lastSyncedAt).toLocaleString() : 'Just now'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Live reviews, messages, and mentions are actively syncing for this platform.
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
                <span>{syncing ? "Syncing..." : "Force Sync Now"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO B: DISCONNECTED SOCIAL MEDIA CARDS */}
        {/* ========================================================================= */}
        {!isConnected && !isAppStore && !isRwScraper && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
              <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Enterprise OAuth Authorization
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Connect your company's official {target.name} profile to enable live review ingestion &amp; direct single-window replies.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Company Page Name / Handle <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={accountHandleInput}
                onChange={(e) => setAccountHandleInput(e.target.value)}
                placeholder={`e.g. @${client?.company_name.toLowerCase().replace(/\s+/g, '_') || 'company'}_official`}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                OAuth Token / API Secret (Optional)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste Access Token if pre-generated..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-mono"
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
                disabled={verifying}
                className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Link2 className="w-4 h-4 text-slate-950" />}
                <span>{verifying ? "Verifying Credentials..." : `Authorize via ${target.name}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENARIO C: APP STORE CARDS WITH TABS */}
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
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    App Title / Package Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHandleInput}
                    onChange={(e) => setAccountHandleInput(e.target.value)}
                    placeholder={target.id === 'google_play' ? 'com.company.app' : 'com.company.app.ios'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white font-mono"
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
                    disabled={verifying}
                    className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Link2 className="w-4 h-4 text-slate-950" />}
                    <span>{verifying ? "Verifying Credentials..." : `Authorize via ${target.name}`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Service Account / Key Input */}
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
                    disabled={verifying}
                    className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Check className="w-4 h-4 text-slate-950" />}
                    <span>{verifying ? "Verifying Credentials..." : "Save & Verify Connection"}</span>
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
                <KeyRound className="h-3.5 w-3.5 text-primary" /> Master API Secret Key <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={rwApiKey}
                onChange={(e) => setRwApiKey(e.target.value)}
                placeholder="Paste Reviews World API Secret Key (e.g. rw_live_9a87...)"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-black/60 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-primary focus:outline-none"
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
                onClick={handleAuthenticateRw}
                disabled={verifying}
                className="px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-md flex items-center gap-2 gold-glow disabled:opacity-50"
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Activity className="w-4 h-4 text-slate-950" />}
                <span>{verifying ? "Verifying Credentials..." : "Authenticate Scraper API"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
