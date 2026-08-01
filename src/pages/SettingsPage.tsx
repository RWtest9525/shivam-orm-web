import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConnections } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { dbEngine, validateReviewsWorldHandshake } from '@/lib/dbEngine';
import { cn } from '@/lib/utils';
import {
  KeyRound, CheckCircle2, Loader2, AlertCircle, Trash2, Globe, Link2,
  Calendar, Zap, ShieldCheck, RefreshCw
} from 'lucide-react';

import { IntegrationsListCard } from '@/components/IntegrationsListCard';
import { SubscriptionBillingCard } from '@/components/SubscriptionBillingCard';

export function SettingsPage() {
  const { client, userRole } = useAuth();
  const isAdmin = userRole === 'super_admin';

  // Super Admin API Verification State
  const globalConfig = dbEngine.getGlobalApiKey();
  const [baseUrl, setBaseUrl] = useState(globalConfig.base_url || 'https://yash9525-rw-live-checker.hf.space');
  const [adminApiKey, setAdminApiKey] = useState(globalConfig.api_key || '');
  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ success?: boolean; statusCode?: number; msg?: string } | null>(null);

  // Client settings state
  const { connections, refreshConnections } = useConnections(client?.id);

  // Super Admin API Key Validation Function (HTTP 200 Handshake)
  async function handleAdminValidateAndSave() {
    const trimmedKey = adminApiKey.trim();
    const trimmedUrl = baseUrl.trim() || 'https://yash9525-rw-live-checker.hf.space';

    if (!trimmedKey) {
      setVerifyStatus({ success: false, msg: '❌ Invalid API Key' });
      return;
    }

    setVerifying(true);
    setVerifyStatus(null);

    const check = await validateReviewsWorldHandshake(trimmedUrl, trimmedKey);

    if (check.isValid && check.statusCode === 200) {
      dbEngine.setGlobalApiKey(trimmedKey, 'reviews_world_scraper', true, trimmedUrl, new Date().toISOString(), check.quotaDetails);
      setVerifyStatus({
        success: true,
        statusCode: 200,
        msg: '✅ API Connected Successfully',
      });
    } else {
      setVerifyStatus({
        success: false,
        statusCode: check.statusCode,
        msg: check.statusCode === 404 ? '❌ Connection Failed (404 Not Found)' : (check.error || '❌ Invalid API Key'),
      });
    }

    setVerifying(false);
  }

  function handleUnlinkAndDeleteKey() {
    if (window.confirm('Are you sure you want to unlink and delete this API key?')) {
      dbEngine.clearGlobalApiKey();
      setAdminApiKey('');
      setVerifyStatus({
        success: true,
        msg: 'Unlinked successfully.',
      });
    }
  }

  // --- SUPER ADMIN VIEW: Master Reviews World API Key Management ONLY ---
  if (isAdmin) {
    const isConnected = globalConfig.is_verified && Boolean(globalConfig.api_key);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader
          title="Reviews World Global API Key Management"
        />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-6">
          <div className="border-b border-slate-200 pb-4 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" /> Master Reviews World API Connection
            </h2>
          </div>

          {/* ACTIVE CONNECTED STATE CARD WITH VERIFIED API METRICS */}
          {isConnected ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      API CONNECTED
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {globalConfig.quotaDetails?.plan_name && (
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-black text-amber-300 border border-amber-500/30 uppercase">
                      {globalConfig.quotaDetails.plan_name}
                    </span>
                  )}
                  {typeof globalConfig.quotaDetails?.latency_ms === 'number' && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-mono font-black text-emerald-300 border border-emerald-500/30">
                      ⚡ {globalConfig.quotaDetails.latency_ms}ms latency
                    </span>
                  )}
                </div>
              </div>

              {/* VERIFIED BACKEND METRICS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Requests Used vs Total Limit */}
                {(typeof globalConfig.quotaDetails?.requests_used === 'number' || typeof globalConfig.quotaDetails?.requests_limit === 'number') && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">API Quota Usage</span>
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-lg font-black text-white">
                        {globalConfig.quotaDetails?.requests_used !== null && globalConfig.quotaDetails?.requests_used !== undefined
                          ? globalConfig.quotaDetails.requests_used.toLocaleString()
                          : 'N/A'}
                      </span>
                      {globalConfig.quotaDetails?.requests_limit !== null && globalConfig.quotaDetails?.requests_limit !== undefined && (
                        <span className="text-xs font-bold text-slate-400">
                          / {globalConfig.quotaDetails.requests_limit.toLocaleString()} Requests
                        </span>
                      )}
                    </div>
                    {typeof globalConfig.quotaDetails?.requests_used === 'number' && typeof globalConfig.quotaDetails?.requests_limit === 'number' && globalConfig.quotaDetails.requests_limit > 0 && (
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((globalConfig.quotaDetails.requests_used / globalConfig.quotaDetails.requests_limit) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                    {typeof globalConfig.quotaDetails?.requests_remaining === 'number' && (
                      <p className="text-[10px] font-bold text-emerald-400">
                        {globalConfig.quotaDetails.requests_remaining.toLocaleString()} requests remaining
                      </p>
                    )}
                  </div>
                )}

                {/* Expiry Date */}
                {globalConfig.quotaDetails?.expiry_date && (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-black uppercase tracking-wider">API Expiry Date</span>
                      <Calendar className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {new Date(globalConfig.quotaDetails.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Status: Active
                    </p>
                  </div>
                )}

                {/* Connection Base URL */}
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 space-y-2 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-black uppercase tracking-wider">Backend Target</span>
                    <Globe className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="text-xs font-black font-mono text-amber-300 truncate">
                    {globalConfig.base_url}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 truncate">
                    Key: {globalConfig.api_key.slice(0, 6)}****************{globalConfig.api_key.slice(-4)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-emerald-500/20">
                <button
                  onClick={handleAdminValidateAndSave}
                  disabled={verifying}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refresh Status
                </button>

                <button
                  onClick={handleUnlinkAndDeleteKey}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-400" /> Unlink & Delete
                </button>
              </div>
            </div>
          ) : (
            /* LINK & CONNECT FORM */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-amber-500" /> Reviews World Backend Base URL
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://yash9525-rw-live-checker.hf.space"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" /> Master API Key
                </label>
                <input
                  type="text"
                  value={adminApiKey}
                  onChange={(e) => setAdminApiKey(e.target.value)}
                  placeholder="Paste Reviews World API key"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              {/* DIRECT ERROR NOTIFICATION */}
              {verifyStatus && verifyStatus.success === false && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{verifyStatus.msg || '❌ Invalid API Key'}</span>
                </div>
              )}

              {/* DIRECT SUCCESS NOTIFICATION */}
              {verifyStatus && verifyStatus.success === true && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{verifyStatus.msg || '✅ API Connected Successfully'}</span>
                </div>
              )}

              <button
                onClick={handleAdminValidateAndSave}
                disabled={verifying || !adminApiKey.trim()}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                {verifying ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- CLIENT VIEW: Assigned App Overview ---
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings Overview"
        subtitle="View your app parameters and active connections"
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
        <div className="border-b border-slate-200 pb-3 dark:border-white/10">
          <h2 className="text-base font-black text-slate-900 dark:text-white">Active Assigned App</h2>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
            Your application credentials and reviews are managed automatically by Super Admin using the master Reviews World API key.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="relative group">
            <img
              src={client?.app_icon_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${client?.company_name}`}
              alt={client?.company_name}
              className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/70 shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white">{client?.app_name || client?.company_name}</p>
            <p className="text-xs font-mono text-amber-600 dark:text-amber-400">{client?.app_package_name || 'Not set'}</p>
            
            <label className="mt-2 inline-flex items-center gap-2 rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-700 dark:text-amber-300 cursor-pointer transition hover:bg-amber-500/30">
              📸 Upload Profile Logo from Gallery
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && client) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64Url = event.target?.result as string;
                      dbEngine.updateClientProfileLogo(client.id, base64Url);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Official Platform Integrations Card */}
      <IntegrationsListCard
        connections={connections}
        onRefreshConnections={refreshConnections}
        clientId={client?.id}
      />

      {/* Subscription & Billing System Card */}
      <SubscriptionBillingCard />
    </div>
  );
}
