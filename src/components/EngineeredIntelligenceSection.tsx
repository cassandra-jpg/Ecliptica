import { useState, useEffect } from 'react';
import BuildRequestModal from './BuildRequestModal';

type BuildTier = 'Enterprise' | 'Principal' | 'Studio';

export default function EngineeredIntelligenceSection() {
  const [modalTier, setModalTier] = useState<BuildTier | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<BuildTier | null>(null);

  useEffect(() => {
    if (confirmationMessage) {
      const timer = setTimeout(() => setConfirmationMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmationMessage]);

  const handleSuccess = (tier: BuildTier) => {
    setConfirmationMessage(tier);
  };

  const tiers: { name: BuildTier; desc: string }[] = [
    { name: 'Enterprise', desc: 'Large-scale operations' },
    { name: 'Principal', desc: 'Mid-size teams, $5M–$50M founders' },
    { name: 'Studio', desc: 'Small teams, early-stage, individuals' },
  ];

  return (
    <section id="engineered-intelligence" className="min-h-screen py-20 px-6 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-navy)' }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, var(--color-gold) 1px, transparent 1px)', backgroundSize: '40px 40px', animation: 'pulse 8s ease-in-out infinite' }} />

      <div className="max-w-6xl w-full text-center fade-in relative z-10">
        <p className="font-montserrat text-xs tracking-[0.35em] uppercase mb-6" style={{ color: 'var(--color-gold)' }}>Customized Infrastructure</p>
        <h2 className="font-cormorant text-4xl md:text-5xl font-light mb-8 max-w-4xl mx-auto" style={{ color: 'var(--color-white)' }}>Intelligence systems and sales architecture work together when they're built for how you operate.</h2>
        <p className="font-baskerville text-lg max-w-3xl mx-auto mb-16" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>We customize the processes and data architecture to your team's structure, market dynamics, and growth trajectory. The result is a system that compounds performance instead of requiring it.</p>
        <div className="w-full h-px mb-16" style={{ backgroundColor: 'var(--color-gold)' }} />
        <p className="font-montserrat text-xs tracking-[0.35em] uppercase mb-12" style={{ color: 'var(--color-gold)' }}>Select Your Build</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tiers.map(({ name, desc }) => (
            <button key={name} onClick={() => setModalTier(name)} className="border p-8 text-center transition-all duration-300 hover:bg-white hover:bg-opacity-5 relative" style={{ borderColor: 'rgba(201, 168, 76, 0.3)', borderWidth: '1px' }}>
              {confirmationMessage === name ? (
                <div className="font-montserrat text-xs tracking-[0.35em] uppercase" style={{ color: 'var(--color-gold)' }}>REQUEST RECEIVED</div>
              ) : (
                <>
                  <h3 className="font-cormorant text-3xl font-light mb-3" style={{ color: 'var(--color-white)' }}>{name}</h3>
                  <p className="font-baskerville text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{desc}</p>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="w-full h-px mb-8" style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }} />
        <p className="font-baskerville text-base italic mb-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Not sure which build fits your needs?</p>
        <a href="mailto:sales@ecliptica-ops.com?subject=Demo%20Request%20via%20Ecliptica.com" className="px-12 py-4 border font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-white hover:bg-opacity-5" style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}>Request a Live Demo</a>
      </div>

      {modalTier && (
        <BuildRequestModal isOpen={!!modalTier} onClose={() => setModalTier(null)} tier={modalTier} onSuccess={() => handleSuccess(modalTier)} />
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.06; } }`}</style>
    </section>
  );
}
