import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard, Settings, LogOut, Smartphone, ShoppingCart, Instagram,
  Linkedin, MessageCircle, Store, Users, ShieldCheck, ChevronRight, Sun, Moon,
  Menu, X, Radio, MessageSquare
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
  const { client, userRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isAdmin = userRole === 'super_admin';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const mainNav: NavItem[] = isAdmin
    ? [
        { to: '/app', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/clients', label: 'Manage Clients', icon: Users, badge: 'Live' },
        { to: '/app/settings', label: 'System Settings', icon: Settings },
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
      <div>
        <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isAdmin ? 'Super Admin Workspace' : 'Main Client Workspace'}
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
                  'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-accent-500/15 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300 dark:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)]'
                    : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[9px] font-extrabold text-accent-700 dark:bg-accent-500/20 dark:text-accent-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {!isAdmin && (
        <div>
          <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                    'group flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all',
                    isActive
                      ? 'bg-accent-500/15 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300'
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
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-base-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white backdrop-blur-2xl md:flex md:flex-col dark:border-white/[0.08] dark:bg-base-950/80">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-electric-600 shadow-glow">
              <span className="text-sm font-black text-slate-950">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                SHIVAM <span className="text-accent-600 dark:text-accent-400">ORM</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Super Admin Control' : 'Enterprise Client'}
              </span>
            </div>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light (White)' : 'Dark (Black)'} mode`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>White</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-slate-700" />
                <span>Black</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {renderNavList()}
        </nav>

        {/* User Card */}
        <div className="border-t border-slate-200 p-3.5 dark:border-white/[0.08]">
          <div className="mb-2.5 flex items-center gap-2.5 rounded-xl bg-slate-100 p-2.5 dark:bg-white/[0.04]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-electric-600 text-xs font-bold text-slate-950">
              {client?.company_name?.charAt(0) ?? 'S'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-200">{client?.company_name}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{client?.email}</p>
            </div>
            {isAdmin && <ShieldCheck className="h-4 w-4 text-accent-600 dark:text-accent-400" />}
          </div>

          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-base-950/90">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-electric-600 text-xs font-extrabold text-slate-950">S</div>
            <span className="text-sm font-black text-slate-900 dark:text-white">SHIVAM ORM</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            <span className="text-[10px] font-bold">{theme === 'dark' ? 'White' : 'Black'}</span>
          </button>
          <button onClick={handleSignOut} className="text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col border-r border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-base-950">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-electric-600 text-xs font-extrabold text-slate-950">S</div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Shivam ORM</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-slate-100 p-2.5 no-scrollbar md:hidden dark:border-white/[0.08] dark:bg-base-950/60">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                  isActive
                    ? 'bg-accent-500/20 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300'
                    : 'text-slate-600 dark:text-slate-400'
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
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <span>Shivam ORM</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-accent-600 dark:text-accent-400">{title}</span>
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
