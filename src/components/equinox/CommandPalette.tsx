import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Search, X, LayoutDashboard, MessageSquare, Radar, ShieldAlert, Trophy, FileBarChart2, Users, Wand2, Cable, Mic, Sparkles
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setView: (view: string) => void;
}

const COMMAND_NAV = [
  { key: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, group: 'Analytics' },
  { key: 'reviews', label: 'Reviews & Feedback', icon: MessageSquare, group: 'Analytics' },
  { key: 'insights', label: 'AI Insights', icon: Wand2, group: 'Analytics' },
  { key: 'social', label: 'Social Listening', icon: Radar, group: 'Monitoring' },
  { key: 'crisis', label: 'Crisis Center', icon: ShieldAlert, group: 'Monitoring' },
  { key: 'competitors', label: 'Competitors', icon: Trophy, group: 'Monitoring' },
  { key: 'voice_of_market', label: 'Voice of Market', icon: Mic, group: 'Monitoring' },
  { key: 'integrations', label: 'Integrations', icon: Cable, group: 'Executive' },
  { key: 'reports', label: 'Reports', icon: FileBarChart2, group: 'Executive' },
  { key: 'team', label: 'Team & Access', icon: Users, group: 'Executive' },
];

export function CommandPalette({ open, setOpen, setView }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  if (!open) return null;

  const filtered = COMMAND_NAV.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) || item.group.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-white/10 bg-black/40">
          <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search view..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-neutral-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 no-scrollbar space-y-3">
          <div>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Navigation Views
            </div>
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground italic">No matching results found.</div>
            ) : (
              filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setView(item.key);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-primary/10 hover:text-primary transition font-medium text-left"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      {item.group}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-white/5 pt-2">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Quick Actions
            </div>
            <button
              onClick={() => {
                setView('insights');
                setOpen(false);
                toast.success('Batch AI Analysis triggered');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-primary/10 hover:text-primary transition font-medium text-left"
            >
              <Wand2 className="w-4 h-4 text-primary shrink-0" />
              <span>Run Batch AI Analysis</span>
            </button>

            <button
              onClick={() => {
                setView('insights');
                setOpen(false);
                toast.success('Regenerating AI Insights...');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-primary/10 hover:text-primary transition font-medium text-left"
            >
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>Regenerate AI Insights</span>
            </button>

            <button
              onClick={() => {
                setView('reports');
                setOpen(false);
                toast.success('Generating Executive Report PDF');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-primary/10 hover:text-primary transition font-medium text-left"
            >
              <FileBarChart2 className="w-4 h-4 text-primary shrink-0" />
              <span>Generate Executive Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
