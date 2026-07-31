import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, switchUser } = useAuth();
  const [email, setEmail] = useState('client@dreamapps.com');
  const [password, setPassword] = useState('password123');
  const [showPw, setShowPw] = useState(false);

  if (session) {
    navigate('/app', { replace: true });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    switchUser(email);
    navigate('/app', { replace: true });
  }

  function fillDemo(emailToUse: string) {
    switchUser(emailToUse);
    navigate('/app', { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-electric-600 shadow-glow">
            <span className="text-2xl font-black text-base-950">S</span>
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-base-950 bg-emerald-400 animate-pulse-glow" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white light:text-slate-900">
            SHIVAM <span className="text-accent-400">ORM</span> Enterprise
          </h1>
          <p className="mt-1 text-xs text-slate-400 light:text-slate-600">
            Multi-Crore Online Reputation & Play Store Intelligence Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-6 shadow-card border">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-400" />
            <h2 className="text-base font-bold text-slate-100 light:text-slate-900">Sign in to ORM Suite</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300 light:text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300 light:text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-10 text-xs text-slate-100 placeholder:text-slate-500 focus:border-accent-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-bold text-base-950 transition hover:shadow-glow"
            >
              Sign In to Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 border-t border-white/[0.08] pt-4 light:border-slate-200">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">1-Click Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo('client@dreamapps.com')}
                className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-2 text-center text-xs transition hover:bg-accent-500/20 light:bg-accent-50"
              >
                <span className="block font-bold text-accent-300 light:text-accent-700">Client</span>
                <span className="text-[9px] text-slate-400">DreamApps</span>
              </button>
              <button
                onClick={() => fillDemo('admin@shivamorm.com')}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center text-xs transition hover:bg-emerald-500/20 light:bg-emerald-50"
              >
                <span className="block font-bold text-emerald-300 light:text-emerald-700">Super Admin</span>
                <span className="text-[9px] text-slate-400">Executive</span>
              </button>
              <button
                onClick={() => fillDemo('rohan.mod@shivamorm.com')}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-center text-xs transition hover:bg-amber-500/20 light:bg-amber-50"
              >
                <span className="block font-bold text-amber-300 light:text-amber-700">Worker</span>
                <span className="text-[9px] text-slate-400">Moderator</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Shivam ORM Suite · Built for High Scalability & Zero Database Errors
        </p>
      </div>
    </div>
  );
}
