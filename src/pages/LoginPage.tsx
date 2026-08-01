import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowRight, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, signIn, resetPassword } = useAuth();

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
        setForgotMsg('Password reset successful! You can now log in using your new password.');
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      
      {/* Unified Premium Master Card (Contains Logo, Brand Title, & Login Form inside ONE Border) */}
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.12)] backdrop-blur-2xl space-y-6">
        
        {/* Large Unclipped Circular Gold Logo Badge */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-2 border-amber-500/50 bg-black p-2 shadow-[0_0_40px_rgba(245,158,11,0.25)] transition-transform duration-300 hover:scale-105">
            <img
              src="/logo.svg"
              alt="Equinox Pulse Logo"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-wider text-white sm:text-3xl">
            EQUINOX <span className="text-amber-500">PULSE</span>
          </h1>
          <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            INSIGHTS. TRENDS. IMPACT.
          </p>
        </div>

        {/* Form Divider & Header */}
        <div className="flex items-center justify-between border-t border-b border-white/10 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-black tracking-wide text-white">Enterprise Sign In</h2>
          </div>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
            Super Admin & Clients
          </span>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shivam@equinoxmarketingagency.in"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-3 text-xs font-bold text-white placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/[0.08] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => { setForgotEmail(email); setShowForgotModal(true); }}
                className="text-xs font-extrabold text-amber-400 hover:text-amber-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-10 text-xs font-bold text-white placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/[0.08] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 py-3.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-amber-500/30 disabled:opacity-50"
          >
            {loading ? 'Authenticating…' : 'Sign In to Equinox Pulse'} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="text-center text-[11px] font-bold text-slate-500 pt-2">
          Equinox Pulse Enterprise Platform
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="flex items-center gap-2 text-base font-black text-white">
                <KeyRound className="h-4 w-4 text-amber-400" /> Reset Password
              </h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleForgotReset} className="space-y-4">
              <p className="text-xs font-bold text-slate-300">
                Enter your registered client email and your new password.
              </p>

              {forgotMsg && (
                <div className={cn(
                  'p-3 text-xs font-bold rounded-xl border',
                  forgotMsg.startsWith('Error')
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                )}>
                  {forgotMsg}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-300">Registered Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  value={forgotNewPw}
                  onChange={(e) => setForgotNewPw(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim() || !forgotNewPw.trim()}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:shadow-lg disabled:opacity-50"
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
