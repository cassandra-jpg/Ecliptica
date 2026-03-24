import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

export default function MembersPage() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestType, setRequestType] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('member_feedback')
        .insert([{
          email: feedbackEmail,
          message: feedbackMessage,
        }]);

      if (error) throw error;

      setFeedbackEmail('');
      setFeedbackMessage('');
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('member_requests')
        .insert([{
          email: requestEmail,
          request_type: requestType,
          message: requestMessage,
        }]);

      if (error) throw error;

      setRequestEmail('');
      setRequestType('');
      setRequestMessage('');
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!session) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5F0' }}>
      <header className="border-b p-6 flex justify-between items-center" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
        <div>
          <h1 className="font-cormorant text-4xl" style={{ color: '#1B2340' }}>
            Members Area
          </h1>
          <p className="font-montserrat text-xs mt-2" style={{ color: 'rgba(27, 35, 64, 0.6)' }}>
            Passwordless Access
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 font-montserrat text-xs tracking-wider px-6 py-3 border transition-all"
          style={{ color: '#C9A84C', borderColor: '#C9A84C' }}
        >
          <LogOut size={16} />
          SIGN OUT
        </button>
      </header>

      <main className="p-12 max-w-6xl mx-auto">
        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            TOOLS AREA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className="border p-6 h-40 flex items-center justify-center"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}
              >
                <p className="font-cormorant text-xl" style={{ color: 'rgba(27, 35, 64, 0.5)' }}>
                  Tool {num}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            FEEDBACK
          </h2>
          <form onSubmit={handleFeedbackSubmit} className="border p-8" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <div className="space-y-6">
              <input
                type="email"
                placeholder="Email Address"
                value={feedbackEmail}
                onChange={(e) => setFeedbackEmail(e.target.value)}
                className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#1B2340' }}
                required
              />
              <textarea
                placeholder="Your feedback"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={5}
                className="w-full bg-transparent border py-3 px-4 font-baskerville text-sm focus:outline-none"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#1B2340' }}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all"
                style={{ backgroundColor: '#8A8FA8', color: '#FFFFFF' }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = '#C9A84C';
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = '#8A8FA8';
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              {feedbackSuccess && (
                <p className="font-montserrat text-xs" style={{ color: '#10B981' }}>
                  Feedback submitted successfully!
                </p>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2 className="font-montserrat text-xs tracking-[0.4em] uppercase mb-6" style={{ color: '#C9A84C' }}>
            PRODUCT FEATURE / IDEA SUBMISSION
          </h2>
          <div className="border p-8 mb-6" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', backgroundColor: 'rgba(201, 168, 76, 0.05)' }}>
            <p className="font-baskerville text-sm leading-relaxed" style={{ color: 'rgba(27, 35, 64, 0.7)' }}>
              If you are interested in featuring a product or collaborating, an MNDA will be issued to protect both parties.
              Ecliptica does not take credit for external work unless a formal collaboration is established. Any collaboration
              involving development or shared work requires a signed agreement.
            </p>
          </div>
          <form onSubmit={handleRequestSubmit} className="border p-8" style={{ borderColor: 'rgba(201, 168, 76, 0.3)' }}>
            <div className="space-y-6">
              <input
                type="email"
                placeholder="Email Address"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#1B2340' }}
                required
              />
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-transparent border-b py-3 font-baskerville text-sm focus:outline-none"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#1B2340', backgroundColor: '#F7F5F0' }}
                required
              >
                <option value="">Select request type</option>
                <option value="feature_product">I want to feature my product</option>
                <option value="tool_submission">I have an idea or tool submission</option>
              </select>
              <textarea
                placeholder="Tell us more"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={5}
                className="w-full bg-transparent border py-3 px-4 font-baskerville text-sm focus:outline-none"
                style={{ borderColor: 'rgba(201, 168, 76, 0.3)', color: '#1B2340' }}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-12 py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all"
                style={{ backgroundColor: '#8A8FA8', color: '#FFFFFF' }}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = '#C9A84C';
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.backgroundColor = '#8A8FA8';
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              {requestSuccess && (
                <p className="font-montserrat text-xs" style={{ color: '#10B981' }}>
                  Request submitted successfully!
                </p>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
