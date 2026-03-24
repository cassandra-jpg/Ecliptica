import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminSignup = async (e: FormEvent) => {
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
            role: 'admin',
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        navigate('/dashboard/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create admin account');
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
            Admin Account Creation
          </p>
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

          <h2
            className="font-cormorant text-4xl md:text-5xl mb-3"
            style={{ color: 'var(--color-text-dark)' }}
          >
            Admin Sign-Up
          </h2>

          <p
            className="font-baskerville text-base mb-10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Create your administrator account with full system access.
          </p>

          <form onSubmit={handleAdminSignup} className="space-y-6">
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
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>

            <div
              className="h-px w-full my-8"
              style={{ backgroundColor: 'rgba(27, 35, 64, 0.2)' }}
            />

            <div className="text-center">
              <Link
                to="/login"
                className="font-montserrat text-xs transition-colors"
                style={{ color: 'var(--color-gold)' }}
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
