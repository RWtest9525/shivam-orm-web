import { useState } from 'react';
import { toast } from 'sonner';
import { Users, UserPlus, ShieldCheck, Mail, Shield, Trash2, Key } from 'lucide-react';

export function TeamPage() {
  const [members, setMembers] = useState([
    { id: '1', name: 'Shivam Admin', email: 'shivam@equinox.com', role: 'Super Admin', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Shivam+Admin&background=0D8ABC&color=fff' },
    { id: '2', name: 'Rahul Verma', email: 'rahul@equinox.com', role: 'Analyst', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=2563EB&color=fff' },
    { id: '3', name: 'Priya Sharma', email: 'priya@equinox.com', role: 'Support Specialist', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=D4AF37&color=fff' },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    const newMember = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Active',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inviteName)}&background=0D8ABC&color=fff`,
    };
    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    toast.success(`Invite sent to ${inviteEmail}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Team &amp; Access Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">
              Manage agency team members, role-based access permissions, and audit logs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4 text-black" /> Invite Team Member
        </button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-white border border-slate-200 dark:bg-black/40 dark:border-white/5 space-y-4 hover:border-primary/30 transition shadow-sm">
            <div className="flex items-center gap-3">
              <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-xl object-cover border border-primary/30 shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground truncate">{m.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/25">
                  {m.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Invite New Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ankit Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 dark:bg-black/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="ankit@equinox.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 dark:bg-black/60 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-neutral-300 mb-1 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 dark:bg-neutral-900 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Analyst">Analyst</option>
                  <option value="Support Specialist">Support Specialist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5 text-xs text-slate-700 dark:text-neutral-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
