import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAllClients, useReviews } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { CLIENT_STATUS_DEF } from '@/data/constants';
import type { ClientRow } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
  Users, Plus, Building2, MessageSquareText, TrendingUp, Loader2, X,
  Activity, Radio, CheckCircle2, DollarSign
} from 'lucide-react';

export function AdminDashboard() {
  const { client } = useAuth();
  const { clients, addClient, updateClientStatus, updateClientPlan } = useAllClients(client?.is_super_admin ?? false);
  const { reviews } = useReviews();

  const [activeTab, setActiveTab] = useState<'clients' | 'health'>('clients');
  const [showAddClient, setShowAddClient] = useState(false);

  // Client form
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('pro');
  const [addingClient, setAddingClient] = useState(false);

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

  const activeClientsCount = clients.filter((c) => c.status === 'active').length;
  const totalPositiveCount = reviews.filter((r) => r.sentiment === 'positive').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Executive Control"
        subtitle="Global platform management, client subscriptions, and live API telemetry"
        action={
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add New Client
          </button>
        }
      />

      {/* Admin Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
              <Users className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
              {activeClientsCount} Active
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Clients</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{clients.length}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '40ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-600 dark:bg-electric-500/20 dark:text-electric-300">
              <MessageSquareText className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-accent-700 dark:text-accent-300">
              Multi-Platform
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Reviews Processed</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{reviews.length}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
              {reviews.length ? Math.round((totalPositiveCount / reviews.length) * 100) : 100}% Positive
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Positive Sentiment Rate</p>
          <p className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalPositiveCount}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <DollarSign className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
              MRR Growth
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated SaaS Revenue</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">₹ 4,85,000 / mo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08]">
        <button
          onClick={() => setActiveTab('clients')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition-all',
            activeTab === 'clients'
              ? 'border-accent-500 text-accent-700 dark:text-accent-300'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Users className="h-4 w-4" /> Clients Directory ({clients.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition-all',
            activeTab === 'health'
              ? 'border-accent-500 text-accent-700 dark:text-accent-300'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Activity className="h-4 w-4" /> API Diagnostics & Telemetry
        </button>
      </div>

      {/* Tab 1: Clients */}
      {activeTab === 'clients' && (
        <div className="space-y-3">
          {clients.map((c: ClientRow) => {
            const statusDef = CLIENT_STATUS_DEF[c.status];
            return (
              <div key={c.id} className="glass rounded-2xl p-4 transition-all hover:shadow-md border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-electric-600 text-base font-black text-slate-950">
                      {c.company_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">{c.company_name}</p>
                        {c.is_super_admin && (
                          <span className="rounded-full bg-accent-500/20 px-2.5 py-0.5 text-[9px] font-extrabold text-accent-700 dark:text-accent-300">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs font-bold text-slate-600 dark:text-slate-400">
                        {c.email} · Contact: {c.contact_person || 'N/A'} ({c.phone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Plan toggle */}
                    <select
                      value={c.plan}
                      onChange={(e) => updateClientPlan(c.id, e.target.value as any)}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
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
                        'rounded-xl border px-3 py-1.5 text-xs font-black focus:outline-none',
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

      {/* Tab 2: Health */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-slate-200 bg-white space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Google Play Console API Relay
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Status: Operational (Latency 120ms)</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Service account OAuth tokens active & synced
            </p>
          </div>

          <div className="glass rounded-2xl p-5 border border-slate-200 bg-white space-y-3 dark:border-white/10 dark:bg-white/[0.02]">
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Reviews World Scraper Engine
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Status: Operational (View-Only Scraper Mode)</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Live public rating fetchers active
            </p>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-base-900 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <Building2 className="h-4 w-4 text-accent-600 dark:text-accent-400" /> Add New Client Account
              </h3>
              <button onClick={() => setShowAddClient(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                placeholder="Client Login Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Contact Person Name"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              >
                <option value="trial">Trial Plan</option>
                <option value="starter">Starter Plan</option>
                <option value="pro">Pro Plan</option>
                <option value="enterprise">Enterprise Plan</option>
              </select>
              <button
                onClick={handleAddClient}
                disabled={addingClient || !email.trim() || !company.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
              >
                {addingClient ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Client Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
