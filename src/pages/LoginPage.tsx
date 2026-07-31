import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, switchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-slate-50 dark:bg-base-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          <span>{theme === 'dark' ? 'White Theme' : 'Black Theme'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-electric-600 shadow-glow">
            <span className="text-2xl font-black text-slate-950">S</span>
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 animate-pulse-glow" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            SHIVAM <span className="text-accent-500 dark:text-accent-400">ORM</span> Enterprise
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
            Multi-Crore Online Reputation & Play Store Intelligence Suite
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-base-900">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-500 dark:text-accent-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sign in to ORM Suite</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3 text-xs font-black text-slate-950 transition hover:shadow-glow"
            >
              Sign In to Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-white/10">
            <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">1-Click Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo('client@dreamapps.com')}
                className="rounded-xl border border-accent-300 bg-accent-50 p-2 text-center text-xs font-bold text-accent-800 transition hover:bg-accent-100 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300"
              >
                <span className="block font-bold">Client</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">DreamApps</span>
              </button>
              <button
                onClick={() => fillDemo('admin@shivamorm.com')}
                className="rounded-xl border border-emerald-300 bg-emerald-50 p-2 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              >
                <span className="block font-bold">Super Admin</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Executive</span>
              </button>
              <button
                onClick={() => fillDemo('rohan.mod@shivamorm.com')}
                className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-center text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              >
                <span className="block font-bold">Worker</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400">Moderator</span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Shivam ORM Suite · Built for High Scalability & Zero Database Errors
        </p>
      </div>
    </div>
  );
}
