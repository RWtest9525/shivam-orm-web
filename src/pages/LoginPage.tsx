import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, Sun, Moon, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, signIn, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPw, setForgotNewPw] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');

  if (session) {
    navigate('/app', { replace: true });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await signIn(email.trim(), password.trim());
      if (res.success) {
        navigate('/app', { replace: true });
      } else {
        setErrorMsg(res.error || 'Authentication failed. Please check your email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    setForgotMsg('');
    setForgotLoading(true);

    try {
      const res = await resetPassword(forgotEmail.trim(), forgotNewPw.trim());
      if (res.success) {
        setForgotMsg('Password reset successful! You can now log in using your new password or your original password.');
        setEmail(forgotEmail);
        setPassword(forgotNewPw);
        setTimeout(() => setShowForgotModal(false), 2000);
      } else {
        setForgotMsg(`Error: ${res.error}`);
      }
    } catch (err: any) {
      setForgotMsg(`Error: ${err.message}`);
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-slate-50 dark:bg-base-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top right theme switcher */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            SHIVAM <span className="text-accent-600 dark:text-accent-400">ORM</span> Enterprise
          </h1>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-bold">
            Multi-Crore Online Reputation & Play Store Intelligence Suite
          </p>
        </div>

        {/* Premium Login Card */}
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-base-900">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Sign in to ORM Portal</h2>
            </div>
            <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-accent-700 dark:bg-accent-500/20 dark:text-accent-300">
              Client & Admin
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@dreamapps.com or admin@shivamorm.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Password</label>
                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setShowForgotModal(true); }}
                  className="text-xs font-extrabold text-accent-600 hover:underline dark:text-accent-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-10 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-accent-500 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 py-3.5 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
            >
              {loading ? 'Authenticating…' : 'Sign In to Dashboard'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-[11px] text-slate-600 dark:text-slate-400 font-bold">
          Shivam ORM Suite · Protected by Enterprise Dual Password Authentication
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:bg-base-900 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-white/10">
              <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
                <KeyRound className="h-4 w-4 text-accent-600 dark:text-accent-400" /> Reset Password
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleForgotReset} className="mt-4 space-y-4">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Enter your registered client email and your new password. Note: Both your original admin-assigned password and your new password will remain valid for login!
              </p>

              {forgotMsg && (
                <div className={cn(
                  'p-3 text-xs font-bold rounded-xl border',
                  forgotMsg.startsWith('Error')
                    ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                )}>
                  {forgotMsg}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">Registered Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="client@dreamapps.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800 dark:text-slate-200">New Password</label>
                <input
                  type="password"
                  required
                  value={forgotNewPw}
                  onChange={(e) => setForgotNewPw(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-accent-500 focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim() || !forgotNewPw.trim()}
                  className="rounded-xl bg-gradient-to-r from-accent-500 to-electric-600 px-4 py-2 text-xs font-black text-slate-950 transition hover:shadow-glow disabled:opacity-50"
                >
                  {forgotLoading ? 'Resetting…' : 'Update & Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
