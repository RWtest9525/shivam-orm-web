import { useState } from 'react';
import { toast } from 'sonner';
import { Cable, Play, Store, Globe, Instagram, Facebook, Linkedin, Youtube, CheckCircle2, RefreshCw } from 'lucide-react';

export function IntegrationsPage() {
  const [loading, setLoading] = useState(false);

  const connectors = [
    { id: 'google_play', name: 'Google Play Console API', icon: Play, status: 'Connected', syncTime: '10 mins ago', color: 'text-emerald-400' },
    { id: 'app_store', name: 'Apple App Store Connect', icon: Store, status: 'Connected', syncTime: '15 mins ago', color: 'text-sky-400' },
    { id: 'google_business', name: 'Google Business Profile', icon: Globe, status: 'Connected', syncTime: '1 hour ago', color: 'text-amber-400' },
    { id: 'instagram', name: 'Instagram Graph API', icon: Instagram, status: 'Connected', syncTime: '30 mins ago', color: 'text-pink-400' },
    { id: 'facebook', name: 'Facebook Pages Manager', icon: Facebook, status: 'Standby', syncTime: '2 hours ago', color: 'text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn Company Page', icon: Linkedin, status: 'Connected', syncTime: '45 mins ago', color: 'text-sky-500' },
    { id: 'youtube', name: 'YouTube Data API v3', icon: Youtube, status: 'Connected', syncTime: '1 hour ago', color: 'text-red-500' },
  ];

  const handleSyncAll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('All enterprise integrations synced successfully');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Cable className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enterprise Integrations Hub
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connectors for Play Store, App Store, Google Business, and social listening channels.
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((c) => {
          const Icon = c.icon;
          const isConnected = c.status === 'Connected';
          return (
            <div key={c.id} className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3 flex flex-col justify-between hover:border-primary/25 transition">
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mt-3">{c.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Last synced: {c.syncTime}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Syncing
                </span>
                <button
                  onClick={() => toast.success(`Synced ${c.name}`)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Configure Key →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
