import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Settings, LogOut, Smartphone, ShoppingCart, Instagram,
  Linkedin, MessageCircle, Store, Users, ShieldCheck, ChevronRight, Sun, Moon,
  Menu, X, Radio, MessageSquare, Briefcase, Zap, AlertTriangle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORMS } from '@/data/constants';
import type { PlatformId } from '@/types';

const ICONS: Record<PlatformId, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  end?: boolean;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { client, userRole, switchUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isAdmin = userRole === 'super_admin';
  const isWorker = userRole === 'worker';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const mainNav: NavItem[] = isAdmin
    ? [
        { to: '/app', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/clients', label: 'Manage Clients', icon: Users, badge: 'Live' },
        { to: '/app/workers', label: 'Worker Moderation', icon: Briefcase },
        { to: '/app/settings', label: 'System Settings', icon: Settings },
      ]
    : isWorker
    ? [
        { to: '/app/worker', label: 'Rapid Reply Queue', icon: Zap, badge: 'Action Needed', end: true },
        { to: '/app/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { to: '/app', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/playstore-live', label: 'Play Store Live & Drops', icon: Radio, badge: 'Live Tracker' },
        { to: '/app/social-inbox', label: 'Social Messenger', icon: MessageSquare, badge: 'Direct DMs' },
        { to: '/app/settings', label: 'Settings & API Keys', icon: Settings },
      ];

  const platformNav: NavItem[] = PLATFORMS.map((p) => ({
    to: `/app/platform/${p.id}`,
    label: p.short,
    icon: ICONS[p.id],
  }));

  const renderNavList = (onItemClick?: () => void) => (
    <div className="space-y-4">
      {/* Role switch pill for quick testing */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 dark:border-white/10 light:border-slate-200 light:bg-slate-100">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 light:text-slate-500">
          Role Switcher (Demo)
        </p>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => { switchUser('client@dreamapps.com'); onItemClick?.(); }}
            className={cn(
              'rounded-md py-1 text-[10px] font-semibold transition',
              userRole === 'client'
                ? 'bg-accent-500 text-base-950 shadow'
                : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
            )}
          >
            Client
          </button>
          <button
            onClick={() => { switchUser('admin@shivamorm.com'); onItemClick?.(); }}
            className={cn(
              'rounded-md py-1 text-[10px] font-semibold transition',
              userRole === 'super_admin'
                ? 'bg-accent-500 text-base-950 shadow'
                : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
            )}
          >
            Admin
          </button>
          <button
            onClick={() => { switchUser('rohan.mod@shivamorm.com'); onItemClick?.(); }}
            className={cn(
              'rounded-md py-1 text-[10px] font-semibold transition',
              userRole === 'worker'
                ? 'bg-accent-500 text-base-950 shadow'
                : 'text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900'
            )}
          >
            Worker
          </button>
        </div>
      </div>

      <div>
        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 light:text-slate-400">
          {isAdmin ? 'Super Admin Workspace' : isWorker ? 'Moderator Portal' : 'Main Workspace'}
        </p>
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-accent-500/20 to-electric-500/10 text-accent-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)] light:bg-accent-500/10 light:text-accent-700'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200/60 light:hover:text-slate-900'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4 shrink-0 text-accent-400" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[9px] font-bold text-accent-300 light:bg-accent-500/20 light:text-accent-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {!isAdmin && !isWorker && (
        <div>
          <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 light:text-slate-400">
            Monitored Platforms
          </p>
          <div className="space-y-1">
            {platformNav.map((p) => (
              <NavLink
                key={p.to}
                to={p.to}
                onClick={onItemClick}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
                    isActive
                      ? 'bg-accent-500/15 text-accent-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)] light:bg-accent-500/10 light:text-accent-700'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 light:text-slate-600 light:hover:bg-slate-200/60 light:hover:text-slate-900'
                  )
                }
              >
                <p.icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{p.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/[0.08] bg-base-950/70 backdrop-blur-2xl md:flex md:flex-col light:border-slate-200 light:bg-white/90">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4 light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-electric-600 shadow-glow">
              <span className="text-sm font-black text-base-950">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wide text-white light:text-slate-900">
                SHIVAM <span className="text-accent-400">ORM</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 light:text-slate-500">
                {isAdmin ? 'Super Admin Control' : isWorker ? 'Moderator Panel' : 'Enterprise Client'}
              </span>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 light:border-slate-300 light:bg-slate-100 light:text-slate-700 light:hover:bg-slate-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {renderNavList()}
        </nav>

        {/* User Card */}
        <div className="border-t border-white/[0.08] p-3.5 light:border-slate-200">
          <div className="mb-2.5 flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-2.5 light:bg-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-electric-600 text-xs font-bold text-base-950">
              {client?.company_name?.charAt(0) ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-200 light:text-slate-900">{client?.company_name}</p>
              <p className="truncate text-[10px] text-slate-400 light:text-slate-500">{client?.email}</p>
            </div>
            {isAdmin && <ShieldCheck className="h-4 w-4 text-accent-400" />}
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 light:border-rose-300 light:bg-rose-50 light:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-base-950/90 px-4 backdrop-blur-xl md:hidden light:border-slate-200 light:bg-white/95">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-200 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-electric-600 text-xs font-extrabold text-base-950">S</div>
            <span className="text-sm font-black text-white light:text-slate-900">SHIVAM ORM</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
          <button onClick={handleSignOut} className="text-slate-400 hover:text-rose-400">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col border-r border-white/10 bg-base-950 p-4 shadow-2xl light:border-slate-200 light:bg-white">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 light:border-slate-200">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-electric-600 text-xs font-extrabold text-base-950">S</div>
                <span className="text-sm font-bold text-white light:text-slate-900">Shivam ORM</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {renderNavList(() => setMobileDrawerOpen(false))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-14 md:pt-0">
        {/* Mobile Horizontal Quick Navigation */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-white/[0.08] bg-base-950/60 p-2.5 no-scrollbar md:hidden light:border-slate-200 light:bg-slate-100">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-accent-500/20 text-accent-300 light:bg-accent-500/10 light:text-accent-700'
                    : 'text-slate-400 light:text-slate-600'
                )
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>

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
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 light:text-slate-500">
          <span>Shivam ORM</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-accent-400 font-semibold">{title}</span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white light:text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-400 light:text-slate-600">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
