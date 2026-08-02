import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Loader2, Mail, Lock, User as UserIcon, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [form, setForm] = useState({
    name: '',
    email: 'shivam@equinox.com',
    password: 'password123',
    orgName: '',
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password || (mode === 'signup' && !form.orgName)) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(form.email, form.password);
      if (!res.success) {
        toast.error(res.error || 'Authentication failed');
      } else {
        toast.success(mode === 'signup' ? 'Workspace created · demo data loaded' : `Welcome back, ${form.name || 'Shivam Admin'}`);
        navigate('/app', { replace: true });
      }
    } catch (e: any) {
      toast.error(e.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const res = await signIn('shivam@equinox.com', 'password123');
      if (res.success) {
        toast.success('Signed in · Equinox Motors India');
        navigate('/app', { replace: true });
      } else {
        toast.error(res.error || 'Demo login failed');
      }
    } catch (e: any) {
      toast.error(e.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background noise text-white selection:bg-amber-500/30">
      {/* Background radial spotlights & grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/15 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md px-6 z-10">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl gold-border gold-glow bg-black/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground font-semibold">Enterprise Suite</div>
              <div className="text-2xl font-bold gold-text tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Equinox Pulse AI
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            AI-powered Online Reputation Management &amp; Social Listening. Built for Indian enterprises.
          </p>
        </div>

        {/* Auth Glass Card - Exact 1:1 match with reference repo */}
        <div className="glass-strong border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4 bg-black/40">
          <div className="pb-2 border-b border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {mode === 'signup' ? 'Create workspace' : 'Sign in'}
              </h2>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary transition font-medium"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Multi-tenant · Role-based · SLA-driven</p>
          </div>

          <div className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Organization name"
                    value={form.orgName}
                    onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none transition"
              />
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={loading || !form.email || !form.password || (mode === 'signup' && !form.orgName)}
              className="w-full h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 gold-glow transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : mode === 'signup' ? (
                'Create Workspace'
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative py-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-2 bg-[#0c0c0e] text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                or
              </span>
            </div>

            <button
              type="button"
              onClick={demoLogin}
              disabled={loading}
              className="w-full h-10 rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 hover:border-primary/40 text-xs font-semibold text-white transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <span>Try live demo · Equinox Motors India</span>
            </button>
          </div>
        </div>

        {/* SOC 2 / ISO 27001 Footer */}
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
