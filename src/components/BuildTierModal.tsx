import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Check, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { TIER_CONTENT, type BuildTier, type TierContent } from '../data/buildTierContent';

interface BuildTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: BuildTier;
}

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  industry: string;
  dynamicAnswer: string;
  honeypot: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  company: '',
  role: '',
  email: '',
  phone: '',
  industry: '',
  dynamicAnswer: '',
  honeypot: '',
};

export default function BuildTierModal({ isOpen, onClose, tier }: BuildTierModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const content = TIER_CONTENT[tier];

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
      setFormData(INITIAL_FORM);
      setErrors({});
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName.trim()) next.firstName = 'Required';
    if (!formData.lastName.trim()) next.lastName = 'Required';
    if (!formData.company.trim()) next.company = 'Required';
    if (!formData.role.trim()) next.role = 'Required';
    if (!formData.email.trim()) {
      next.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Invalid email';
    }
    if (!formData.phone.trim()) next.phone = 'Required';
    if (!formData.industry.trim()) next.industry = 'Required';
    if (!formData.dynamicAnswer.trim()) next.dynamicAnswer = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-build-request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            tier: content.label,
            build_type: tier,
            firstName: formData.firstName,
            lastName: formData.lastName,
            company: formData.company,
            title: formData.role,
            email: formData.email,
            phone: formData.phone,
            industry: formData.industry,
            dynamicQuestion: content.dynamicQuestion,
            dynamicAnswer: formData.dynamicAnswer,
            teamSizeAndTools: '',
            goals: '',
            knownIssues: formData.dynamicAnswer,
            sourcePage: window.location.pathname,
            sourceSection: 'engineered-intelligence',
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Submission failed');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const handleClose = () => {
    if (status !== 'submitting') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
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
          className="absolute top-8 right-8 transition-opacity hover:opacity-70 disabled:opacity-50 z-10"
          style={{ color: 'var(--color-gold)' }}
        >
          <X size={24} />
        </button>

        {status === 'success' ? (
          <SuccessView tier={content.label} onClose={handleClose} />
        ) : (
          <div className="px-8 md:px-14 py-12 md:py-16">
            <ModalHeader content={content} />
            <Divider />
            <NarrativeSection title="System Scope" items={content.focuses} />
            <Divider />
            <NarrativeSection title="Current State" items={content.startingPoints} />
            <Divider />
            <NarrativeSection title="Post-Implementation State" items={content.changesAfter} emphasize />
            <Divider />
            <NarrativeSection title="Qualification" items={content.fitCriteria} />
            <Divider />

            <p
              className="font-baskerville text-base italic text-center py-12 md:py-16"
              style={{ color: 'var(--color-navy)', opacity: 0.7 }}
            >
              {content.transitionLine}
            </p>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 font-montserrat text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-80 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--color-navy)',
                  color: 'var(--color-ivory)',
                }}
              >
                Request {content.label} Demo
                <ChevronRight size={14} />
              </button>
            ) : (
              <div ref={formRef}>
                <Divider />
                <TierForm
                  content={content}
                  formData={formData}
                  errors={errors}
                  status={status}
                  errorMessage={errorMessage}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
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
        `}</style>
      </div>
    </div>
  );
}

function SuccessView({ tier, onClose }: { tier: string; onClose: () => void }) {
  return (
    <div className="px-8 md:px-14 py-16 md:py-24 text-center">
      <div
        className="w-16 h-16 flex items-center justify-center mx-auto mb-8"
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <Check size={32} color="var(--color-gold)" />
      </div>
      <h2
        className="font-cormorant text-3xl md:text-4xl font-light mb-4"
        style={{ color: 'var(--color-navy)' }}
      >
        Request Received
      </h2>
      <p
        className="font-baskerville text-base mb-2"
        style={{ color: 'var(--color-navy)', opacity: 0.8 }}
      >
        Your {tier} build request has been submitted.
      </p>
      <p
        className="font-baskerville text-sm mb-10"
        style={{ color: 'var(--color-navy)', opacity: 0.6 }}
      >
        Our team will review your submission and respond within 24 hours.
      </p>
      <button
        onClick={onClose}
        className="px-10 py-3 font-montserrat text-xs tracking-[0.2em] uppercase transition-all duration-300 hover:opacity-80"
        style={{
          backgroundColor: 'var(--color-navy)',
          color: 'var(--color-ivory)',
        }}
      >
        Close
      </button>
    </div>
  );
}

function ModalHeader({ content }: { content: TierContent }) {
  return (
    <div className="text-center mb-0">
      <p
        className="font-montserrat text-[10px] tracking-[0.4em] uppercase mb-6"
        style={{ color: 'var(--color-gold)' }}
      >
        Build Tier
      </p>
      <h2
        className="font-cormorant text-4xl md:text-5xl font-light mb-5"
        style={{ color: 'var(--color-navy)' }}
      >
        {content.label}
      </h2>
      <p
        className="font-baskerville text-lg md:text-xl leading-relaxed max-w-lg mx-auto"
        style={{ color: 'var(--color-navy)', opacity: 0.75 }}
      >
        {content.positioning}
      </p>
    </div>
  );
}

function Divider() {
  return (
    <div className="py-10 md:py-12">
      <div
        className="w-full h-px"
        style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }}
      />
    </div>
  );
}

function NarrativeSection({
  title,
  items,
  emphasize = false,
}: {
  title: string;
  items: string[];
  emphasize?: boolean;
}) {
  return (
    <div>
      <p
        className="font-montserrat text-[10px] tracking-[0.35em] uppercase mb-8"
        style={{ color: 'var(--color-gold)' }}
      >
        {title}
      </p>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-4">
            <span
              className="inline-block mt-[7px] flex-shrink-0"
              style={{
                width: '5px',
                height: '5px',
                backgroundColor: 'var(--color-gold)',
              }}
            />
            <span
              className={`font-baskerville text-base leading-relaxed ${emphasize ? '' : ''}`}
              style={{
                color: 'var(--color-navy)',
                opacity: emphasize ? 0.9 : 0.7,
                fontWeight: emphasize ? 500 : 400,
              }}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface TierFormProps {
  content: TierContent;
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  status: FormStatus;
  errorMessage: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

function TierForm({
  content,
  formData,
  errors,
  status,
  errorMessage,
  onChange,
  onSubmit,
}: TierFormProps) {
  const inputStyle = (field: keyof FormData) => ({
    backgroundColor: 'var(--color-ivory)',
    borderColor: errors[field] ? '#b91c1c' : 'rgba(17, 40, 64, 0.2)',
    color: 'var(--color-navy)',
  });

  return (
    <div className="pt-4">
      <p
        className="font-montserrat text-[10px] tracking-[0.35em] uppercase mb-8 text-center"
        style={{ color: 'var(--color-gold)' }}
      >
        Request {content.label} Demo
      </p>

      {status === 'error' && (
        <div
          className="mb-8 p-4 border flex items-start gap-3"
          style={{ borderColor: '#b91c1c', backgroundColor: 'rgba(185, 28, 28, 0.05)' }}
        >
          <AlertCircle size={20} className="text-red-700 flex-shrink-0 mt-0.5" />
          <p className="font-baskerville text-sm text-red-700">
            {errorMessage || 'Something went wrong. Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <input
          type="text"
          name="honeypot"
          value={formData.honeypot}
          onChange={onChange}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            error={errors.firstName}
            style={inputStyle('firstName')}
            onChange={onChange}
          />
          <FormField
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            error={errors.lastName}
            style={inputStyle('lastName')}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            name="company"
            placeholder="Company Name"
            value={formData.company}
            error={errors.company}
            style={inputStyle('company')}
            onChange={onChange}
          />
          <FormField
            name="role"
            placeholder="Role / Title"
            value={formData.role}
            error={errors.role}
            style={inputStyle('role')}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            error={errors.email}
            style={inputStyle('email')}
            onChange={onChange}
          />
          <FormField
            name="phone"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            error={errors.phone}
            style={inputStyle('phone')}
            onChange={onChange}
          />
        </div>

        <FormField
          name="industry"
          placeholder="Industry"
          value={formData.industry}
          error={errors.industry}
          style={inputStyle('industry')}
          onChange={onChange}
        />

        <div className="pt-4">
          <label
            className="block font-baskerville text-sm mb-3"
            style={{ color: 'var(--color-navy)', opacity: 0.65 }}
          >
            {content.dynamicQuestion}
          </label>
          <textarea
            name="dynamicAnswer"
            value={formData.dynamicAnswer}
            onChange={onChange}
            placeholder="Share your thoughts..."
            rows={5}
            maxLength={2000}
            className="w-full p-4 border font-baskerville text-sm resize-none focus:outline-none focus:border-[#C9A84C] transition-colors leading-relaxed"
            style={inputStyle('dynamicAnswer')}
          />
          {errors.dynamicAnswer && (
            <p className="mt-1 text-xs text-red-700">{errors.dynamicAnswer}</p>
          )}
        </div>

        <div className="pt-4">
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
              `Submit ${content.label} Request`
            )}
          </button>
        </div>

        <p
          className="text-center font-baskerville text-sm pt-1"
          style={{ color: 'rgba(17, 40, 64, 0.45)' }}
        >
          Our team will review your submission and respond within 24 hours.
        </p>
      </form>
    </div>
  );
}

function FormField({
  name,
  placeholder,
  value,
  error,
  style,
  type = 'text',
  onChange,
}: {
  name: string;
  placeholder: string;
  value: string;
  error?: string;
  style: React.CSSProperties;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 border font-baskerville text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
        style={style}
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
