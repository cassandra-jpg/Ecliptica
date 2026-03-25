import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type LoginType = 'signin' | 'signup' | 'member';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<LoginType>('signup');
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

  const inputClass = "w-full border-0 border-b bg-transparent py-4 font-montserrat text-sm transition-colors focus:outline-none";
  const inputStyle = { borderColor: '#D1D5DB', color: 'var(--color-text-dark)' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--color-gold)'; };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#D1D5DB'; };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
        if (profile) navigate(`/dashboard/${profile.role}`);
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
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (authData.user) {
        const fullName = `${firstName} ${lastName}`.trim();
        const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName, company: businessName, title: titleRole, phone: phoneNumber || null }).eq('id', authData.user.id);
        if (profileError) throw profileError;
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
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
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
      const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' });
      if (error) throw error;
      navigate('/members');
    } catch (err: any) {
      setError(err.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  const submitBtnStyle = (isLoading: boolean) => ({
    backgroundColor: isLoading ? 'var(--color-text-muted)' : 'var(--color-navy)',
    color: 'var(--color-white)',
  });

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center p-12 relative" style={{ backgroundColor: 'var(--color-navy)' }}>
        <div className="flex flex-col items-center mb-auto mt-20">
          <Link to="/" className="flex flex-col items-center">
            <img src="/reversed_logo_color.png" alt="Ecliptica" className="w-64 mb-6" />
            <p className="font-montserrat text-xs tracking-[0.4em] uppercase" style={{ color: 'var(--color-gold)' }}>Engineered to Hunt. Built to Scale.</p>
          </Link>
        </div>
        <div className="mt-auto mb-20 text-center">
          <p className="font-montserrat text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}></p>
          <a href="#" className="font-montserrat text-sm transition-colors" style={{ color: 'var(--color-gold)' }}></a>
        </div>
      </div>

      <div className="w-full lg:w-3/5 flex items-center justify-center p-6 md:p-12" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="max-w-md w-full">
          {error && (
            <div className="mb-6 p-4 border" style={{ borderColor: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
              <p className="font-montserrat text-xs" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-center mb-8">
            {(['signup', 'member', 'signin'] as LoginType[]).map((type, i) => (
              <>
                {i > 0 && <div key={`div-${i}`} className="w-px h-8 mx-3" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />}
                <button
                  key={type}
                  onClick={() => { setLoginType(type); setError(''); if (type === 'member') setMemberOtpSent(false); }}
                  className={`px-6 py-3 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 ${loginType === type ? 'border-b-2' : ''}`}
                  style={{ color: loginType === type ? 'var(--color-navy)' : 'var(--color-text-muted)', borderColor: loginType === type ? 'var(--color-gold)' : 'transparent' }}
                >
                  {type === 'signup' ? 'Sign Up' : type === 'member' ? 'Members' : 'Sign In'}
                </button>
              </>
            ))}
          </div>

          {loginType === 'signup' && (
            <>
              <h2 className="font-cormorant text-4xl md:text-5xl mb-3" style={{ color: 'var(--color-text-dark)' }}>Member Sign-Up</h2>
              <p className="font-baskerville text-base mb-10" style={{ color: 'var(--color-text-muted)' }}></p>
              <form onSubmit={handleSignUp} className="space-y-6">
                <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                </div>
                <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <input type="tel" placeholder="Phone Number (Optional)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                <input type="text" placeholder="Title/Role" value={titleRole} onChange={(e) => setTitleRole(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <button type="submit" disabled={loading} className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300 mt-8" style={submitBtnStyle(loading)} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }} onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}>{loading ? 'Submitting...' : 'Submit'}</button>
                <div className="h-px w-full my-8" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
                <p className="font-montserrat text-xs tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Member access includes Growth Diagnostic, Acquisition Simulator, Newsletter, and Member Tools.</p>
              </form>
            </>
          )}

          {loginType === 'member' && (
            <>
              <h2 className="font-cormorant text-4xl md:text-5xl mb-3" style={{ color: 'var(--color-text-dark)' }}>Members Access</h2>
              <p className="font-baskerville text-base mb-10" style={{ color: 'var(--color-text-muted)' }}>{memberOtpSent ? 'Enter the code sent to your email.' : 'Passwordless access for members.'}</p>
              {!memberOtpSent ? (
                <form onSubmit={handleMemberAccessRequest} className="space-y-8">
                  <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                  <button type="submit" disabled={loading} className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300" style={submitBtnStyle(loading)} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }} onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}>{loading ? 'Sending Code...' : 'Send Access Code'}</button>
                  <div className="h-px w-full my-8" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
                  <p className="font-montserrat text-xs tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Member access includes Growth Diagnostic, Acquisition Simulator, Newsletter, and Member Tools.</p>
                </form>
              ) : (
                <form onSubmit={handleMemberOtpVerify} className="space-y-8">
                  <input type="text" placeholder="Access Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                  <button type="submit" disabled={loading} className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300" style={submitBtnStyle(loading)} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }} onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}>{loading ? 'Verifying...' : 'Verify & Access'}</button>
                  <button type="button" onClick={() => setMemberOtpSent(false)} className="w-full font-montserrat text-xs tracking-wider" style={{ color: 'var(--color-gold)' }}>Resend Code</button>
                  <div className="h-px w-full my-8" style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }} />
                  <p className="font-montserrat text-xs tracking-wider text-center" style={{ color: 'var(--color-text-muted)' }}>Member access includes Growth Diagnostic, Acquisition Simulator, Newsletter, and Member Tools.</p>
                </form>
              )}
            </>
          )}

          {loginType === 'signin' && (
            <>
              <h2 className="font-cormorant text-4xl md:text-5xl mb-3" style={{ color: 'var(--color-text-dark)' }}>Welcome Back</h2>
              <p className="font-baskerville text-base mb-10" style={{ color: 'var(--color-text-muted)' }}>Sign in to your Client Portal.</p>
              <form onSubmit={handleSignIn} className="space-y-8">
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} style={inputStyle} onFocus={onFocus} onBlur={onBlur} required />
                <div className="flex items-center">
                  <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 mr-3" style={{ accentColor: 'var(--color-gold)' }} />
                  <label htmlFor="remember" className="font-montserrat text-xs" style={{ color: 'var(--color-text-dark)' }}>Remember me</label>
                </div>
                <button type="submit" disabled={loading} className="w-full font-montserrat text-xs tracking-[0.25em] uppercase py-5 transition-all duration-300" style={submitBtnStyle(loading)} onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-gold)'; }} onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-navy)'; }}>{loading ? 'Signing In...' : 'Sign In'}</button>
                <div className="text-center">
                  <a href="#" className="font-montserrat text-xs transition-colors" style={{ color: 'var(--color-gold)' }}>Forgot your password?</a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
