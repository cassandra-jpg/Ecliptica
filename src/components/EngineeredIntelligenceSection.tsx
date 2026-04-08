import { useState } from 'react';
import BuildTierModal from './BuildTierModal';
import DemoRequestModal from './DemoRequestModal';
import { type BuildTier } from '../data/buildTierContent';

const TIER_CARDS: { tier: BuildTier; title: string; subtitle: string }[] = [
  {
    tier: 'enterprise',
    title: 'Enterprise',
    subtitle: 'Large-scale operations',
  },
  {
    tier: 'principal',
    title: 'Principal',
    subtitle: 'Mid-size teams, $5M\u2013$50M founders',
  },
  {
    tier: 'studio',
    title: 'Studio',
    subtitle: 'Small teams, early-stage, individuals',
  },
];

export default function EngineeredIntelligenceSection() {
  const [activeTier, setActiveTier] = useState<BuildTier | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section
      id="engineered-intelligence"
      className="min-h-screen py-20 px-6 flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-navy)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-gold) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />

      <div className="max-w-6xl w-full text-center fade-in relative z-10">
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--color-gold)' }}
        >
          Customized Infrastructure
        </p>

        <h2
          className="font-cormorant text-4xl md:text-5xl font-light mb-8 max-w-4xl mx-auto"
          style={{ color: 'var(--color-white)' }}
        >
          Intelligence systems and sales architecture work together when they're built for how
          you operate.
        </h2>

        <p
          className="font-baskerville text-lg max-w-3xl mx-auto mb-16"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          We customize the processes and data architecture to your team's structure, market
          dynamics, and growth trajectory. The result is a system that compounds performance
          instead of requiring it.
        </p>

        <div className="w-full h-px mb-16" style={{ backgroundColor: 'var(--color-gold)' }} />

        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-12"
          style={{ color: 'var(--color-gold)' }}
        >
          Select Your Build
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIER_CARDS.map(({ tier, title, subtitle }) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className="border p-8 text-center transition-all duration-300 hover:bg-white hover:bg-opacity-5 group"
              style={{
                borderColor: 'rgba(201, 168, 76, 0.3)',
                borderWidth: '1px',
              }}
            >
              <h3
                className="font-cormorant text-3xl font-light mb-3"
                style={{ color: 'var(--color-white)' }}
              >
                {title}
              </h3>
              <p
                className="font-baskerville text-sm"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                {subtitle}
              </p>
            </button>
          ))}
        </div>

        <div
          className="w-full h-px mb-8"
          style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }}
        />

        <p
          className="font-baskerville text-base italic mb-6"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Not sure which build fits your needs?
        </p>

        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="px-12 py-4 border font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-white hover:bg-opacity-5"
          style={{
            borderColor: 'var(--color-gold)',
            color: 'var(--color-gold)',
          }}
        >
          Request a Live Demo
        </button>
      </div>

      {activeTier && (
        <BuildTierModal
          isOpen={!!activeTier}
          onClose={() => setActiveTier(null)}
          tier={activeTier}
        />
      )}

      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        sourcePage={window.location.pathname}
        sourceSection="engineered-intelligence"
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
      `}</style>
    </section>
  );
}
