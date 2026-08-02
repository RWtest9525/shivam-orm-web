import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, UserCheck, Flame, ExternalLink } from 'lucide-react';

export function CrisisCenterPage() {
  const [activeTab, setActiveTab] = useState<'p1' | 'all' | 'resolved'>('p1');

  const incidents = [
    {
      id: 'CR-904',
      title: 'Sudden 1-Star Review Surge on Play Store v4.2',
      severity: 'P1 Critical',
      affected: 'Google Play Store App',
      time: '18 minutes ago',
      slaCountdown: '02h 42m remaining',
      assignee: 'Shivam Admin',
      status: 'Investigating',
      summary: '6 consecutive negative reviews alleging payment deduction without order placement.',
    },
    {
      id: 'CR-889',
      title: 'Twitter Mention Spike regarding Shipping SLA',
      severity: 'P2 High',
      affected: 'X (Twitter)',
      time: '2 hours ago',
      slaCountdown: '01h 15m remaining',
      assignee: 'Rahul Analyst',
      status: 'Assigned',
      summary: 'Trending hashtag #EquinoxDeliveryDelay with 42 total mentions in Delhi NCR.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-black to-neutral-950 border border-rose-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Crisis Management Center
              </h2>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Real-time incident detection, SLA escalation matrix, and rapid escalation protocol.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-1.5 pulse-gold">
              <Flame className="w-3.5 h-3.5" /> 1 P1 Active Crisis
            </span>
          </div>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('p1')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'p1' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-neutral-400 hover:text-white'
            }`}
          >
            P1 Active Crises (1)
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Active Incidents (2)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="p-5 rounded-2xl bg-black/40 border border-rose-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    {inc.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    {inc.severity}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{inc.affected}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-rose-300 font-mono">
                  <Clock className="w-3.5 h-3.5" /> SLA: {inc.slaCountdown}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{inc.title}</h3>
                <p className="text-xs text-neutral-300 mt-1">{inc.summary}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                <div className="flex items-center gap-4 text-neutral-400">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-primary" /> Assignee: <strong className="text-white">{inc.assignee}</strong>
                  </span>
                  <span>Reported: {inc.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast.success(`Incident ${inc.id} marked as contained`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                  <button
                    onClick={() => toast.info(`Viewing trace for ${inc.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold text-xs transition flex items-center gap-1"
                  >
                    View Trace <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
