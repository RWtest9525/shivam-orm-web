import { useState, useRef, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { dbEngine } from '@/lib/dbEngine';
import {
  Sparkles, ChevronDown, LayoutDashboard, MessageSquare, Radar, ShieldAlert, Trophy,
  FileBarChart2, Users, Settings, LogOut, Search, Menu, X, Wand2, Cable, Mic,
  Sun, Moon, ShieldCheck, DownloadCloud, Radio, DollarSign, Check, ArrowRightLeft,
  Receipt, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationCenter } from '@/components/equinox/NotificationCenter';
import { ProfileMenu } from '@/components/equinox/ProfileMenu';
import { CommandPalette } from '@/components/equinox/CommandPalette';

export interface NavItemDef {
  key: string;
  label: string;
  to: string;
  icon: any;
  group: 'Analytics' | 'Monitoring' | 'Executive';
  end?: boolean;
  accent?: boolean;
  adminOnly?: boolean;
}

export const APP_NAV_ITEMS: NavItemDef[] = [
  { key: 'dashboard', label: 'Executive Dashboard', to: '/app', icon: LayoutDashboard, group: 'Analytics', end: true },
  { key: 'billing', label: 'Client Amounts & Invoices', to: '/app/billing', icon: Receipt, group: 'Analytics', accent: true },
  { key: 'playstore-live', label: 'Play Store Live Tracker', to: '/app/playstore-live', icon: Radio, group: 'Analytics' },
  { key: 'live-fetcher', label: 'Live Review Fetcher', to: '/app/live-fetcher', icon: DownloadCloud, group: 'Analytics' },
  { key: 'clients', label: 'Manage Clients', to: '/app/clients', icon: Users, group: 'Analytics', adminOnly: true },
  { key: 'insights', label: 'AI Insights', to: '/app/insights', icon: Wand2, group: 'Analytics' },
  { key: 'social-inbox', label: 'Direct Social DMs', to: '/app/social-inbox', icon: MessageSquare, group: 'Monitoring' },
  { key: 'social', label: 'Social Listening', to: '/app/social', icon: Radar, group: 'Monitoring' },
  { key: 'crisis', label: 'Crisis Center', to: '/app/crisis', icon: ShieldAlert, group: 'Monitoring' },
  { key: 'competitors', label: 'Competitors', to: '/app/competitors', icon: Trophy, group: 'Monitoring' },
  { key: 'voice_of_market', label: 'Voice of Market', to: '/app/voice-of-market', icon: Mic, group: 'Monitoring' },
  { key: 'integrations', label: 'Integrations & APIs', to: '/app/integrations', icon: Cable, group: 'Executive' },
  { key: 'reports', label: 'Reports & Exports', to: '/app/reports', icon: FileBarChart2, group: 'Executive' },
  { key: 'settings', label: 'Settings', to: '/app/settings', icon: Settings, group: 'Executive' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { client, userRole, isMasterAdmin, switchUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');

  const switcherRef = useRef<HTMLDivElement>(null);
  const allClients = dbEngine.getClients();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const navigateToView = (key: string) => {
    const found = APP_NAV_ITEMS.find((item) => item.key === key);
    if (found) {
      navigate(found.to);
    } else {
      navigate('/app');
    }
  };

  // Filter navigation links based on permissions ("Manage Clients" is strictly Admin only)
  const navItems = APP_NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isMasterAdmin && userRole !== 'super_admin') {
      return false;
    }
    return true;
  });

  const activeNav = navItems.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  ) || navItems[0];

  const groups: Array<'Analytics' | 'Monitoring' | 'Executive'> = ['Analytics', 'Monitoring', 'Executive'];

  const filteredClientsForSwitcher = allClients.filter((c) =>
    c.company_name.toLowerCase().includes(switcherSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(switcherSearch.toLowerCase()) ||
    (c.app_name && c.app_name.toLowerCase().includes(switcherSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-background dark:text-foreground relative noise selection:bg-amber-500/30 transition-colors duration-200">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      
      <div className="flex relative z-10 min-h-screen">
        {/* Unified Left Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-white/5 dark:bg-sidebar/40 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            
            {/* Brand Header */}
            <div className="px-5 py-5 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg gold-border gold-glow bg-slate-900 dark:bg-black/60 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Equinox Pulse
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground font-semibold">
                    {isMasterAdmin ? 'Enterprise · Super Admin' : 'Client ORM Portal'}
                  </div>
                </div>
              </div>
            </div>

            {/* Left Side Account / Client Switcher */}
            <div className="px-3 py-3 border-b border-slate-200 dark:border-white/5 relative" ref={switcherRef}>
              {isMasterAdmin ? (
                <div>
                  <div className="px-2 pb-1 flex items-center justify-between text-[9px] font-extrabold uppercase text-amber-600 dark:text-primary tracking-widest">
                    <span>Instant Switcher</span>
                    <span className="bg-primary/20 text-primary px-1 rounded">Super Admin</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSwitcherOpen(!switcherOpen)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-primary/50 transition group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-sm overflow-hidden">
                      {client?.app_icon_url ? (
                        <img src={client.app_icon_url} alt={client.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {client?.company_name || 'Select Account'}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-muted-foreground truncate font-medium">
                        {client?.email}
                      </div>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", switcherOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Modal for Super Admin Account Switcher */}
                  {switcherOpen && (
                    <div className="absolute left-3 right-3 top-full mt-1.5 z-50 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-3 space-y-2 animate-float-up">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-white/10 pb-2">
                        <span className="flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> Instant ID Switcher
                        </span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
                          {allClients.length} Accounts
                        </span>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search client or email..."
                          value={switcherSearch}
                          onChange={(e) => setSwitcherSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5 scrollbar-thin">
                        <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 px-2 pt-1">
                          Select Account Context
                        </p>
                        {filteredClientsForSwitcher.map((c) => {
                          const isCurrent = c.email.toLowerCase() === client?.email.toLowerCase();
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                switchUser(c.email);
                                setSwitcherOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition",
                                isCurrent
                                  ? "bg-primary/15 text-primary border border-primary/30 font-bold"
                                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-medium"
                              )}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {c.app_icon_url ? (
                                  <img src={c.app_icon_url} alt="" className="w-6 h-6 rounded-md object-cover shrink-0 border border-slate-200 dark:border-white/10" />
                                ) : (
                                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-[10px] shrink-0">
                                    {c.company_name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="truncate font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                    {c.company_name}
                                    {c.is_super_admin && (
                                      <span className="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded font-extrabold">ADMIN</span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">{c.email}</div>
                                </div>
                              </div>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Static Non-Switchable Workspace Badge for Clients */
                <div className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-sm overflow-hidden">
                    {client?.app_icon_url ? (
                      <img src={client.app_icon_url} alt={client.company_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {client?.company_name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Client Workspace
                    </div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              )}
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 space-y-4 scrollbar-thin overflow-y-auto no-scrollbar">
              {groups.map((g) => {
                const groupItems = navItems.filter((n) => n.group === g);
                if (groupItems.length === 0) return null;
                return (
                  <div key={g}>
                    <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-muted-foreground/70 font-semibold">{g}</div>
                    <div className="space-y-0.5">
                      {groupItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.end
                          ? location.pathname === item.to
                          : location.pathname.startsWith(item.to);
                        return (
                          <NavLink
                            key={item.key}
                            to={item.to}
                            end={item.end}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                              active
                                ? 'bg-primary/10 text-primary border border-primary/25 gold-glow font-bold'
                                : 'text-slate-700 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-white/5 hover:text-primary border border-transparent'
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span className="truncate">{item.label}</span>
                            {item.accent && !active && (
                              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase tracking-widest shrink-0">
                                New
                              </span>
                            )}
                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary pulse-gold shrink-0" />}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Bottom Footer Options */}
            <div className="p-3 border-t border-slate-200 dark:border-white/5 space-y-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary transition font-medium"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-slate-700" />}
                  <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-neutral-300 uppercase">
                  {theme}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-neutral-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition font-medium text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen">
          
          {/* Topbar Header */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 dark:border-white/5 dark:bg-background/80 backdrop-blur-xl">
            {/* Instant Admin Switcher Banner when Super Admin is viewing client context */}
            {isMasterAdmin && client && !client.is_super_admin && (
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="truncate">
                    Admin Instant Switcher Active: Currently viewing panel as <strong>{client.company_name}</strong> ({client.email})
                  </span>
                </div>
                <button
                  onClick={() => switchUser('shivam@equinox.com')}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black hover:bg-amber-400 transition shrink-0 ml-2 shadow-sm"
                >
                  Switch Back to Super Admin
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(true)}
                  className="lg:hidden w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/40 flex items-center justify-center text-slate-700 dark:text-neutral-300 hover:text-primary transition shrink-0"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <div className="lg:hidden flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-md gold-border gold-glow bg-black/60 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500 dark:text-muted-foreground font-semibold">
                    <span>Equinox Pulse</span>
                    <span>/</span>
                    <span className="text-amber-600 dark:text-primary">{activeNav.group}</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    {activeNav.label}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setCmdOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-black/40 dark:border-white/5 text-xs text-slate-500 dark:text-muted-foreground hover:border-primary/30 hover:text-primary transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Quick nav &amp; search…</span>
                  <kbd className="ml-4 px-1.5 py-0.5 text-[10px] rounded bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 font-mono">⌘K</kbd>
                </button>

                {/* Topbar Theme Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
                  className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-black/40 text-slate-700 dark:text-neutral-300 hover:text-primary transition flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-slate-700" />}
                </button>

                <NotificationCenter onNavigate={navigateToView} />
                
                <div className="pl-2 sm:pl-3 border-l border-slate-200 dark:border-white/5">
                  <ProfileMenu
                    sessionUser={{
                      name: client?.contact_person || 'User',
                      email: client?.email || '',
                      role: userRole,
                    }}
                    onLogout={handleSignOut}
                    onNavigate={navigateToView}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Drawer Overlay */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <div className="relative flex w-72 flex-col border-r border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-4 shadow-2xl z-10">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gold-border gold-glow bg-black/60 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Equinox Pulse
                    </span>
                  </div>
                  <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                  {groups.map((g) => (
                    <div key={g}>
                      <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-muted-foreground/70 font-semibold">{g}</div>
                      <div className="space-y-1">
                        {navItems.filter((n) => n.group === g).map((item) => {
                          const Icon = item.icon;
                          const active = item.end
                            ? location.pathname === item.to
                            : location.pathname.startsWith(item.to);
                          return (
                            <NavLink
                              key={item.key}
                              to={item.to}
                              end={item.end}
                              onClick={() => setMobileDrawerOpen(false)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                                active
                                  ? 'bg-primary/10 text-primary border border-primary/25 gold-glow'
                                  : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary border border-transparent'
                              )}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-2">
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
                      <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                    </div>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Content Container */}
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full flex-1">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} setView={navigateToView} />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>Equinox Pulse</span>
          <span className="text-amber-500">/</span>
          <span className="text-amber-600 dark:text-amber-400">{title}</span>
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
