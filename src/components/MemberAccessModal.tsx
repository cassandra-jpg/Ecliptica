import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MemberAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MemberAccessModal({ isOpen, onClose }: MemberAccessModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendAccessCode = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: isMember, error: rpcError } = await supabase
        .rpc('is_registered_member', { member_email: email });

      if (rpcError) throw rpcError;

      if (!isMember) {
        throw new Error('This email is not registered. Please sign up first.');
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/member-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ action: 'send', email }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send access code');

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send access code');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    onClose();
    navigate('/login');
  };

  const handleGoToVerify = () => {
    onClose();
    navigate('/login?tab=member&email=' + encodeURIComponent(email));
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className="relative w-full max-w-lg p-10 md:p-12 shadow-xl"
        style={{ backgroundColor: 'var(--color-ivory)' }}
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-navy)' }}
        >
          <X size={20} />
        </button>

        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
          style={{ color: 'var(--color-gold)' }}
        >
          Member Access
        </p>

        <p
          className="font-baskerville text-base leading-relaxed mb-6"
          style={{ color: 'var(--color-navy)' }}
        >
          Membership provides access to complimentary tools and resources designed for our community.
        </p>

        <p
          className="font-baskerville text-base leading-relaxed mb-6"
          style={{ color: 'var(--color-navy)' }}
        >
          We test and release new tools within the member portal across acquisition intelligence, pipeline design, and system architecture.
        </p>

        <p
          className="font-baskerville text-base leading-relaxed mb-6"
          style={{ color: 'var(--color-navy)' }}
        >
          It is also where patterns, insights, and evolving strategies are explored more openly before they are formalized.
        </p>

        <p
          className="font-baskerville text-base leading-relaxed mb-8"
          style={{ color: 'var(--color-navy)' }}
        >
          Members tend to be operators, sponsors, and builders actively working through real systems, not just exploring them.
        </p>

        <div
          className="h-px w-full mb-8"
          style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }}
        />

        {!success ? (
          <>
            <p
              className="font-montserrat text-xs tracking-wide mb-4"
              style={{ color: 'var(--color-text-muted)' }}
            >
              If you are already a member, enter your email to receive an access code.
            </p>

            <form onSubmit={handleSendAccessCode} className="mb-6">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 border-b bg-transparent py-3 font-montserrat text-sm transition-colors focus:outline-none mb-4"
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

              {error && (
                <p
                  className="font-montserrat text-xs mb-4"
                  style={{ color: '#DC2626' }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-montserrat text-xs tracking-[0.2em] uppercase py-4 transition-all duration-300"
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
                {loading ? 'Sending...' : 'Send Access Code'}
              </button>
            </form>
          </>
        ) : (
          <div className="mb-6">
            <div
              className="p-5 border mb-4"
              style={{ borderColor: 'var(--color-gold)', backgroundColor: 'rgba(201, 170, 113, 0.08)' }}
            >
              <p
                className="font-montserrat text-xs tracking-wide leading-relaxed"
                style={{ color: 'var(--color-navy)' }}
              >
                Access code sent. Check your email and enter the code to continue.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToVerify}
              className="w-full font-montserrat text-xs tracking-[0.2em] uppercase py-4 transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-navy)',
                color: 'var(--color-white)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-navy)';
              }}
            >
              Enter Access Code
            </button>
          </div>
        )}

        <div
          className="h-px w-full mb-6"
          style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }}
        />

        <p
          className="font-montserrat text-xs tracking-wide mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Otherwise, please sign up for complimentary resources.
        </p>

        <button
          type="button"
          onClick={handleSignUp}
          className="w-full font-montserrat text-xs tracking-[0.2em] uppercase py-4 border transition-all duration-300"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-navy)',
            borderColor: 'var(--color-gold)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gold)';
            e.currentTarget.style.color = 'var(--color-white)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-navy)';
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
