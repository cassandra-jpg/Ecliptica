import { useState, FormEvent } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage: string;
  sourceSection?: string;
}

interface FormData {
  name: string;
  businessName: string;
  role: string;
  companySize: string;
  revenueRange: string;
  industry: string;
  primaryGoal: string;
  timeline: string;
  email: string;
  linkedinUrl: string;
  schedulingUrl: string;
  message: string;
  honeypot: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const COMPANY_SIZE_OPTIONS = ['1–10', '10–50', '50–200', '200+'];
const REVENUE_OPTIONS = ['Under $1M', '$1M–$5M', '$5M–$10M', '$10M+'];
const GOAL_OPTIONS = [
  'Outbound pipeline',
  'Deal flow / capital sourcing',
  'Acquisition pipeline',
  'Sales automation',
  'Other',
];
const TIMELINE_OPTIONS = ['Immediately', '30–60 days', 'Exploring'];

export default function DemoRequestModal({
  isOpen,
  onClose,
  sourcePage,
  sourceSection,
}: DemoRequestModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    businessName: '',
    role: '',
    companySize: '',
    revenueRange: '',
    industry: '',
    primaryGoal: '',
    timeline: '',
    email: '',
    linkedinUrl: '',
    schedulingUrl: '',
    message: '',
    honeypot: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [schedulingLinkProvided, setSchedulingLinkProvided] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.companySize) newErrors.companySize = 'Company size is required';
    if (!formData.revenueRange) newErrors.revenueRange = 'Revenue range is required';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.primaryGoal) newErrors.primaryGoal = 'Please select your primary goal';
    if (!formData.timeline) newErrors.timeline = 'Timeline is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid URL';
    }

    if (formData.schedulingUrl && !isValidUrl(formData.schedulingUrl)) {
      newErrors.schedulingUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getUtmParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      const value = urlParams.get(key);
      if (value) params[key] = value;
    });
    if (document.referrer) params.referrer = document.referrer;
    return params;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus('submitting');
    setErrorMessage('');
    setSchedulingLinkProvided(!!formData.schedulingUrl.trim());

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            formType: 'demo_request',
            sourcePage,
            sourceSection,
            name: formData.name,
            email: formData.email,
            businessName: formData.businessName,
            role: formData.role,
            companySize: formData.companySize,
            revenueRange: formData.revenueRange,
            industry: formData.industry,
            primaryGoal: formData.primaryGoal,
            timeline: formData.timeline,
            linkedinUrl: formData.linkedinUrl || undefined,
            schedulingUrl: formData.schedulingUrl || undefined,
            message: formData.message || undefined,
            metadata: getUtmParams(),
            honeypot: formData.honeypot,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
    } catch (error) {
      console.error('Form submission error:', error);
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const handleClose = () => {
    if (status !== 'submitting') {
      setFormData({
        name: '',
        businessName: '',
        role: '',
        companySize: '',
        revenueRange: '',
        industry: '',
        primaryGoal: '',
        timeline: '',
        email: '',
        linkedinUrl: '',
        schedulingUrl: '',
        message: '',
        honeypot: '',
      });
      setErrors({});
      setStatus('idle');
      setErrorMessage('');
      onClose();
    }
  };

  const inputBaseStyle = {
    backgroundColor: 'var(--color-ivory)',
    borderColor: 'rgba(17, 40, 64, 0.2)',
    color: 'var(--color-navy)',
  };

  const inputErrorStyle = {
    ...inputBaseStyle,
    borderColor: '#b91c1c',
  };

  const renderInput = (
    name: keyof FormData,
    placeholder: string,
    type: string = 'text',
    required: boolean = true
  ) => (
    <div>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={name === 'message' ? 1000 : 500}
        className="w-full p-3 border font-baskerville text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
        style={errors[name] ? inputErrorStyle : inputBaseStyle}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-700">{errors[name]}</p>
      )}
    </div>
  );

  const renderSelect = (
    name: keyof FormData,
    placeholder: string,
    options: string[]
  ) => (
    <div>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-3 border font-baskerville text-sm focus:outline-none focus:border-[#C9A84C] transition-colors appearance-none bg-no-repeat"
        style={{
          ...(errors[name] ? inputErrorStyle : inputBaseStyle),
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23C9A84C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundPosition: 'right 12px center',
          color: formData[name] ? 'var(--color-navy)' : '#C9A84C',
        }}
      >
        <option value="" disabled style={{ color: '#C9A84C' }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ color: 'var(--color-navy)' }}>
            {opt}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-xs text-red-700">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border"
        style={{
          backgroundColor: 'var(--color-ivory)',
          borderColor: 'var(--color-gold)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={status === 'submitting'}
          className="absolute top-6 right-6 transition-opacity hover:opacity-70 disabled:opacity-50 z-10"
          style={{ color: 'var(--color-gold)' }}
        >
          <X size={24} />
        </button>

        {status === 'success' ? (
          <div className="p-8 md:p-12 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'var(--color-navy)' }}
            >
              <Check size={32} color="var(--color-gold)" />
            </div>
            <h2
              className="font-cormorant text-3xl md:text-4xl font-light mb-4"
              style={{ color: 'var(--color-navy)' }}
            >
              Thank You
            </h2>
            <p
              className="font-baskerville text-base mb-4"
              style={{ color: 'var(--color-navy)', opacity: 0.8 }}
            >
              Your request has been received. A member of our team will review your submission and
              follow up shortly.
            </p>
            {!schedulingLinkProvided && (
              <p
                className="font-baskerville text-sm"
                style={{ color: 'var(--color-navy)', opacity: 0.6 }}
              >
                Since no scheduling link was provided, we'll reach out by email to coordinate.
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-8 px-8 py-3 font-montserrat text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-navy)',
                color: 'var(--color-ivory)',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-12">
            <h2
              className="font-cormorant text-3xl md:text-4xl font-light mb-2 pr-8"
              style={{ color: 'var(--color-navy)' }}
            >
              Request a Live Demo
            </h2>
            <p
              className="font-baskerville text-sm mb-8"
              style={{ color: 'var(--color-navy)', opacity: 0.7 }}
            >
              Tell us a bit about your business and we'll coordinate next steps.
            </p>

            {status === 'error' && (
              <div
                className="mb-6 p-4 border flex items-start gap-3"
                style={{ borderColor: '#b91c1c', backgroundColor: 'rgba(185, 28, 28, 0.05)' }}
              >
                <AlertCircle size={20} className="text-red-700 flex-shrink-0 mt-0.5" />
                <p className="font-baskerville text-sm text-red-700">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('name', 'Name')}
                {renderInput('businessName', 'Business Name')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('role', 'Role / Title')}
                {renderInput('industry', 'Industry')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('companySize', 'Company Size', COMPANY_SIZE_OPTIONS)}
                {renderSelect('revenueRange', 'Revenue Range', REVENUE_OPTIONS)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelect('primaryGoal', 'What are you looking to build or improve?', GOAL_OPTIONS)}
                {renderSelect('timeline', 'Timeline', TIMELINE_OPTIONS)}
              </div>

              {renderInput('email', 'Email', 'email')}

              <div>
                <label
                  className="block font-baskerville text-xs mb-1"
                  style={{ color: 'var(--color-navy)', opacity: 0.6 }}
                >
                  LinkedIn profile (optional but recommended)
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full p-3 border font-baskerville text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  style={errors.linkedinUrl ? inputErrorStyle : inputBaseStyle}
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-xs text-red-700">{errors.linkedinUrl}</p>
                )}
              </div>

              <div>
                <label
                  className="block font-baskerville text-xs mb-1"
                  style={{ color: 'var(--color-navy)', opacity: 0.6 }}
                >
                  Scheduling link (optional)
                </label>
                <input
                  type="url"
                  name="schedulingUrl"
                  value={formData.schedulingUrl}
                  onChange={handleChange}
                  placeholder="https://calendly.com/..."
                  className="w-full p-3 border font-baskerville text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
                  style={errors.schedulingUrl ? inputErrorStyle : inputBaseStyle}
                />
                {errors.schedulingUrl && (
                  <p className="mt-1 text-xs text-red-700">{errors.schedulingUrl}</p>
                )}
              </div>

              <div>
                <label
                  className="block font-baskerville text-xs mb-1"
                  style={{ color: 'var(--color-navy)', opacity: 0.6 }}
                >
                  Tell us more about your business (optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share any additional context..."
                  rows={3}
                  maxLength={1000}
                  className="w-full p-3 border font-baskerville text-sm resize-none focus:outline-none focus:border-[#C9A84C] transition-colors"
                  style={inputBaseStyle}
                />
                <p
                  className="mt-1 text-xs text-right"
                  style={{ color: 'var(--color-navy)', opacity: 0.4 }}
                >
                  {formData.message.length}/1000
                </p>
              </div>

              <p
                className="font-baskerville text-xs"
                style={{ color: 'var(--color-navy)', opacity: 0.5 }}
              >
                If no scheduling link is provided, a member of our team will reach out via email to
                coordinate next steps.
              </p>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 font-montserrat text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-navy)',
                  color: 'var(--color-ivory)',
                }}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>
          </div>
        )}

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
          select option {
            background-color: var(--color-ivory);
          }
        `}</style>
      </div>
    </div>
  );
}
