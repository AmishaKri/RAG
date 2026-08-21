import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });
};

export const GoogleLoginButton = ({ label = 'Sign in with Google' }: { label?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      return;
    }

    let mounted = true;
    setLoading(true);

    loadGoogleScript()
      .then(() => {
        if (!mounted) return;
        if (!ref.current || !window.google) {
          setError('Google sign-in script failed to load. Check your ad blocker or network and try again.');
          return;
        }
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              const res = await authApi.googleLogin(response.credential);
              setToken(res.access_token);
              const user = await authApi.me();
              setUser(user);
              toast.success(`Welcome, ${user.name}`);
              navigate('/dashboard');
            } catch (err: any) {
              toast.error(err.message || 'Google login failed');
            }
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: label === 'Sign in with Google' ? 'signin_with' : 'signup_with',
          width: '100%',
        });
      })
      .catch(() => {
        setError('Google sign-in is unavailable. Disable ad blockers or privacy extensions and try again.');
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, [label, setToken, setUser, navigate]);

  if (loading) {
    return (
      <div className="flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--text-2)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-rose-500/40 bg-rose-500/10 p-3 text-center text-xs text-rose-700 dark:text-rose-300">
        {error}
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return (
      <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/10 p-3 text-center text-xs text-amber-700 dark:text-amber-300">
        Google login is not configured. Add <code className="font-mono font-semibold">VITE_GOOGLE_CLIENT_ID</code> to <code className="font-mono font-semibold">.env</code>.
      </div>
    );
  }

  return <div ref={ref} className="w-full" />;
};
