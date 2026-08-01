import { useState } from 'react';
import type { PlatformId, PlatformConnectionExtended } from '@/types';
import { PLATFORMS, HEALTH_STATUS_DEF } from '@/data/constants';
import { ConnectionHistoryModal } from './ConnectionHistoryModal';
import { triggerManualSync, disconnectAccountApi, fetchOAuthUrl } from '@/lib/apiIntegrations';
import { cn } from '@/lib/utils';
import {
  Globe, CheckCircle2, AlertCircle, RefreshCw, Unplug, Zap,
  History, Loader2, Building2, FileText, UserCheck, Calendar, ShieldCheck
} from 'lucide-react';

interface IntegrationsListCardProps {
  connections: PlatformConnectionExtended[];
  onRefreshConnections?: () => void;
  clientId?: string;
}

export function IntegrationsListCard({ connections, onRefreshConnections }: IntegrationsListCardProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedConnectionForHistory, setSelectedConnectionForHistory] = useState<PlatformConnectionExtended | null>(null);

  const officialPlatforms = PLATFORMS.filter((p) => p.officialOAuth);

  // Group connections by platform
  const connectionsByPlatform = officialPlatforms.map((platformDef) => {
    const list = connections.filter(
      (c) =>
        (c.platform as string).toLowerCase() === platformDef.id.toLowerCase() ||
        (platformDef.id === 'google_business' && (c.platform as string) === 'google')
    );
    return {
      platformDef,
      connectedList: list,
    };
  });

  async function handleConnect(platformId: PlatformId) {
    try {
      setActionMsg(null);
      const { authUrl } = await fetchOAuthUrl(platformId);
      window.location.href = authUrl;
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e.message || 'Failed to initiate OAuth authorization.' });
    }
  }

  async function handleSyncNow(connId: string) {
    try {
      setSyncingId(connId);
      setActionMsg(null);
      const res = await triggerManualSync(connId);
      setActionMsg({
        type: 'success',
        text: `✅ Manual Sync completed successfully! ${res.result?.details || ''}`,
      });
      if (onRefreshConnections) onRefreshConnections();
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e.message || 'Manual sync failed.' });
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDisconnect(connId: string) {
    if (!window.confirm('Are you sure you want to disconnect this platform account? Tokens will be revoked.')) return;
    try {
      setActionMsg(null);
      await disconnectAccountApi(connId);
      setActionMsg({ type: 'success', text: 'Account disconnected successfully.' });
      if (onRefreshConnections) onRefreshConnections();
    } catch (e: any) {
      setActionMsg({ type: 'error', text: e.message || 'Disconnect failed.' });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" /> Official OAuth 2.0 Platform Integrations
            </h2>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">
              Connect multiple company accounts using official platform OAuth 2.0 APIs. Encryption with AES-256 enabled.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              On-Demand Sync Only ("Sync Now")
            </span>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionMsg && (
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 text-xs font-bold transition-all',
              actionMsg.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
            )}
          >
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Platform Grid */}
        <div className="grid grid-cols-1 gap-6">
          {connectionsByPlatform.map(({ platformDef, connectedList }) => {
            return (
              <div
                key={platformDef.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-white/10 dark:bg-white/[0.02] space-y-4"
              >
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {platformDef.label}
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                          {connectedList.length} Connected
                        </span>
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {platformDef.group} · Official OAuth 2.0 Supported
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(platformDef.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-400 shadow-sm"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    + Connect Account
                  </button>
                </div>

                {/* Connected Accounts List */}
                {connectedList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-4 text-center text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.01]">
                    No {platformDef.short} accounts connected yet. Click "+ Connect Account" above to authorize.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {connectedList.map((conn) => {
                      const healthDef =
                        HEALTH_STATUS_DEF[conn.health_status] || HEALTH_STATUS_DEF['healthy'];
                      const isSyncing = syncingId === conn.id;

                      return (
                        <div
                          key={conn.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  conn.avatar_url ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    conn.account_name
                                  )}&background=0284c7&color=fff`
                                }
                                alt={conn.account_name}
                                className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
                              />
                              <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                  {conn.account_name}
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black',
                                      healthDef.tone
                                    )}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                                    {healthDef.label}
                                  </span>
                                </h4>
                                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                  ID: {conn.external_account_id || conn.id}
                                </p>
                              </div>
                            </div>

                            {/* Connection Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => handleSyncNow(conn.id)}
                                disabled={isSyncing || conn.status === 'disconnected'}
                                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                title="Perform manual API sync right now"
                              >
                                {isSyncing ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
                                )}
                                {isSyncing ? 'Syncing…' : 'Sync Now'}
                              </button>

                              <button
                                onClick={() => handleConnect(platformDef.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                              >
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                Reconnect
                              </button>

                              <button
                                onClick={() => setSelectedConnectionForHistory(conn)}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                              >
                                <History className="h-3.5 w-3.5" />
                                History
                              </button>

                              <button
                                onClick={() => handleDisconnect(conn.id)}
                                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                              >
                                <Unplug className="h-3.5 w-3.5" />
                                Disconnect
                              </button>
                            </div>
                          </div>

                          {/* Metadata Metadata Section */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                              <Building2 className="h-4 w-4 text-amber-500 shrink-0" />
                              <div>
                                <span className="block text-[10px] font-bold text-slate-400">Business Name</span>
                                <span className="font-black text-slate-800 dark:text-slate-200 truncate block">
                                  {conn.business_name || 'Equinox Partner Store'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                              <FileText className="h-4 w-4 text-sky-500 shrink-0" />
                              <div>
                                <span className="block text-[10px] font-bold text-slate-400">Page Name</span>
                                <span className="font-black text-slate-800 dark:text-slate-200 truncate block">
                                  {conn.page_name || 'Official Brand Page'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                              <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div>
                                <span className="block text-[10px] font-bold text-slate-400">Connected Date</span>
                                <span className="font-black text-slate-800 dark:text-slate-200 block">
                                  {new Date(conn.connected_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.02]">
                              <RefreshCw className="h-4 w-4 text-purple-500 shrink-0" />
                              <div>
                                <span className="block text-[10px] font-bold text-slate-400">Last Manual Sync</span>
                                <span className="font-black text-slate-800 dark:text-slate-200 block">
                                  {conn.last_synced_at
                                    ? new Date(conn.last_synced_at).toLocaleString()
                                    : 'Not synced yet'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History Drawer Modal */}
      <ConnectionHistoryModal
        connection={selectedConnectionForHistory}
        isOpen={!!selectedConnectionForHistory}
        onClose={() => setSelectedConnectionForHistory(null)}
      />
    </div>
  );
}
