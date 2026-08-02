import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Sparkles, Loader2, Mail, Lock, User as UserIcon, Building2, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (session) {
    navigate('/app', { replace: true });
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        // Create workspace demo feedback
        toast.success('Workspace created · Enterprise demo data loaded');
        const res = await signIn('shivam@equinox.com', 'admin123');
        if (res.success) navigate('/app', { replace: true });
        else toast.error(res.error || 'Authentication failed');
      } else {
        const res = await signIn(form.email.trim(), form.password.trim());
        if (res.success) {
          toast.success(`Welcome back`);
          navigate('/app', { replace: true });
        } else {
          toast.error(res.error || 'Authentication failed. Check email and password.');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Direct super admin login for demo
      const res = await signIn('shivam@equinox.com', 'admin123');
      if (res.success) {
        toast.success('Signed in · Equinox Motors India (Super Admin)');
        navigate('/app', { replace: true });
      } else {
        toast.error(res.error || 'Demo login failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Demo sign in error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background noise selection:bg-amber-500/30">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md px-6 py-10 z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl gold-border gold-glow bg-black/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-semibold">Enterprise Suite</div>
              <div className="text-2xl sm:text-3xl font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Equinox Pulse AI
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            AI-powered Online Reputation Management &amp; Social Listening. Built for Indian enterprises.
          </p>
        </div>

        <div className="glass-strong border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === 'signup' ? 'Create workspace' : 'Sign in'}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Multi-tenant · Role-based · SLA-driven</p>
            </div>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary transition font-medium"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Organization name"
                    value={form.orgName}
                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || (!form.email && mode === 'login') || (mode === 'signup' && (!form.email || !form.password || !form.orgName))}
              className="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signup' ? (
                'Create Workspace'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-neutral-900 px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 hover:border-primary/40 text-xs font-medium text-white transition"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Try live demo · Equinox Motors India
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          <span>SOC 2</span>
          <span>·</span>
          <span>ISO 27001</span>
          <span>·</span>
          <span>DPDP Ready</span>
        </div>
      </div>
    </div>
  );
}
