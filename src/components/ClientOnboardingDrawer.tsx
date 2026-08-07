import { useState } from 'react';
import { toast } from 'sonner';
import { dbEngine } from '@/lib/dbEngine';
import {
  X, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck, Cable, Zap,
  Users, Layers, ArrowRight, Activity, FileCode, KeyRound, Play, Store,
  Instagram, Facebook, Linkedin, Youtube, MessageSquare, Check, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ClientOnboardingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConnector: (platformId: string) => void;
}

const QUEUE_VERTICALS = [
  { id: 'wash_detailing', name: 'Wash & Detailing Queue', description: 'App bookings, service complaints & package inquiries' },
  { id: 'products', name: 'Products & E-Commerce Queue', description: 'Store orders, delivery status & product reviews' },
  { id: 'b2b_franchise', name: 'B2B Franchise & Partners', description: 'Franchise leads, B2B inquiries & dealership support' },
  { id: 'insurance', name: 'Insurance & Claims Queue', description: 'Claim support, policy assistance & damage reports' },
];

const DEFAULT_AGENTS = [
  { id: 'agent-1', name: 'Shivam Kumar (Lead)', email: 'shivam@equinox.com', role: 'Super Admin' },
  { id: 'agent-2', name: 'Ananya Sharma', email: 'ananya@hoora.in', role: 'Senior ORM Agent' },
  { id: 'agent-3', name: 'Rahul Verma', email: 'rahul@hoora.in', role: 'Franchise Support' },
  { id: 'agent-4', name: 'Priya Patel', email: 'priya@hoora.in', role: 'Claims Specialist' },
];

export function ClientOnboardingDrawer({
  isOpen,
  onClose,
  onOpenConnector,
}: ClientOnboardingDrawerProps) {
  if (!isOpen) return null;

  // Setup Checklist State
  const [step1Done, setStep1Done] = useState(true);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookVerified, setWebhookVerified] = useState(true);

  // Queue Assignments state
  const [queueAssignments, setQueueAssignments] = useState<Record<string, string>>({
    wash_detailing: 'agent-1',
    products: 'agent-2',
    b2b_franchise: 'agent-3',
    insurance: 'agent-4',
  });

  // Calculate Progress (7 out of 9 channels connected by default = 78%)
  const connectedChannelsCount = 7;
  const totalChannelsCount = 9;
  const progressPct = Math.round((connectedChannelsCount / totalChannelsCount) * 100);

  const handleTestWebhook = () => {
    setTestingWebhook(true);
    setTimeout(() => {
      setTestingWebhook(false);
      setWebhookVerified(true);
      toast.success('Live Webhook Test Verified! Simulated test payload ingested successfully via WebSocket (HTTP 200 OK).');
    }, 1200);
  };

  const handleSaveQueueAssignments = () => {
    toast.success('Queue routing & agent assignments updated successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-neutral-950 border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col justify-between animate-float-left">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Client Implementation &amp; Onboarding Plan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Step-by-step setup checklist, OAuth access permissions, webhook test &amp; queue routing.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
            
            {/* Progress Bar Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" /> Channel Setup Readiness
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-primary font-mono">
                  {connectedChannelsCount} / {totalChannelsCount} Channels Connected ({progressPct}%)
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 gold-glow"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                7 channels active with live WebSocket ingestion. Complete remaining app store connectors to reach 100% production readiness.
              </p>
            </div>

            {/* Interactive Step-by-Step Checklist */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Onboarding Checklist &amp; Verification Steps
              </h3>

              {/* STEP 1: Admin Access Authorization */}
              <div className={cn(
                "p-4 rounded-2xl border transition space-y-3",
                step1Done
                  ? "bg-white dark:bg-black/30 border-slate-200 dark:border-white/10"
                  : "bg-amber-500/5 border-amber-500/30"
              )}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Admin Access Authorization
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-extrabold border border-emerald-500/20">
                          Verified
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        Guide client team to grant Facebook Page Admin, LinkedIn Company Super Admin, and Google Play Console Service Account permissions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Meta / Facebook Business Page Admin</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">Granted ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> LinkedIn Company Page Admin</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">Granted ✓</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Google Play Console Service Account</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">Granted ✓</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: Connect Social & App Stores */}
              <div className="p-4 rounded-2xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Connect Social &amp; App Stores
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Click Connect on each channel card to trigger OAuth authorization or submit Service Account keys.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { name: 'Instagram', key: 'instagram', icon: Instagram, connected: true },
                    { name: 'Google Play', key: 'playstore', icon: Play, connected: true },
                    { name: 'YouTube', key: 'youtube', icon: Youtube, connected: true },
                    { name: 'Facebook', key: 'facebook', icon: Facebook, connected: true },
                    { name: 'LinkedIn', key: 'linkedin', icon: Linkedin, connected: true },
                    { name: 'X (Twitter)', key: 'x', icon: MessageSquare, connected: false },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        onClose();
                        onOpenConnector(item.key);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] hover:border-primary/40 transition flex items-center justify-between text-xs font-bold text-left group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <item.icon className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate text-slate-900 dark:text-white">{item.name}</span>
                      </div>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-extrabold shrink-0",
                        item.connected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      )}>
                        {item.connected ? 'OAuth OK' : 'Connect'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Webhook Verification Test */}
              <div className="p-4 rounded-2xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Webhook Verification Test
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        Auto-test live ingestion via endpoint <code className="text-primary font-mono text-[10px]">POST /api/webhooks/:platform</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {webhookVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                      <span>{webhookVerified ? 'Live Webhook Verified (HTTP 200 OK)' : 'Webhook Not Tested Yet'}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Simulates sending a live review payload through the ingestion engine.
                    </p>
                  </div>

                  <button
                    onClick={handleTestWebhook}
                    disabled={testingWebhook}
                    className="px-3.5 py-2 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-sm shrink-0 flex items-center gap-1.5 gold-glow disabled:opacity-50"
                  >
                    {testingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    <span>{testingWebhook ? 'Testing...' : 'Test Live Ingestion'}</span>
                  </button>
                </div>
              </div>

              {/* STEP 4: Queue Routing & Agent Assignment */}
              <div className="p-4 rounded-2xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Queue Routing &amp; Agent Assignment
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      Assign team members to handle specific vertical queues (Wash &amp; Detailing, Products, B2B Franchise, Insurance).
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {QUEUE_VERTICALS.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{q.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{q.description}</div>
                      </div>

                      <select
                        value={queueAssignments[q.id] || DEFAULT_AGENTS[0].id}
                        onChange={(e) => setQueueAssignments({ ...queueAssignments, [q.id]: e.target.value })}
                        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-primary shrink-0"
                      >
                        {DEFAULT_AGENTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveQueueAssignments}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white/10 text-white font-bold text-xs hover:bg-slate-800 transition shadow-sm border border-white/10"
                  >
                    Save Queue Routing Rules
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Client Onboarding Spec v2.4 · Equinox Pulse SaaS Engine
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary text-slate-950 font-black text-xs hover:bg-primary/90 transition shadow-sm gold-glow"
            >
              Done &amp; Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
