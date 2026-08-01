import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 bg-slate-950 text-slate-100 selection:bg-amber-500/30">
      
      {/* Unified Premium Master Card */}
      <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-slate-900/90 p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.12)] backdrop-blur-2xl space-y-6">
        
        {/* Clean Circular Gold Logo */}
        <div className="flex flex-col items-center text-center pt-2">
          <img
            src="/logo.png"
            alt="Equinox Pulse Logo"
            className="h-28 w-28 sm:h-32 sm:w-32 object-contain filter drop-shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-transform duration-300 hover:scale-105"
          />

          <h1 className="mt-4 text-2xl font-black tracking-wider text-white sm:text-3xl">
            EQUINOX <span className="text-amber-500">PULSE</span>
          </h1>
          <p className="mt-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
            INSIGHTS. TRENDS. IMPACT.
          </p>
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
                placeholder="Enter email address"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-3 text-xs font-bold text-white placeholder:text-slate-500 focus:border-amber-400 focus:bg-white/[0.08] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-extrabold text-slate-300">Password</label>
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
    </div>
  );
}
