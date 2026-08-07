import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const account = searchParams.get('account');
    const error = searchParams.get('error');

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (platform) params.set('platform', platform);
    if (account) params.set('account', account);
    if (error) params.set('error', error);

    navigate(`/app/integrations?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
        <p className="text-sm font-black text-slate-200">Completing official OAuth authorization…</p>
      </div>
    </div>
  );
}
