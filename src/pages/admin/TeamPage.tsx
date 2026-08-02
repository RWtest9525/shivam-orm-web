import { useState } from 'react';
import { toast } from 'sonner';
import { Users, ShieldCheck, UserPlus, Mail, Shield, Check } from 'lucide-react';
import { ROLE_META } from '@/lib/equinox/design';

export function TeamPage() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Shivam Admin', email: 'shivam@equinox.com', role: 'super_admin', status: 'Active', joined: 'Owner' },
    { id: '2', name: 'Rahul Sharma', email: 'rahul@equinox.com', role: 'manager', status: 'Active', joined: '2 months ago' },
    { id: '3', name: 'Priya Verma', email: 'priya@equinox.com', role: 'analyst', status: 'Active', joined: '1 month ago' },
    { id: '4', name: 'Ankit Gupta', email: 'ankit@clientorg.com', role: 'viewer', status: 'Active', joined: '2 weeks ago' },
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('manager');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setMembers([
      ...members,
      {
        id: String(Date.now()),
        name: newEmail.split('@')[0],
        email: newEmail.trim(),
        role: newRole,
        status: 'Active',
        joined: 'Just now',
      },
    ]);
    setNewEmail('');
    toast.success(`Invite link sent to ${newEmail}`);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Team &amp; Access Control
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Role-based authorization, SSO configuration, and team member management.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4" /> SSO Ready (SAML 2.0)
        </span>
      </div>

      {/* Invite Form */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" /> Invite Team Member
        </h3>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="colleague@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="py-2 px-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:border-primary focus:outline-none w-full sm:w-auto"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shrink-0 transition"
          >
            Send Invitation
          </button>
        </form>
      </div>

      {/* Members List */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
        <h3 className="text-sm font-bold text-white">Active Workspace Members ({members.length})</h3>
        <div className="divide-y divide-white/5">
          {members.map((m) => {
            const roleMeta = (ROLE_META as any)[m.role] || ROLE_META.viewer;
            return (
              <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-black font-bold text-xs flex items-center justify-center shrink-0">
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{m.name}</div>
                    <div className="text-muted-foreground text-[11px]">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase ${roleMeta.color}`}>
                    {roleMeta.label}
                  </span>
                  <span className="text-muted-foreground text-[10px]">{m.joined}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
