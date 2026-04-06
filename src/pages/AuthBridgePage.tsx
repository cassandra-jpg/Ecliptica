import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ALLOWED_REDIRECT_DOMAINS = [
  'ecliptica-ops.com',
  'acquisitionsimulator.ecliptica-ops.com',
  'growthdiagnostic.ecliptica-ops.com',
];

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = ALLOWED_REDIRECT_DOMAINS.some(domain => {
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });

    return isAllowed;
  } catch {
    return false;
  }
}

function buildCallbackUrl(redirectUrl: string, token: string): string {
  const parsed = new URL(redirectUrl);
  const callbackUrl = new URL('/__auth_callback', `${parsed.protocol}//${parsed.host}`);
  callbackUrl.searchParams.set('token', token);

  if (parsed.pathname && parsed.pathname !== '/') {
    callbackUrl.searchParams.set('return_path', parsed.pathname + parsed.search);
  }

  return callbackUrl.toString();
}

export default function AuthBridgePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'issuing_token' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  const rawRedirect = searchParams.get('redirect');

  useEffect(() => {
    if (rawRedirect) {
      if (isValidRedirectUrl(rawRedirect)) {
        setRedirectUrl(rawRedirect);
      } else {
        setError('Invalid redirect destination. Only ecliptica-ops.com subdomains are allowed.');
        setStatus('error');
      }
    }
  }, [rawRedirect]);

  useEffect(() => {
    if (authLoading) {
      setStatus('loading');
      return;
    }

    if (hasProcessed.current) {
      return;
    }

    if (!user || !session) {
      if (redirectUrl) {
        const loginUrl = `/login?tab=member&returnTo=${encodeURIComponent(`/auth/bridge?redirect=${encodeURIComponent(redirectUrl)}`)}}`;
        navigate(loginUrl, { replace: true });
      } else if (rawRedirect && status !== 'error') {
        setStatus('loading');
      } else if (status !== 'error') {
        setError('No redirect URL provided');
        setStatus('error');
      }
      return;
    }

    if (!redirectUrl) {
      if (status !== 'error') {
        setError('No valid redirect URL provided');
        setStatus('error');
      }
      return;
    }

    hasProcessed.current = true;
    issueTokenAndRedirect();
  }, [authLoading, user, session, redirectUrl, navigate, rawRedirect, status]);

  const issueTokenAndRedirect = async () => {
    if (!session || !redirectUrl) return;

    setStatus('issuing_token');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/issue-tool-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.error === 'not_member') {
          setError('You must be a registered member to access this tool. Please sign up first.');
        } else {
          setError(data.message || 'Failed to issue access token');
        }
        setStatus('error');
        return;
      }

      setStatus('redirecting');

      const callbackUrl = buildCallbackUrl(redirectUrl, data.token);

      await new Promise(resolve => setTimeout(resolve, 500));

      window.location.href = callbackUrl;
    } catch (err) {
      console.error('Error issuing token:', err);
      setError('An error occurred while preparing your access. Please try again.');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    hasProcessed.current = false;
    setError(null);
    setStatus('loading');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (redirectUrl) {
      const loginUrl = `/login?tab=member&returnTo=${encodeURIComponent(`/auth/bridge?redirect=${encodeURIComponent(redirectUrl)}`)}}`;
      navigate(loginUrl, { replace: true });
    } else {
      navigate('/login?tab=member', { replace: true });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--color-ivory)' }}
    >
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-block mb-12">
          <img
            src="/PRIMARY_LOGO.png"
            alt="Ecliptica"
            className="h-12 mx-auto"
          />
        </Link>

        {status === 'loading' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
            />
            <p
              className="font-montserrat text-sm tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Checking authentication...
            </p>
          </div>
        )}

        {status === 'authenticating' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
            />
            <p
              className="font-montserrat text-sm tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Redirecting to sign in...
            </p>
          </div>
        )}

        {status === 'issuing_token' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
            />
            <p
              className="font-montserrat text-sm tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Preparing secure access...
            </p>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 border-2 rounded-full animate-spin mx-auto"
              style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
            />
            <p
              className="font-montserrat text-sm tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Redirecting to tool...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-8">
            <div
              className="p-6 border"
              style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.05)' }}
            >
              <h2
                className="font-cormorant text-2xl mb-4"
                style={{ color: 'var(--color-navy)' }}
              >
                Access Error
              </h2>
              <p
                className="font-montserrat text-sm leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {error}
              </p>
            </div>

            <div className="space-y-4">
              {error?.includes('member') && (
                <Link
                  to="/login?tab=signup"
                  className="block w-full font-montserrat text-xs tracking-[0.25em] uppercase py-4 transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-white)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}
                >
                  Sign Up for Membership
                </Link>
              )}

              {user && !error?.includes('Invalid redirect') && (
                <button
                  onClick={handleRetry}
                  className="block w-full font-montserrat text-xs tracking-[0.25em] uppercase py-4 transition-all duration-300"
                  style={{ backgroundColor: 'var(--color-navy)', color: 'var(--color-white)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}
                >
                  Try Again
                </button>
              )}

              {user && (
                <button
                  onClick={handleSignOut}
                  className="block w-full font-montserrat text-xs tracking-wider py-3 transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Sign in with a different account
                </button>
              )}

              <Link
                to="/"
                className="block font-montserrat text-xs tracking-wider py-3 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
