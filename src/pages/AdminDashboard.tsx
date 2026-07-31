import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAllClients, useWorkers, useReviews } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { CLIENT_STATUS_DEF, PLAN_LABELS } from '@/data/constants';
import type { ClientRow } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Users, Plus, Building2, Star, MessageSquareText, TrendingUp, Loader2, X,
  ShieldCheck, Briefcase, Activity, Radio, CheckCircle2, DollarSign
} from 'lucide-react';

export function AdminDashboard() {
  const { client } = useAuth();
  const { clients, loading, addClient, updateClientStatus, updateClientPlan } = useAllClients(client?.is_super_admin ?? false);
  const { workers, addWorker } = useWorkers();
  const { reviews } = useReviews();

  const [activeTab, setActiveTab] = useState<'clients' | 'workers' | 'health'>('clients');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);

  // Client form
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('pro');
  const [addingClient, setAddingClient] = useState(false);

  // Worker form
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');

  async function handleAddClient() {
    if (!email.trim() || !company.trim()) return;
    setAddingClient(true);
    try {
      await addClient(email.trim(), company.trim(), contact.trim(), phone.trim(), plan);
      setShowAddClient(false);
      setEmail(''); setCompany(''); setContact(''); setPhone('');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingClient(false);
    }
  }

  async function handleAddWorker() {
    if (!workerName.trim() || !workerEmail.trim()) return;
    await addWorker(workerName.trim(), workerEmail.trim(), ['c-dream-2']);
    setShowAddWorker(false);
    setWorkerName(''); setWorkerEmail('');
  }

  const activeClientsCount = clients.filter((c) => c.status === 'active').length;
  const totalPositiveCount = reviews.filter((r) => r.sentiment === 'positive').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Executive Control"
        subtitle="Global platform management, client subscriptions, worker allocation, and API telemetry"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddWorker(true)}
              className="flex items-center gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 px-3.5 py-2 text-xs font-bold text-accent-300 transition hover:bg-accent-500/20 light:bg-accent-100 light:text-accent-800"
            >
              <Briefcase className="h-4 w-4" /> Add Worker
            </button>
            <button
              onClick={() => setShowAddClient(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2 text-xs font-bold text-base-950 transition hover:shadow-glow"
            >
              <Plus className="h-4 w-4" /> Add New Client
            </button>
          </div>
        }
      />

      {/* Admin Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-500/20 bg-accent-500/10 text-accent-300">
              <Users className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              {activeClientsCount} Active
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clients</p>
          <p className="mt-1 text-2xl font-black text-slate-100 light:text-slate-900">{clients.length}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border" style={{ animationDelay: '40ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-electric-500/20 bg-electric-500/10 text-electric-300">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[10px] font-bold text-accent-300">
              Multi-Platform
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reviews Processed</p>
          <p className="mt-1 text-2xl font-black text-slate-100 light:text-slate-900">{reviews.length}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              {reviews.length ? Math.round((totalPositiveCount / reviews.length) * 100) : 100}% Positive
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Positive Sentiment Rate</p>
          <p className="mt-1 text-2xl font-black text-emerald-300 light:text-emerald-700">{totalPositiveCount}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
              <DollarSign className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              MRR Growth
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Estimated SaaS Revenue</p>
          <p className="mt-1 text-2xl font-black text-slate-100 light:text-slate-900">₹ 4,85,000 / mo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] light:border-slate-200">
        <button
          onClick={() => setActiveTab('clients')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all',
            activeTab === 'clients'
              ? 'border-accent-400 text-accent-300 light:text-accent-700'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Users className="h-4 w-4" /> Clients Directory ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all',
            activeTab === 'workers'
              ? 'border-accent-400 text-accent-300 light:text-accent-700'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Briefcase className="h-4 w-4" /> Moderation Workers ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all',
            activeTab === 'health'
              ? 'border-accent-400 text-accent-300 light:text-accent-700'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Activity className="h-4 w-4" /> API Diagnostics & Health
        </button>
      </div>

      {/* Tab 1: Clients */}
      {activeTab === 'clients' && (
        <div className="space-y-3">
          {clients.map((c: ClientRow) => {
            const statusDef = CLIENT_STATUS_DEF[c.status];
            return (
              <div key={c.id} className="glass rounded-2xl p-4 transition-all hover:border-white/20 border">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-electric-600 text-base font-extrabold text-base-950">
                      {c.company_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-slate-100 light:text-slate-900">{c.company_name}</p>
                        {c.is_super_admin && (
                          <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[9px] font-bold text-accent-300">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-400 light:text-slate-500">
                        {c.email} · Contact: {c.contact_person || 'N/A'} ({c.phone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Plan toggle */}
                    <select
                      value={c.plan}
                      onChange={(e) => updateClientPlan(c.id, e.target.value as any)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                    >
                      <option value="trial">Trial Plan</option>
                      <option value="starter">Starter Plan</option>
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise Plan</option>
                    </select>

                    {/* Status toggle */}
                    <select
                      value={c.status}
                      onChange={(e) => updateClientStatus(c.id, e.target.value as any)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-bold focus:outline-none',
                        statusDef.tone
                      )}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Workers */}
      {activeTab === 'workers' && (
        <div className="space-y-3">
          {workers.map((w) => (
            <div key={w.id} className="glass rounded-2xl p-4 flex items-center justify-between border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/20 text-accent-300 font-bold">
                  {w.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100 light:text-slate-900">{w.name}</p>
                  <p className="text-xs text-slate-400">{w.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center">
                  <p className="text-slate-500">Replies Handled</p>
                  <p className="font-bold text-emerald-400">{w.total_replies}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-500">Avg Speed</p>
                  <p className="font-bold text-accent-300">{w.avg_response_time_minutes} mins</p>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300">
                  {w.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
              <Radio className="h-4 w-4 text-emerald-400" /> Google Play Console API Relay
            </h4>
            <p className="text-xs text-slate-400">Status: Operational (Latency 120ms)</p>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Service account OAuth tokens active</p>
          </div>

          <div className="glass rounded-2xl p-5 border space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-100 light:text-slate-900">
              <Activity className="h-4 w-4 text-amber-400" /> Reviews World Scraper Engine
            </h4>
            <p className="text-xs text-slate-400">Status: Operational (View-Only Mode)</p>
            <p className="text-xs text-amber-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Live public rating fetchers active</p>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-base-900 p-6 shadow-2xl light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 light:border-slate-200">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
                <Building2 className="h-4 w-4 text-accent-400" /> Add New Client Account
              </h3>
              <button onClick={() => setShowAddClient(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                placeholder="Client Login Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                type="text"
                placeholder="Contact Person Name"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              >
                <option value="trial">Trial Plan</option>
                <option value="starter">Starter Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
              <button
                onClick={handleAddClient}
                disabled={addingClient || !email.trim() || !company.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
              >
                {addingClient ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Client Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-base-900 p-6 shadow-2xl light:bg-white light:border-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 light:border-slate-200">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-100 light:text-slate-900">
                <Briefcase className="h-4 w-4 text-accent-400" /> Add Moderation Worker
              </h3>
              <button onClick={() => setShowAddWorker(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Worker Name"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <input
                type="email"
                placeholder="Worker Email"
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-100 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
              />
              <button
                onClick={handleAddWorker}
                disabled={!workerName.trim() || !workerEmail.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-bold text-base-950 transition hover:shadow-glow disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Create Worker Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
