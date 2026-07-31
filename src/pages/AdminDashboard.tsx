import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAllClients, useReviews } from '@/hooks/useData';
import { PageHeader } from '@/components/AppLayout';
import { CLIENT_STATUS_DEF } from '@/data/constants';
import { dbEngine, parsePlayStoreLink, type ClientRow } from '@/lib/dbEngine';
import { cn } from '@/lib/utils';
import {
  Users, Plus, Building2, TrendingUp, Loader2, X,
  Smartphone, Edit, KeyRound, Trash2, Link2, Sparkles, CheckCircle2, DollarSign
} from 'lucide-react';

export function AdminDashboard() {
  const { client } = useAuth();
  const { clients, addClient, updateClientDetails, deleteClient } = useAllClients(client?.is_super_admin ?? false);
  const { reviews } = useReviews();

  const [activeTab, setActiveTab] = useState<'clients' | 'global_api'>('clients');
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  // Global API Key state
  const globalConfig = dbEngine.getGlobalApiKey();
  const hasCustomGlobalKey = !!(globalConfig.api_key && globalConfig.api_key !== 'rw_live_global_key_equinox');

  const [globalApiKey, setGlobalApiKey] = useState(globalConfig.api_key);
  const [globalApiMode, setGlobalApiMode] = useState<'reviews_world_scraper' | 'google_console'>(globalConfig.api_mode);
  const [globalSavedMsg, setGlobalSavedMsg] = useState('');

  // Add Client Form state with Play Store Auto-Fetch
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Shivam@123');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('pro');
  const [playInput, setPlayInput] = useState('com.hoora.customer');
  const [addingClient, setAddingClient] = useState(false);

  // Auto-parsed app details preview
  const parsedApp = parsePlayStoreLink(playInput);

  // Edit Client Form state
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState<'trial' | 'starter' | 'pro' | 'enterprise'>('pro');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [editPlayInput, setEditPlayInput] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  function openEditModal(c: ClientRow) {
    setEditingClient(c);
    setEditEmail(c.email);
    setEditPassword(c.password || 'Shivam@123');
    setEditCompany(c.company_name);
    setEditContact(c.contact_person);
    setEditPhone(c.phone);
    setEditPlan(c.plan);
    setEditStatus(c.status);
    setEditPlayInput(c.app_package_name || 'com.hoora.customer');
  }

  async function handleAddClient() {
    if (!email.trim() || !company.trim()) return;
    setAddingClient(true);
    try {
      const appInfo = parsePlayStoreLink(playInput);
      await addClient({
        email: email.trim(),
        company_name: company.trim(),
        contact_person: contact.trim() || company.trim(),
        phone: phone.trim() || '+91 98765 43210',
        plan,
        password: password.trim() || 'Shivam@123',
        app_package_name: appInfo.package_name,
        app_name: appInfo.app_name,
        app_icon_url: appInfo.app_icon_url,
        app_play_link: appInfo.play_link,
      });
      setShowAddClient(false);
      setEmail(''); setCompany(''); setContact(''); setPhone(''); setPassword('Shivam@123'); setPlayInput('com.hoora.customer');
    } catch (e) {
      console.error(e);
    } finally {
      setAddingClient(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingClient || !editEmail.trim() || !editCompany.trim()) return;
    setSavingEdit(true);
    try {
      const appInfo = parsePlayStoreLink(editPlayInput);
      await updateClientDetails(editingClient.id, {
        email: editEmail.trim(),
        company_name: editCompany.trim(),
        contact_person: editContact.trim(),
        phone: editPhone.trim(),
        password: editPassword.trim() || editingClient.password || 'Shivam@123',
        plan: editPlan,
        status: editStatus,
        app_package_name: appInfo.package_name,
        app_name: appInfo.app_name,
        app_icon_url: appInfo.app_icon_url,
        app_play_link: appInfo.play_link,
      });
      setEditingClient(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteClient(id: string) {
    if (window.confirm('Are you sure you want to delete this client account?')) {
      await deleteClient(id);
    }
  }

  function handleSaveGlobalApi() {
    dbEngine.setGlobalApiKey(globalApiKey.trim(), globalApiMode);
    setGlobalSavedMsg('Global Reviews World API Key saved & verified!');
    setTimeout(() => setGlobalSavedMsg(''), 3000);
  }

  const activeClients = clients.filter((c) => !c.is_super_admin);
  const activeClientsCount = activeClients.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Executive Control"
        subtitle="Manage client accounts, Play Store app link ingestion, and global API credentials"
        action={
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add New Client Account
          </button>
        }
      />

      {/* Admin Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Users className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
              {activeClientsCount} Active
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Client Accounts</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{activeClients.length}</p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '40ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <Smartphone className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
              Auto-Fetched
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ingested Play Store Apps</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{activeClients.filter((c) => c.app_package_name).length}</p>
        </div>

        {/* Reviews World API Status: Only shows Active & Syncing if API key has actually been set up */}
        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '80ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-extrabold', hasCustomGlobalKey ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300')}>
              {hasCustomGlobalKey ? '100% Live' : 'Action Needed'}
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reviews World API Status</p>
          <p className={cn('mt-1 text-xl font-black', hasCustomGlobalKey ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
            {hasCustomGlobalKey ? 'Active & Syncing' : 'Not Configured Yet'}
          </p>
        </div>

        <div className="glass animate-float-up rounded-2xl p-5 shadow-card border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
              <DollarSign className="h-5 w-5" />
            </span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
              Agency Growth
            </span>
          </div>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Recurring Revenue</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">₹ {activeClients.length * 49000} / mo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/[0.08]">
        <button
          onClick={() => setActiveTab('clients')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition-all',
            activeTab === 'clients'
              ? 'border-amber-500 text-amber-700 dark:text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <Users className="h-4 w-4" /> Client Directory ({activeClients.length})
        </button>
        <button
          onClick={() => setActiveTab('global_api')}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition-all',
            activeTab === 'global_api'
              ? 'border-amber-500 text-amber-700 dark:text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          <KeyRound className="h-4 w-4" /> Global Reviews World API Key Setup
        </button>
      </div>

      {/* Tab 1: Clients Directory */}
      {activeTab === 'clients' && (
        <div className="space-y-3">
          {activeClients.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-base-900">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-400" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">No Client Accounts Added Yet</h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Super Admin can add fresh client accounts below. Simply paste their Play Store App Link, and Equinox Pulse will automatically fetch their app logo, name, and package ID!
              </p>
              <button
                onClick={() => setShowAddClient(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow"
              >
                <Plus className="h-4 w-4" /> Add First Client Account
              </button>
            </div>
          ) : (
            activeClients.map((c: ClientRow) => {
              const statusDef = CLIENT_STATUS_DEF[c.status];
              return (
                <div key={c.id} className="glass rounded-2xl p-4.5 transition-all hover:shadow-md border border-slate-200 bg-white dark:border-white/10 dark:bg-base-900">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {/* App Icon / Logo */}
                      <img
                        src={c.app_icon_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.company_name}`}
                        alt={c.company_name}
                        className="h-12 w-12 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-white/10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-black text-slate-900 dark:text-white">{c.company_name}</p>
                          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black capitalize text-amber-800 dark:text-amber-300">
                            {c.plan} Plan
                          </span>
                        </div>
                        <p className="truncate text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                          App: <span className="text-slate-900 dark:text-slate-200">{c.app_name || c.company_name}</span> · Package: <span className="font-mono text-amber-700 dark:text-amber-400">{c.app_package_name || 'com.app.mobile'}</span>
                        </p>
                        <p className="truncate text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          Email: <span className="text-slate-900 dark:text-slate-200">{c.email}</span> · Password: <span className="font-mono text-amber-700 dark:text-amber-400">{c.password || 'Shivam@123'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn('rounded-xl border px-3 py-1 text-xs font-black', statusDef.tone)}>
                        {statusDef.label}
                      </span>
                      <button
                        onClick={() => openEditModal(c)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-800 hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClient(c.id)}
                        className="flex items-center gap-1 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Global API Key Setup (Super Admin Configures API Key for All Clients) */}
      {activeTab === 'global_api' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-base-900 space-y-6">
          <div className="border-b border-slate-200 pb-4 dark:border-white/10">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" /> Global Reviews World API Key Configuration
            </h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              Super Admin configures this global Reviews World API key once. All clients automatically use this key for fetching live ratings!
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-900 dark:text-slate-100">Global Reviews World API Key</label>
              <input
                type="text"
                value={globalApiKey}
                onChange={(e) => setGlobalApiKey(e.target.value)}
                placeholder="rw_live_global_key_equinox"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGlobalApiMode('reviews_world_scraper')}
                className={cn(
                  'rounded-xl border p-3 text-left text-xs font-black transition',
                  globalApiMode === 'reviews_world_scraper'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                )}
              >
                ⚡ Reviews World Scraper Mode
              </button>
              <button
                type="button"
                onClick={() => setGlobalApiMode('google_console')}
                className={cn(
                  'rounded-xl border p-3 text-left text-xs font-black transition',
                  globalApiMode === 'google_console'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                )}
              >
                ✅ Play Console Service Account
              </button>
            </div>

            {globalSavedMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {globalSavedMsg}
              </div>
            )}

            <button
              onClick={handleSaveGlobalApi}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow"
            >
              Save & Validate Global API Key
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal with Play Store Link Auto-Fetch */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-base-900 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" /> Add Client Account & Auto-Fetch App
              </h3>
              <button onClick={() => setShowAddClient(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Play Store Link Auto-Fetcher Input */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4 space-y-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                <label className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Link2 className="h-4 w-4" /> Play Store App Link / Package ID
                </label>
                <input
                  type="text"
                  value={playInput}
                  onChange={(e) => setPlayInput(e.target.value)}
                  placeholder="e.g. https://play.google.com/store/apps/details?id=com.hoora.customer"
                  className="w-full rounded-xl border border-amber-300 bg-white p-2.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-amber-500/40 dark:bg-base-950 dark:text-slate-100"
                />
                
                {/* Auto-Fetched App Preview */}
                {parsedApp.package_name && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-base-900">
                    <img
                      src={parsedApp.app_icon_url}
                      alt={parsedApp.app_name}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white">{parsedApp.app_name}</p>
                      <p className="text-[10px] font-mono text-amber-700 dark:text-amber-400">{parsedApp.package_name}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-300">
                      Auto-Fetched
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Company Name</label>
                  <input
                    type="text"
                    placeholder="Hoora Tech Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Login Email</label>
                  <input
                    type="email"
                    placeholder="client@hoora.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Account Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Subscription Plan</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                  >
                    <option value="trial">Trial Plan</option>
                    <option value="starter">Starter Plan</option>
                    <option value="pro">Pro Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddClient}
                disabled={addingClient || !email.trim() || !company.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
              >
                {addingClient ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Client Account & Ingest App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-base-900 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <Edit className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Edit Client Account Details
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Company Name</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Play Store Link / Package Name</label>
                <input
                  type="text"
                  value={editPlayInput}
                  onChange={(e) => setEditPlayInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Client Login Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Account Password</label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editEmail.trim() || !editCompany.trim()}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
