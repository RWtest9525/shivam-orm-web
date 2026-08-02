import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User as UserIcon, Building2, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    orgName: '',
    email: 'shivam@equinox.com',
    password: 'password123',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn(form.email, form.password);
      if (!res.success) {
        toast.error(res.error || 'Authentication failed');
      } else {
        toast.success(mode === 'login' ? 'Welcome back to Equinox Pulse AI!' : 'Workspace created successfully!');
        navigate('/app', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoLogin = () => {
    setForm({
      name: '',
      orgName: '',
      email: 'shivam@equinox.com',
      password: 'password123',
    });
    toast.info('Super Admin credentials pre-filled');
  };

  return (
    <div className="dark relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#09090b] text-white noise selection:bg-amber-500/30">
      {/* Ambient Dark Radial Background Spots */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-secondary/15 blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-md px-6 py-10 z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl gold-border gold-glow bg-black/80 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-[0.28em] text-neutral-400 font-semibold">Enterprise Suite</div>
              <div className="text-2xl sm:text-3xl font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Equinox Pulse AI
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto font-medium">
            AI-powered Online Reputation Management &amp; Social Listening. Built for Indian enterprises.
          </p>
        </div>

        {/* Exact Reference App Auth Dark Luxury Glass Card */}
        <div className="glass-strong gold-glow border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xl backdrop-blur-2xl bg-black/50">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === 'signup' ? 'Create workspace' : 'Sign in'}
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Multi-tenant · Role-based · SLA-driven</p>
            </div>
            <button
              type="button"
              className="text-xs text-neutral-400 hover:text-primary transition font-medium"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Organization name"
                    value={form.orgName}
                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 gold-glow transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign in to Console' : 'Initialize Workspace'}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> SOC2 Type II Certified
            </span>
            <button
              type="button"
              onClick={fillDemoLogin}
              className="text-primary hover:underline font-semibold"
            >
              Fill Demo Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
