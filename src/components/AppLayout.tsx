import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { dbEngine } from '@/lib/dbEngine';
import {
  LayoutDashboard, Settings, LogOut, Smartphone, ShoppingCart, Instagram,
  Linkedin, MessageCircle, Store, Users, ShieldCheck, ChevronRight, Sun, Moon,
  Menu, X, Radio, MessageSquare, DownloadCloud, User, Building2, Phone, Mail, Award, BarChart3
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLATFORMS } from '@/data/constants';
import type { PlatformId } from '@/types';

const ICONS: Partial<Record<PlatformId, LucideIcon>> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
  google_business: Store,
  facebook: MessageCircle,
  instagram: Instagram,
  x: MessageCircle,
  youtube: Smartphone,
};

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { client, userRole, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isAdmin = userRole === 'super_admin';

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const mainNav: NavItem[] = isAdmin
    ? [
        { to: '/app', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/reports', label: 'Analytics & Reports', icon: BarChart3 },
        { to: '/app/live-fetcher', label: 'Live Fetcher', icon: DownloadCloud },
        { to: '/app/clients', label: 'Manage Clients', icon: Users },
        { to: '/app/settings', label: 'Settings & API Keys', icon: Settings },
      ]
    : [
        { to: '/app', label: 'Executive Dashboard', icon: LayoutDashboard, end: true },
        { to: '/app/reports', label: 'Analytics & Reports', icon: BarChart3 },
        { to: '/app/playstore-live', label: 'Play Store Live & Drops', icon: Radio },
        { to: '/app/social-inbox', label: 'Direct Social DMs', icon: MessageSquare },
        { to: '/app/settings', label: 'Settings & API Keys', icon: Settings },
      ];

  const platformNav: NavItem[] = PLATFORMS.map((p) => ({
    to: `/app/platform/${p.id}`,
    label: p.label,
    icon: ICONS[p.id] || Smartphone,
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
      )}

      {/* Theme Preference Menu Item */}
      <div>
        <p className="px-2 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Appearance & Theme
        </p>
        <button
          onClick={() => { toggleTheme(); onItemClick?.(); }}
          className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            )}
            <span>{theme === 'dark' ? 'White Theme' : 'Black Theme'}</span>
          </div>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-extrabold text-slate-800 dark:bg-white/10 dark:text-slate-300">
            {theme === 'dark' ? 'Black' : 'White'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen transition-colors duration-200 bg-slate-50 text-slate-900 dark:bg-base-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white backdrop-blur-2xl md:flex md:flex-col dark:border-white/[0.08] dark:bg-base-950/80">
        {/* Seamless Theme-Aware Brand Header */}
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
                {isAdmin ? 'Super Admin' : 'Insights. Trends.'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto p-4 no-scrollbar">
          {renderNavList()}
        </nav>

        {/* User Profile Card Trigger */}
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
            {isAdmin ? <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" /> : <User className="h-4 w-4 text-slate-400 shrink-0" />}
          </button>

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
            <img src="/logo.png" alt="Equinox Pulse" className="h-8 w-8 object-contain filter drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
            <span className="text-sm font-black text-slate-900 dark:text-white">EQUINOX PULSE</span>
          </div>
        </div>

        <button onClick={() => setShowProfileModal(true)} className="p-1 text-slate-600 dark:text-slate-300">
          <User className="h-5 w-5" />
        </button>
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
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-500/60 bg-slate-950 p-0.5">
                  <img src="/logo.svg" alt="Equinox Pulse" className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">Equinox Pulse</span>
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

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-base-900 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-white">
                <User className="h-5 w-5 text-amber-500" /> Account Profile Details
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="relative group">
                <img
                  src={client?.app_icon_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${client?.company_name}`}
                  alt={client?.company_name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/70 shadow-md"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && client) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64Url = event.target?.result as string;
                          dbEngine.updateClientProfileLogo(client.id, base64Url);
                          window.location.reload();
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-black text-slate-900 dark:text-white truncate">{client?.company_name}</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 capitalize">{isAdmin ? 'Super Admin Account' : `${client?.plan} Subscription`}</p>
                <label className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-600 hover:text-amber-500 dark:text-amber-400 cursor-pointer">
                  <span>📸 Upload Profile Logo from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && client) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64Url = event.target?.result as string;
                          dbEngine.updateClientProfileLogo(client.id, base64Url);
                          window.location.reload();
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{client?.email}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Contact Person
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{client?.contact_person || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{client?.phone || 'N/A'}</span>
              </div>

              {client?.app_package_name && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Assigned App Package
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{client?.app_package_name}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:shadow-glow"
              >
                Close Profile
              </button>
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
                    ? 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
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
          <span>Equinox Pulse</span>
          <ChevronRight className="h-3 w-3" />
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
