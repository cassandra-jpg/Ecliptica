import { useState, FormEvent } from 'react';
import { X, Check } from 'lucide-react';

interface MAConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  firmEntity: string;
  role: string;
  currentStage: string;
  dealFocus: string[];
  targetProfile: string;
  capitalStatus: string;
  supportNeeds: string[];
  message: string;
}

interface FormErrors {
  [key: string]: boolean;
}

const ROLE_OPTIONS = [
  'Founder / Operator',
  'Independent Sponsor',
  'Private Equity',
  'Family Office',
  'Strategic / Corporate',
  'Other',
];

const STAGE_OPTIONS = [
  'Actively executing (live deals or outreach)',
  'Preparing thesis / structuring',
  'Building pipeline',
  'Exploring opportunities',
];

const DEAL_FOCUS_OPTIONS = [
  'Roll-up strategy',
  'Single acquisition',
  'Buy-side mandate',
  'Sell-side mandate',
  'Capital raise',
  'Strategic acquisition',
  'Other',
];

const CAPITAL_STATUS_OPTIONS = [
  'Capital secured',
  'Capital in process',
  'Partnering with capital',
  'Not yet secured',
];

const SUPPORT_OPTIONS = [
  'Deal sourcing / origination',
  'Thesis development',
  'Capital formation',
  'LOI / negotiation support',
  'Talent / operator placement',
  'Sales / revenue infrastructure',
  'Systems / data / technology layer',
  'Other',
];

