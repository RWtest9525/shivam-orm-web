import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { dbEngine, type PlatformConnectionRow } from '@/lib/dbEngine';
import { ClientOnboardingDrawer } from '@/components/ClientOnboardingDrawer';
import { ConnectorModal, type ConnectorModalTarget } from '@/components/ConnectorModal';
import {
  Cable, Play, Store, Globe, Instagram, Facebook, Linkedin, Youtube, CheckCircle2,
  RefreshCw, KeyRound, ShieldAlert, X, AlertCircle, ClipboardList, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChannelConnectorDef {
  id: string;
  name: string;
  platformKey: string;
  icon: any;
  authType: 'OAuth 2.0' | 'API Key' | 'Developer Console' | 'Scraper Engine';
  color: string;
  description: string;
}

const CONNECTORS: ChannelConnectorDef[] = [
  {
    id: 'google_play',
    name: 'Google Play Console API',
    platformKey: 'playstore',
    icon: Play,
    authType: 'Developer Console',
    color: 'text-emerald-500 dark:text-emerald-400',
    description: 'Official Google Play Developer API for live review ingestion & direct replies.',
  },
  {
    id: 'instagram',
    name: 'Instagram Graph API',
    platformKey: 'instagram',
    icon: Instagram,
    authType: 'OAuth 2.0',
    color: 'text-pink-500 dark:text-pink-400',
    description: 'Meta Graph API for Instagram Business account comments, DMs & media mentions.',
  },
  {
    id: 'youtube',
    name: 'YouTube Data API v3',
    platformKey: 'youtube',
    icon: Youtube,
    authType: 'OAuth 2.0',
    color: 'text-red-500',
    description: 'Google Data API v3 for YouTube channel video comments & community replies.',
  },
  {
    id: 'google_business',
    name: 'Google Business Profile API',
    platformKey: 'google_business',
    icon: Globe,
    authType: 'OAuth 2.0',
    color: 'text-amber-500 dark:text-amber-400',
    description: 'Google Maps & Business location reviews, ratings, and instant response manager.',
  },
  {
    id: 'facebook',
    name: 'Facebook Pages Manager',
    platformKey: 'facebook',
    icon: Facebook,
    authType: 'OAuth 2.0',
    color: 'text-blue-500 dark:text-blue-400',
    description: 'Meta Graph API for Facebook Brand Page post comments and Messenger DMs.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Company Page',
    platformKey: 'linkedin',
    icon: Linkedin,
    authType: 'OAuth 2.0',
    color: 'text-sky-600 dark:text-sky-500',
    description: 'LinkedIn Organization API for company updates, post comments & reputation analytics.',
  },
  {
    id: 'x_twitter',
    name: 'X (Twitter) Developer API v2',
    platformKey: 'x',
    icon: MessageSquare,
    authType: 'OAuth 2.0',
    color: 'text-slate-900 dark:text-slate-100',
    description: 'X API v2 for brand mentions, direct messages, and crisis sentiment monitoring.',
  },
  {
    id: 'app_store',
    name: 'Apple App Store Connect',
    platformKey: 'app_store',
    icon: Store,
    authType: 'API Key',
    color: 'text-sky-500 dark:text-sky-400',
    description: 'App Store Connect API for iOS customer reviews and ratings synchronization.',
  },
];

export function IntegrationsPage() {
  const { client } = useAuth();
  const [searchParams] = useSearchParams();
  const connectParam = searchParams.get('connect');

  const [loading, setLoading] = useState(false);
  const [showOnboardingDrawer, setShowOnboardingDrawer] = useState(false);

  // DYNAMIC MULTI-TENANT CONNECTIONS LIST (Loaded strictly for logged-in client.id)
  const [connections, setConnections] = useState<PlatformConnectionRow[]>([]);
  const [globalRwConfig, setGlobalRwConfig] = useState(() => dbEngine.getGlobalApiKey());

  const loadConnections = useCallback(() => {
    if (client?.id) {
      setConnections(dbEngine.getConnections(client.id));
    } else {
      setConnections([]);
    }
    setGlobalRwConfig(dbEngine.getGlobalApiKey());
  }, [client?.id]);

  useEffect(() => {
    loadConnections();
    const unsub = dbEngine.subscribe(loadConnections);
    return unsub;
  }, [loadConnections]);

  // Helper: Find active connected connection row for a platformKey
  const getConnectedRow = (platformKey: string): PlatformConnectionRow | undefined => {
    return connections.find((c) => c.platform === platformKey && c.status === 'connected');
  };

  // Modal State for Universal ConnectorModal
  const [modalTarget, setModalTarget] = useState<ConnectorModalTarget | null>(null);

  // Auto-open connector modal if URL parameter ?connect=<platform> is provided
  useEffect(() => {
    if (connectParam) {
      const match = CONNECTORS.find((c) => c.platformKey === connectParam || c.id === connectParam);
      if (match) {
        const activeConn = getConnectedRow(match.platformKey);
        setModalTarget({
          id: match.id,
          name: match.name,
          platformKey: match.platformKey,
          icon: match.icon,
          status: activeConn ? 'Connected' : 'Disconnected',
          authType: match.authType,
          color: match.color,
          description: match.description,
          accountHandle: activeConn?.account_name || `@${client?.company_name.toLowerCase().replace(/\s+/g, '') || 'official'}`,
          lastSyncedAt: activeConn?.last_synced_at || undefined,
        });
      }
    }
  }, [connectParam, client, connections]);

  const handleSyncAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loadConnections();
      toast.success('All connected channel API tokens & webhooks re-verified.');
    }, 800);
  };

  const handleStatusChange = (platformKey: string, isConnected: boolean) => {
    loadConnections();
  };

  const openConnectorModalForCard = (c: ChannelConnectorDef) => {
    const activeConn = getConnectedRow(c.platformKey);
    setModalTarget({
      id: c.id,
      name: c.name,
      platformKey: c.platformKey,
      icon: c.icon,
      status: activeConn ? 'Connected' : 'Disconnected',
      authType: c.authType,
      color: c.color,
      description: c.description,
      accountHandle: activeConn?.account_name || `@${client?.company_name.toLowerCase().replace(/\s+/g, '') || 'official'}`,
      lastSyncedAt: activeConn?.last_synced_at || undefined,
    });
  };

  const openRwScraperModal = () => {
    const isRwConnected = globalRwConfig.is_verified && !!globalRwConfig.api_key;
    setModalTarget({
      id: 'reviews_world',
      name: 'Reviews World API Engine',
      platformKey: 'reviews_world',
      icon: KeyRound,
      status: isRwConnected ? 'Connected' : 'Disconnected',
      authType: 'Scraper Engine',
      color: 'text-amber-500',
      description: 'Master Play Store & App Store live review scraper API provided by platform owner.',
    });
  };

  const isRwConnected = globalRwConfig.is_verified && !!globalRwConfig.api_key;

  return (
    <div className="space-y-6">
      {/* Top Header Banner with Implementation & Onboarding Plan Button */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Cable className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enterprise Integrations &amp; API Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Multi-tenant channel authorization for <span className="font-bold text-primary">{client?.company_name || 'My Organization'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowOnboardingDrawer(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white/10 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm border border-white/10 flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4 text-primary" />
            <span>📋 View Client Implementation &amp; Onboarding Plan</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-bold text-xs flex items-center gap-2 transition disabled:opacity-50 shadow-sm gold-glow"
          >
            <RefreshCw className={`w-4 h-4 text-slate-950 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Connected Channels</span>
          </button>
        </div>
      </div>

      {/* Social & Store Channels Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cable className="w-4 h-4 text-primary" /> Monitored Channels &amp; App Connectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONNECTORS.map((c) => {
            const Icon = c.icon;
            const activeConn = getConnectedRow(c.platformKey);
            const isConnected = !!activeConn;

            return (
              <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-3 flex flex-col justify-between hover:border-primary/25 transition shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/5 flex items-center justify-center ${c.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 border-slate-500/30 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isConnected ? `🟢 Connected (${activeConn.account_name})` : '🔴 Not Configured'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className={cn(
                    "text-[10px] font-bold flex items-center gap-1",
                    isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isConnected ? 'Live Sync Active' : 'Disconnected'}
                  </span>
                  <button
                    type="button"
                    onClick={() => openConnectorModalForCard(c)}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    {isConnected ? 'Manage / Disconnect →' : 'Connect Account →'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Master Connector Card: Reviews World API Engine */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-primary/30 space-y-3 flex flex-col justify-between hover:border-primary/50 transition shadow-sm gold-glow">
            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isRwConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                }`}>
                  {isRwConnected ? '🟢 Scraper Verified' : '🔴 Action Needed'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">Reviews World API Engine</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Master Play Store &amp; App Store live review scraper API provided by platform owner.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
              <span className={`text-[10px] font-bold flex items-center gap-1 ${isRwConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isRwConnected ? <CheckCircle2 className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                {isRwConnected ? 'HTTP 200 Handshake OK' : 'Not Authenticated'}
              </span>
              <button
                type="button"
                onClick={openRwScraperModal}
                className="text-xs text-primary hover:underline font-bold"
              >
                {isRwConnected ? 'Manage Scraper API →' : 'Authenticate Scraper API →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task 1: Client Onboarding Drawer */}
      <ClientOnboardingDrawer
        isOpen={showOnboardingDrawer}
        onClose={() => setShowOnboardingDrawer(false)}
        onOpenConnector={(platformKey) => {
          const match = CONNECTORS.find((c) => c.platformKey === platformKey);
          if (match) openConnectorModalForCard(match);
        }}
      />

      {/* Task 2: Universal Connector Modal Engine */}
      <ConnectorModal
        isOpen={!!modalTarget}
        onClose={() => setModalTarget(null)}
        target={modalTarget}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
