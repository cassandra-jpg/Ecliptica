import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type LoginType = 'signin' | 'signup' | 'member';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [titleRole, setTitleRole] = useState('');

  const [memberOtpSent, setMemberOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile) {
          navigate(`/dashboard/${profile.role}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const fullName = `${firstName} ${lastName}`.trim();

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            company: businessName,
            title: titleRole,
            phone: phoneNumber || null,
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // TODO: Send notification to sales@ecliptica-ops.com
        // Email provider integration required

        navigate('/dashboard/client');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAccessRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) throw error;

      setMemberOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send access code');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberOtpVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'email',
      });

      if (error) throw error;

      navigate('/members');
    } catch (err: any) {
      setError(err.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 relative"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="flex flex-col items-center mb-auto mt-20">
          <Link to="/" className="flex flex-col items-center">
            <img
              src="/reversed_logo_color.png"
              alt="Ecliptica"
              className="w-64 mb-6"
            />
            <p
              className="font-montserrat text-xs tracking-[0.4em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Pipeline. Intelligence. Engineered.
            </p>
          </Link>
        </div>

        <div className="mt-auto mb-20 text-center">
          <p
            className="font-montserrat text-sm mb-2"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Not yet a member?
          </p>
          <a
            href="#"
            className="font-montserrat text-sm transition-colors"
            style={{ color: 'var(--color-gold)' }}
          >
            Sign-Up
          </a>
        </div>
      </div>

      <div
        className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-12"
        style={{ backgroundColor: 'var(--color-ivory)' }}
      >
        <div className="max-w-md w-full">
          {error && (
            <div className="mb-6 p-4 border" style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <p className="font-montserrat text-xs" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-center mb-8">
            <button
              onClick={() => {
                setLoginType('signin');
                setError('');
              }}
              className={`px-6 py-3 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 ${
                loginType === 'signin' ? 'border-b-2' : ''
              }`}
              style={{
                color: loginType === 'signin' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                borderColor: loginType === 'signin' ? 'var(--color-gold)' : 'transparent',
              }}
            >
              Sign In
            </button>
            <div className="w-px h-8 mx-3" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
            <button
              onClick={() => {
                setLoginType('signup');
                setError('');
              }}
              className={`px-6 py-3 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 ${
                loginType === 'signup' ? 'border-b-2' : ''
              }`}
              style={{
                color: loginType === 'signup' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                borderColor: loginType === 'signup' ? 'var(--color-gold)' : 'transparent',
              }}
            >
              Sign Up
            </button>
            <div className="w-px h-8 mx-3" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
            <button
              onClick={() => {
                setLoginType('member');
                setError('');
                setMemberOtpSent(false);
              }}
              className={`px-6 py-3 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 ${
                loginType === 'member' ? 'border-b-2' : ''
              }`}
              style={{
                color: loginType === 'member' ? 'var(--color-navy)' : 'var(--color-text-muted)',
                borderColor: loginType === 'member' ? 'var(--color-gold)' : 'transparent',
              }}
            >
              Members
            </button>
          </div>

          {loginType === 'signin' ? (
            <>
              <h2
                className="font-cormorant text-4xl md:text-5xl mb-3"
                style={{ color: 'var(--color-text-dark)' }}
              >
                Welcome Back
              </h2>

              <p
                className="font-baskerville text-base mb-10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Sign in to your Ecliptica account.
              </p>

              <form onSubmit={handleSignIn} className="space-y-8">
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 mr-3"
                    style={{ accentColor: 'var(--color-gold)' }}
                  />
                  <label
                    htmlFor="remember"
                    className="font-montserrat text-xs"
                    style={{ color: 'var(--color-text-dark)' }}
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300"
                  style={{
                    backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-navy)',
                    color: 'var(--color-white)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)';
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center">
                  <a
                    href="#"
                    className="font-montserrat text-xs transition-colors"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    Forgot your password?
                  </a>
                </div>

                <div
                  className="h-px w-full my-8"
                  style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }}
                />

                <p
                  className="font-montserrat text-xs tracking-wider text-center"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Member access includes Growth Diagnostic, Acquisition Simulator, Newsletter, and Member Tools.
                </p>
              </form>
            </>
          ) : loginType === 'signup' ? (
            <>
              <h2
                className="font-cormorant text-4xl md:text-5xl mb-3"
                style={{ color: 'var(--color-text-dark)' }}
              >
                Member Sign-Up
              </h2>

              <p
                className="font-baskerville text-base mb-10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Access begins with an application. Our team will confirm your tier and activate your account within 24 hours.
              </p>

              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <input
                    type="password"
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: '#D1D5DB',
                        color: 'var(--color-text-dark)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: '#D1D5DB',
                        color: 'var(--color-text-dark)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Business Name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Title/Role"
                    value={titleRole}
                    onChange={(e) => setTitleRole(e.target.value)}
                    className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                    style={{
                      borderColor: '#D1D5DB',
                      color: 'var(--color-text-dark)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300 mt-8"
                  style={{
                    backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-navy)',
                    color: 'var(--color-white)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)';
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>

                <div
                  className="h-px w-full my-8"
                  style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }}
                />

                <p
                  className="font-montserrat text-xs tracking-wider text-center"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Our team will review your application and reach out to you shortly.
                </p>
              </form>
            </>
          ) : (
            <>
              <h2
                className="font-cormorant text-4xl md:text-5xl mb-3"
                style={{ color: 'var(--color-text-dark)' }}
              >
                Members Access
              </h2>

              <p
                className="font-baskerville text-base mb-10"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {memberOtpSent ? 'Enter the code sent to your email.' : 'Passwordless access for members.'}
              </p>

              {!memberOtpSent ? (
                <form onSubmit={handleMemberAccessRequest} className="space-y-8">
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: '#D1D5DB',
                        color: 'var(--color-text-dark)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300"
                    style={{
                      backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-navy)',
                      color: 'var(--color-white)',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)';
                    }}
                  >
                    {loading ? 'Sending Code...' : 'Send Access Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMemberOtpVerify} className="space-y-8">
                  <div>
                    <input
                      type="text"
                      placeholder="Access Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none"
                      style={{
                        borderColor: '#D1D5DB',
                        color: 'var(--color-text-dark)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#D1D5DB';
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300"
                    style={{
                      backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-navy)',
                      color: 'var(--color-white)',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)';
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)';
                    }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Access'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberOtpSent(false)}
                    className="w-full font-montserrat text-xs tracking-wider"
                    style={{ color: 'var(--color-gold)' }}
                  >
                    Resend Code
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
