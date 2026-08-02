import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Bell, Sparkles, ShieldAlert, UserPlus, Package, Users, CheckCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  category: 'ai' | 'crisis' | 'assignment' | 'system' | 'team';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  linkView?: string;
}

const CATEGORY_META = {
  ai:         { label: 'AI Alert',      icon: Sparkles,    color: 'text-primary bg-primary/10 border-primary/30' },
  crisis:     { label: 'Crisis',        icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  assignment: { label: 'Assignment',    icon: UserPlus,    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  system:     { label: 'System',        icon: Package,     color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  team:       { label: 'Team',          icon: Users,       color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
};

const SEED_NOTIFS: NotificationItem[] = [
  { id: '1', category: 'crisis', title: 'P1 Alert: Negative Sentiment Spike', body: '5 consecutive 1-star reviews detected on Google Play in last 30 minutes.', read: false, createdAt: new Date(Date.now() - 600000).toISOString(), linkView: 'crisis' },
  { id: '2', category: 'ai', title: 'AI Synthesis Ready', body: 'Weekly root cause synthesis complete. 3 new opportunities identified.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), linkView: 'insights' },
  { id: '3', category: 'assignment', title: 'Ticket Assigned to You', body: 'Review #8492 requiring response SLA assigned by Manager.', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', category: 'system', title: 'Reviews World Sync Active', body: 'Successfully synced 148 new reviews from Play Store API.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export function NotificationCenter({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(SEED_NOTIFS);
  const [filter, setFilter] = useState<string>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const activate = (n: NotificationItem) => {
    markRead(n.id);
    if (n.linkView && onNavigate) onNavigate(n.linkView);
    setOpen(false);
  };

  const filtered = filter === 'all' ? items : items.filter((n) => n.category === filter);
  const CATS = ['all', 'ai', 'crisis', 'assignment', 'system', 'team'];

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative h-9 w-9 sm:w-auto sm:px-3 rounded-lg border border-white/10 bg-black/40 hover:bg-white/5 text-neutral-300 flex items-center justify-center gap-2 transition"
      >
        <Bell className="w-4 h-4 text-neutral-300" />
        <span className="hidden sm:inline text-xs font-medium">Alerts</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center pulse-gold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] z-50 rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Notifications</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {unread} unread · {items.length} total
              </div>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-xs text-neutral-400 hover:text-primary transition flex items-center gap-1 disabled:opacity-40"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>

          <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition capitalize ${
                  filter === c
                    ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                    : 'border-white/10 text-neutral-400 hover:border-white/20'
                }`}
              >
                {c === 'all' ? 'All' : (CATEGORY_META as any)[c]?.label || c}
              </button>
            ))}
          </div>

          <div className="max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-white/5">
            {filtered.length === 0 ? (
              <div className="text-xs text-center text-muted-foreground py-8 italic">No notifications found.</div>
            ) : (
              filtered.map((n) => {
                const meta = CATEGORY_META[n.category] || CATEGORY_META.system;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => activate(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition ${
                      !n.read ? 'bg-primary/[0.04]' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg border shrink-0 flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <div className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{n.body}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-2">
                        <span className="uppercase tracking-widest font-semibold">{meta.label}</span>
                        <span>·</span>
                        <span>{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