export default function MAConversationModal({ isOpen, onClose }: MAConversationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    firmEntity: '',
    role: '',
    currentStage: '',
    dealFocus: [],
    targetProfile: '',
    capitalStatus: '',
    supportNeeds: [],
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleMultiSelect = (field: 'dealFocus' | 'supportNeeds', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const requiredFields = ['name', 'email', 'firmEntity', 'role', 'currentStage', 'targetProfile'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof FormData] || (typeof formData[field as keyof FormData] === 'string' && !(formData[field as keyof FormData] as string).trim())) {
        newErrors[field] = true;
        isValid = false;
      }
    });

    if (formData.dealFocus.length === 0) {
      newErrors.dealFocus = true;
      isValid = false;
    }

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
            tier: 'M&A Inquiry',
            firstName: formData.name.split(' ')[0] || formData.name,
            lastName: formData.name.split(' ').slice(1).join(' ') || '',
            company: formData.firmEntity,
            title: formData.role,
            email: formData.email,
            phone: '',
            industry: `Deal Focus: ${formData.dealFocus.join(', ')}`,
            teamSizeAndTools: `Current Stage: ${formData.currentStage}${formData.capitalStatus ? ` | Capital Status: ${formData.capitalStatus}` : ''}`,
            goals: `Target Profile: ${formData.targetProfile}${formData.supportNeeds.length > 0 ? `\n\nSupport Needs: ${formData.supportNeeds.join(', ')}` : ''}`,
            knownIssues: formData.message || 'No additional message provided.',
            sourcePage: window.location.pathname,
            sourceSection: 'ma-conversation',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      firmEntity: '',
      role: '',
      currentStage: '',
      dealFocus: [],
      targetProfile: '',
      capitalStatus: '',
      supportNeeds: [],
      message: '',
    });
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  const inputStyle = (fieldName: string) => ({
    backgroundColor: 'var(--color-ivory)',
    borderColor: errors[fieldName] ? 'var(--color-gold)' : 'rgba(17, 40, 64, 0.2)',
    color: 'var(--color-navy)',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border p-8 md:p-10"
        style={{
          backgroundColor: 'var(--color-ivory)',
          borderColor: 'var(--color-gold)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-gold)' }}
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(201, 168, 76, 0.15)' }}
            >
              <Check size={32} style={{ color: 'var(--color-gold)' }} />
            </div>
            <h3
              className="font-cormorant text-3xl font-light mb-4"
              style={{ color: 'var(--color-navy)' }}
            >
              Request received.
            </h3>
            <p
              className="font-baskerville text-base"
              style={{ color: 'rgba(17, 40, 64, 0.7)' }}
            >
              If there is alignment, we will follow up with next steps.
            </p>
          </div>
        ) : (
          <>
            <h2
              className="font-cormorant text-4xl font-light mb-3"
              style={{ color: 'var(--color-navy)' }}
            >
              Start a Conversation
            </h2>
            <p
              className="font-baskerville text-base mb-2"
              style={{ color: 'var(--color-navy)' }}
            >
              For operators, sponsors, and groups actively executing or structuring acquisition strategies.
            </p>
            <p
              className="font-baskerville text-sm mb-8"
              style={{ color: 'rgba(17, 40, 64, 0.6)' }}
            >
              We work across origination, capital formation, execution, and post-acquisition infrastructure.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-3 border font-baskerville text-sm"
                style={inputStyle('name')}
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 border font-baskerville text-sm"
                style={inputStyle('email')}
              />

              <input
                type="text"
                name="firmEntity"
                value={formData.firmEntity}
                onChange={handleChange}
                placeholder="Firm / Entity"
                className="w-full p-3 border font-baskerville text-sm"
                style={inputStyle('firmEntity')}
              />

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-3 border font-baskerville text-sm appearance-none cursor-pointer"
                  style={inputStyle('role')}
                >
                  <option value="">Select your role</option>
                  {ROLE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Where are you in your acquisition process?
                </label>
                <select
                  name="currentStage"
                  value={formData.currentStage}
                  onChange={handleChange}
                  className="w-full p-3 border font-baskerville text-sm appearance-none cursor-pointer"
                  style={inputStyle('currentStage')}
                >
                  <option value="">Select current stage</option>
                  {STAGE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: errors.dealFocus ? 'var(--color-gold)' : 'var(--color-gold)' }}
                >
                  Deal focus (select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEAL_FOCUS_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelect('dealFocus', option)}
                      className="p-3 border font-baskerville text-sm text-left transition-all duration-200"
                      style={{
                        backgroundColor: formData.dealFocus.includes(option)
                          ? 'var(--color-navy)'
                          : 'var(--color-ivory)',
                        borderColor: errors.dealFocus
                          ? 'var(--color-gold)'
                          : formData.dealFocus.includes(option)
                            ? 'var(--color-navy)'
                            : 'rgba(17, 40, 64, 0.2)',
                        color: formData.dealFocus.includes(option)
                          ? 'var(--color-ivory)'
                          : 'var(--color-navy)',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  What type of companies are you targeting?
                </label>
                <input
                  type="text"
                  name="targetProfile"
                  value={formData.targetProfile}
                  onChange={handleChange}
                  placeholder="e.g., B2B SaaS, home services, light manufacturing..."
                  className="w-full p-3 border font-baskerville text-sm"
                  style={inputStyle('targetProfile')}
                />
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Capital status (optional)
                </label>
                <select
                  name="capitalStatus"
                  value={formData.capitalStatus}
                  onChange={handleChange}
                  className="w-full p-3 border font-baskerville text-sm appearance-none cursor-pointer"
                  style={inputStyle('capitalStatus')}
                >
                  <option value="">Select capital status</option>
                  {CAPITAL_STATUS_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Where do you need support? (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORT_OPTIONS.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleMultiSelect('supportNeeds', option)}
                      className="p-3 border font-baskerville text-sm text-left transition-all duration-200"
                      style={{
                        backgroundColor: formData.supportNeeds.includes(option)
                          ? 'var(--color-navy)'
                          : 'var(--color-ivory)',
                        borderColor: formData.supportNeeds.includes(option)
                          ? 'var(--color-navy)'
                          : 'rgba(17, 40, 64, 0.2)',
                        color: formData.supportNeeds.includes(option)
                          ? 'var(--color-ivory)'
                          : 'var(--color-navy)',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block font-montserrat text-xs tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Anything else we should know? (optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Strategy, timeline, or specific needs..."
                  rows={3}
                  className="w-full p-3 border font-baskerville text-sm resize-none"
                  style={inputStyle('message')}
                />
              </div>

              <p
                className="font-baskerville text-xs pt-2"
                style={{ color: 'rgba(17, 40, 64, 0.5)' }}
              >
                We work with groups actively deploying capital or executing acquisition strategies.
                If there is alignment, we will follow up with next steps.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-navy)',
                  color: 'var(--color-ivory)',
                }}
              >
                {isSubmitting ? 'SUBMITTING...' : 'START A CONVERSATION'}
              </button>
            </form>
          </>
        )}
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
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23C9A84C' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
      `}</style>
    </div>
  );
}
