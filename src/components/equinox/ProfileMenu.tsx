import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  User as UserIcon, Building2, Users, Settings2, CreditCard, LogOut, ChevronRight, ShieldCheck, Cable
} from 'lucide-react';

interface ProfileMenuProps {
  sessionUser?: { name: string; email: string; role: string };
  orgName?: string;
  onLogout: () => void;
  onNavigate?: (view: string) => void;
}

const ITEMS = [
  { key: 'profile', label: 'Profile', icon: UserIcon, hint: 'Personal info · avatar · password' },
  { key: 'organization', label: 'Organization Settings', icon: Building2, hint: 'Brand kit · timezone · default tone' },
  { key: 'team', label: 'Team Management', icon: Users, hint: 'Invites · roles · audit trail', view: 'team' },
  { key: 'integrations', label: 'Integrations', icon: Cable, hint: 'Play Store · Google Business · Instagram', view: 'integrations' },
  { key: 'preferences', label: 'Preferences', icon: Settings2, hint: 'Notifications · default AI tone · language' },
  { key: 'billing', label: 'Billing', icon: CreditCard, hint: 'Plan · seats · usage' },
];

export function ProfileMenu({ sessionUser, orgName = 'Equinox Motors India', onLogout, onNavigate }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const user = sessionUser || { name: 'Shivam Admin', email: 'shivam@equinox.com', role: 'super_admin' };
  const initial = user.name?.[0]?.toUpperCase() || 'S';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 hover:opacity-80 transition"
      >
        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 bg-gradient-to-br from-primary to-secondary text-black text-xs font-extrabold flex items-center justify-center shadow-md">
          {initial}
        </div>
        <div className="hidden sm:block text-xs text-left leading-tight">
          <div className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
          <div className="text-slate-500 dark:text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
            {user.role === 'super_admin' ? 'Super Admin' : user.role}
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[300px] z-50 rounded-2xl bg-white border border-slate-200 dark:bg-neutral-950 dark:border-white/10 shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-primary/40 bg-gradient-to-br from-primary to-secondary text-black font-extrabold text-sm flex items-center justify-center shrink-0">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-muted-foreground truncate">{user.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary/30 text-primary bg-primary/10 font-bold uppercase">
                    {user.role === 'super_admin' ? 'Super Admin' : user.role}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> SSO Active
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 p-2 rounded-xl bg-slate-100 border border-slate-200 dark:bg-black/40 dark:border-white/5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                {orgName[0]}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{orgName}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-muted-foreground font-semibold">Enterprise Plan</div>
              </div>
            </div>
          </div>

          <div className="py-1">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (item.view && onNavigate) onNavigate(item.view);
                    else toast.info(`${item.label} opened`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition group"
                >
                  <Icon className="w-4 h-4 text-slate-400 dark:text-muted-foreground group-hover:text-primary shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-muted-foreground truncate">{item.hint}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-muted-foreground group-hover:text-primary shrink-0" />
                </button>
              );
            })}
          </div>

          <div className="p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-neutral-300 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 font-semibold transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
