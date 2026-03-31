import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';

interface BuildRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: 'Enterprise' | 'Principal' | 'Studio';
  onSuccess: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  industry: string;
  teamSizeAndTools: string;
  goals: string;
  knownIssues: string;
}

interface FormErrors {
  [key: string]: boolean;
}

export default function BuildRequestModal({ isOpen, onClose, tier, onSuccess }: BuildRequestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    industry: '',
    teamSizeAndTools: '',
    goals: '',
    knownIssues: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      if (!formData[key as keyof FormData].trim()) {
        newErrors[key] = true;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-build-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            tier,
            ...formData,
            sourcePage: window.location.pathname,
            sourceSection: 'engineered-intelligence',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        industry: '',
        teamSizeAndTools: '',
        goals: '',
        knownIssues: '',
      });

      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border p-8"
        style={{
          backgroundColor: 'var(--color-ivory)',
          borderColor: 'var(--color-gold)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-gold)' }}
        >
          <X size={24} />
        </button>

        <h2
          className="font-cormorant text-4xl md:text-5xl font-light mb-8 pr-8"
          style={{ color: 'var(--color-navy)' }}
        >
          {tier}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.firstName ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.lastName ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
          </div>

          {/* Row 2: Company & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.company ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Your Title or Role"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.title ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
          </div>

          {/* Row 3: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email Address"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.email ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-3 border font-baskerville text-sm"
              style={{
                backgroundColor: 'var(--color-ivory)',
                borderColor: errors.phone ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
                color: 'var(--color-navy)',
              }}
            />
          </div>

          {/* Row 4: Industry */}
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="What industry are you operating in?"
            className="w-full p-3 border font-baskerville text-sm"
            style={{
              backgroundColor: 'var(--color-ivory)',
              borderColor: errors.industry ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
              color: 'var(--color-navy)',
            }}
          />

          {/* Row 5: Team Size and Current Tools */}
          <input
            type="text"
            name="teamSizeAndTools"
            value={formData.teamSizeAndTools}
            onChange={handleChange}
            placeholder="How large is your team and what tools are you currently using?"
            className="w-full p-3 border font-baskerville text-sm"
            style={{
              backgroundColor: 'var(--color-ivory)',
              borderColor: errors.teamSizeAndTools ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
              color: 'var(--color-navy)',
            }}
          />

          {/* Row 6: Describe Your Goals */}
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            placeholder="What are you trying to build, scale, or solve in the next 12 months?"
            rows={4}
            className="w-full p-3 border font-baskerville text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-ivory)',
              borderColor: errors.goals ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
              color: 'var(--color-navy)',
            }}
          />

          {/* Row 7: Known Issues */}
          <textarea
            name="knownIssues"
            value={formData.knownIssues}
            onChange={handleChange}
            placeholder="Where is your current infrastructure breaking down or creating friction?"
            rows={4}
            className="w-full p-3 border font-baskerville text-sm resize-none"
            style={{
              backgroundColor: 'var(--color-ivory)',
              borderColor: errors.knownIssues ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
              color: 'var(--color-navy)',
            }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-navy)',
              color: 'var(--color-ivory)',
            }}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT YOUR BUILD REQUEST'}
          </button>

          {/* Caption */}
          <p
            className="text-center font-baskerville text-sm"
            style={{ color: 'rgba(17, 40, 64, 0.6)' }}
          >
            Our team will review your submission and respond within 24 hours.
          </p>
        </form>
      </div>

      <style>{`
        input::placeholder,
        textarea::placeholder {
          color: #C9A84C !important;
          opacity: 1 !important;
        }
        input::-webkit-input-placeholder,
        textarea::-webkit-input-placeholder {
          color: #C9A84C !important;
          opacity: 1 !important;
        }
        input::-moz-placeholder,
        textarea::-moz-placeholder {
          color: #C9A84C !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
