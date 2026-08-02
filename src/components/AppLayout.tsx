import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { dbEngine } from '@/lib/dbEngine';
import {
  Sparkles, ChevronDown, LayoutDashboard, MessageSquare, Radar, ShieldAlert, Trophy,
  FileBarChart2, Users, Settings, LogOut, Search, Menu, X, Wand2, Cable, Mic,
  Sun, Moon, User, Building2, Phone, Mail, ShieldCheck, DownloadCloud, Radio, BarChart3, Smartphone, ShoppingCart, Instagram, Linkedin, Store
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORMS } from '@/data/constants';
import type { PlatformId } from '@/types';
import { NotificationCenter } from '@/components/equinox/NotificationCenter';
import { ProfileMenu } from '@/components/equinox/ProfileMenu';
import { CommandPalette } from '@/components/equinox/CommandPalette';

const CLIENT_ICONS: Partial<Record<PlatformId, LucideIcon>> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageSquare,
  indiamart: Store,
  google_business: Store,
  facebook: MessageSquare,
  instagram: Instagram,
  x: MessageSquare,
  youtube: Smartphone,
};

export const ADMIN_NAV = [
  { key: 'dashboard', label: 'Admin Dashboard', to: '/app', icon: LayoutDashboard, group: 'Analytics', end: true },
  { key: 'live-fetcher', label: 'Live Fetcher', to: '/app/live-fetcher', icon: DownloadCloud, group: 'Analytics' },
  { key: 'clients', label: 'Manage Clients', to: '/app/clients', icon: Users, group: 'Analytics' },
  { key: 'insights', label: 'AI Insights', to: '/app/insights', icon: Wand2, group: 'Analytics', accent: true },
  { key: 'social', label: 'Social Listening', to: '/app/social', icon: Radar, group: 'Monitoring' },
  { key: 'crisis', label: 'Crisis Center', to: '/app/crisis', icon: ShieldAlert, group: 'Monitoring' },
  { key: 'competitors', label: 'Competitors', to: '/app/competitors', icon: Trophy, group: 'Monitoring' },
  { key: 'voice_of_market', label: 'Voice of Market', to: '/app/voice-of-market', icon: Mic, group: 'Monitoring', accent: true },
  { key: 'integrations', label: 'Integrations & APIs', to: '/app/integrations', icon: Cable, group: 'Executive', accent: true },
  { key: 'reports', label: 'Reports', to: '/app/reports', icon: FileBarChart2, group: 'Executive' },
  { key: 'team', label: 'Team & Access', to: '/app/team', icon: Users, group: 'Executive' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { client, userRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isAdmin = userRole === 'super_admin';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const navigateToView = (key: string) => {
    const found = ADMIN_NAV.find((item) => item.key === key);
    if (found) {
      navigate(found.to);
    } else {
      navigate('/app');
    }
  };

  // Super admin Equinox layout
  if (isAdmin) {
    const activeNav = ADMIN_NAV.find((n) =>
      n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
    ) || ADMIN_NAV[0];

    const groups = ['Analytics', 'Monitoring', 'Executive'];

    return (
      <div className="min-h-screen bg-background text-foreground relative noise selection:bg-amber-500/30">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        
        <div className="flex relative z-10 min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-sidebar/40 backdrop-blur-xl">
            <div className="flex h-full flex-col">
              {/* Brand Header */}
              <div className="px-5 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg gold-border gold-glow bg-black/60 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Equinox Pulse
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Enterprise · AI</div>
                  </div>
                </div>
              </div>

              {/* Organization Switcher Badge */}
              <div className="px-3 py-3 border-b border-white/5">
                <button
                  type="button"
                  onClick={() => navigate('/app/integrations')}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg bg-black/30 border border-white/5 hover:border-primary/25 transition"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-black shrink-0">
                    E
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-semibold truncate text-white">Equinox Motors India</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Super Admin Workspace</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Navigation Groups */}
              <nav className="flex-1 px-3 py-4 space-y-4 scrollbar-thin overflow-y-auto no-scrollbar">
                {groups.map((g) => (
                  <div key={g}>
                    <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">{g}</div>
                    <div className="space-y-0.5">
                      {ADMIN_NAV.filter((n) => n.group === g).map((item) => {
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
                                ? 'bg-primary/10 text-primary border border-primary/25 gold-glow'
                                : 'text-neutral-300 hover:bg-white/5 hover:text-primary border border-transparent'
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
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
                ))}
              </nav>

              {/* Bottom Footer Options */}
              <div className="p-3 border-t border-white/5 space-y-1">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-300 hover:bg-white/5 hover:text-primary transition font-medium"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-neutral-300" />}
                    <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/10 text-neutral-300 uppercase">
                    {theme}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-neutral-300 hover:bg-rose-500/10 hover:text-rose-400 transition font-medium text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" /> Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content & Topbar */}
          <main className="flex-1 min-w-0 flex flex-col min-h-screen">
            {/* Topbar Header */}
            <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(true)}
                    className="lg:hidden w-9 h-9 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-neutral-300 hover:text-primary hover:border-primary/30 transition shrink-0"
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                  <div className="lg:hidden flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-md gold-border gold-glow bg-black/60 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold">
                      <span>Equinox Pulse AI</span>
                      <span>/</span>
                      <span className="text-primary">{activeNav.group}</span>
                    </div>
                    <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                      {activeNav.label}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCmdOpen(true)}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary transition"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Quick nav &amp; search…</span>
                    <kbd className="ml-4 px-1.5 py-0.5 text-[10px] rounded bg-white/5 border border-white/10 font-mono">⌘K</kbd>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCmdOpen(true)}
                    className="md:hidden w-9 h-9 rounded-lg border border-white/10 bg-black/40 flex items-center justify-center text-neutral-300 hover:text-primary hover:border-primary/30 transition"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {/* Topbar Light / Dark Theme Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
                    className="h-9 w-9 rounded-lg border border-white/10 bg-black/40 hover:bg-white/5 text-neutral-300 flex items-center justify-center transition"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-neutral-300" />}
                  </button>

                  <NotificationCenter onNavigate={navigateToView} />
                  
                  <div className="pl-2 sm:pl-3 border-l border-white/5">
                    <ProfileMenu
                      sessionUser={{ name: 'Shivam Admin', email: 'shivam@equinox.com', role: 'super_admin' }}
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
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                  onClick={() => setMobileDrawerOpen(false)}
                />
                <div className="relative flex w-72 flex-col border-r border-white/10 bg-neutral-950 p-4 shadow-2xl z-10">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gold-border gold-glow bg-black/60 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Equinox Pulse
                      </span>
                    </div>
                    <button onClick={() => setMobileDrawerOpen(false)} className="text-neutral-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                    {groups.map((g) => (
                      <div key={g}>
                        <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">{g}</div>
                        <div className="space-y-1">
                          {ADMIN_NAV.filter((n) => n.group === g).map((item) => {
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
                                    : 'text-neutral-300 hover:bg-white/5 hover:text-primary border border-transparent'
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

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-2">
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4" />}
                        <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
                      </div>
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Page Content */}
            <div className="p-4 sm:p-6 max-w-[1600px] mx-auto w-full flex-1">
              {children}
            </div>
          </main>
        </div>

        <CommandPalette open={cmdOpen} setOpen={setCmdOpen} setView={navigateToView} />
      </div>
    );
  }

  // Client mode
  const mainNav = [
    { to: '/app', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/reports', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/app/playstore-live', label: 'Play Store Live & Drops', icon: Radio },
    { to: '/app/social-inbox', label: 'Direct Social DMs', icon: MessageSquare },
  ];

  const platformNav = PLATFORMS.map((p) => ({
    to: `/app/platform/${p.id}`,
    label: p.label,
    icon: CLIENT_ICONS[p.id] || Smartphone,
  }));

  return (
    <div className="flex min-h-screen transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-base-950 dark:text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white backdrop-blur-2xl md:flex md:flex-col dark:border-white/[0.08] dark:bg-base-950/80">
        <div className="flex h-16 items-center border-b border-slate-200 px-4 bg-white dark:bg-base-950 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Equinox Pulse"
              className="h-9 w-9 object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                EQUINOX <span className="text-amber-500">PULSE</span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Insights. Trends.
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
          <div>
            <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Main Client Workspace
            </p>
            <div className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all',
                      isActive
                        ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 dark:shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]'
                        : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monitored Platforms
            </p>
            <div className="space-y-1">
              {platformNav.map((p) => (
                <NavLink
                  key={p.to}
                  to={p.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all',
                      isActive
                        ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                    )
                  }
                >
                  <p.icon className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="truncate">{p.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Appearance &amp; Theme
            </p>
            <button
              onClick={toggleTheme}
              className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                )}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </div>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-extrabold text-slate-800 dark:bg-white/10 dark:text-slate-300">
                {theme}
              </span>
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3.5 dark:border-white/[0.08]">
          <button
            onClick={() => setShowProfileModal(true)}
            className="mb-2.5 flex w-full items-center gap-2.5 rounded-xl bg-slate-100 p-2.5 text-left transition hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
          >
            <img
              src={client?.app_icon_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${client?.company_name}`}
              alt={client?.company_name}
              className="h-8 w-8 rounded-full object-cover border-2 border-amber-500/50 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-200">{client?.company_name}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{client?.email}</p>
            </div>
            <User className="h-4 w-4 text-slate-400 shrink-0" />
          </button>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
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
