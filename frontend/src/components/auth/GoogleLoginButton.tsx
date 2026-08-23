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
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export const GoogleLoginButton = ({
  label = 'Sign in with Google',
}: {
  label?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const navigate = useNavigate();

  useEffect(() => {
    const clientId = (
      import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    ).replace(/^["']|["']$/g, '').trim();

    if (!clientId) {
      setError('Google login is not configured.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeGoogle = () => {
      if (!mounted) return;

      if (!window.google?.accounts?.id) {
        setError(
          'Google Identity Services is unavailable. Check your network, browser extensions, or ad blocker.'
        );
        setLoading(false);
        return;
      }

      if (!ref.current) {
        setError('Google login container is unavailable.');
        setLoading(false);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,

          callback: async (
            response: GoogleCredentialResponse
          ) => {
            try {
              setLoading(true);

              const res = await authApi.googleLogin(
                response.credential
              );

              setToken(res.access_token);

              const user = await authApi.me();

              setUser(user);

              toast.success(`Welcome, ${user.name}`);

              navigate('/dashboard');
            } catch (err: any) {
              console.error('Google login error:', err);

              toast.error(
                err?.response?.data?.detail ||
                  err?.message ||
                  'Google login failed'
              );
            } finally {
              setLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text:
            label === 'Sign in with Google'
              ? 'signin_with'
              : 'signup_with',
          width: 400,
          shape: 'rectangular',
        });

        setLoading(false);
      } catch (err) {
        console.error(
          'Google Identity Services initialization failed:',
          err
        );

        setError(
          'Unable to initialize Google sign-in. Check your Google OAuth configuration.'
        );

        setLoading(false);
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      let attempts = 0;

      const interval = setInterval(() => {
        attempts++;

        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initializeGoogle();
        }

        if (attempts >= 100) {
          clearInterval(interval);

          if (mounted) {
            setError(
              'Google sign-in script failed to load. Check your ad blocker or network and try again.'
            );

            setLoading(false);
          }
        }
      }, 100);
    }

    return () => {
      mounted = false;
    };
  }, [label, setToken, setUser, navigate]);

  if (error) {
    return (
      <div className="space-y-3 rounded-lg border border-dashed border-rose-500/40 bg-rose-500/10 p-4 text-center text-xs text-rose-700 dark:text-rose-300">
        <p>{error}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {loading && (
        <div className="flex h-10 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--text-2)]" />
        </div>
      )}
      <div
        ref={ref}
        className="flex w-full min-h-[40px] justify-center"
      />
    </div>
  );
};
