import { useState } from 'react';

export default function EngineeredIntelligenceSection() {
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null);

  return (
    <section
      id="engineered-intelligence"
      className="min-h-screen py-20 px-6 flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-navy)' }}
    >
      {/* Pulsing dot pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--color-gold) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'pulse 8s ease-in-out infinite'
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
          Intelligence systems and sales architecture work together when they're built for how you operate.
        </h2>

        <p
          className="font-baskerville text-lg max-w-3xl mx-auto mb-16"
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          We customize the processes and data architecture to your team's structure, market dynamics, and growth trajectory. The result is a system that compounds performance instead of requiring it.
        </p>

        {/* Full-width gold rule */}
        <div className="w-full h-px mb-16" style={{ backgroundColor: 'var(--color-gold)' }} />

        {/* Call to action */}
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-12"
          style={{ color: 'var(--color-gold)' }}
        >
          Select Your Build
        </p>

        {/* Three build option tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Enterprise */}
          <button
            onClick={() => setSelectedBuild('enterprise')}
            className="border p-8 text-center transition-all duration-300 hover:bg-white hover:bg-opacity-5"
            style={{
              borderColor: selectedBuild === 'enterprise' ? 'var(--color-gold)' : 'rgba(201, 168, 76, 0.3)',
              borderWidth: selectedBuild === 'enterprise' ? '2px' : '1px',
              backgroundColor: selectedBuild === 'enterprise' ? 'rgba(201, 168, 76, 0.08)' : 'transparent'
            }}
          >
            <h3
              className="font-cormorant text-3xl font-light mb-3"
              style={{ color: 'var(--color-white)' }}
            >
              Enterprise
            </h3>
            <p
              className="font-baskerville text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Large-scale operations
            </p>
          </button>

          {/* Principal */}
          <button
            onClick={() => setSelectedBuild('principal')}
            className="border p-8 text-center transition-all duration-300 hover:bg-white hover:bg-opacity-5"
            style={{
              borderColor: selectedBuild === 'principal' ? 'var(--color-gold)' : 'rgba(201, 168, 76, 0.3)',
              borderWidth: selectedBuild === 'principal' ? '2px' : '1px',
              backgroundColor: selectedBuild === 'principal' ? 'rgba(201, 168, 76, 0.08)' : 'transparent'
            }}
          >
            <h3
              className="font-cormorant text-3xl font-light mb-3"
              style={{ color: 'var(--color-white)' }}
            >
              Principal
            </h3>
            <p
              className="font-baskerville text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Mid-size teams, $5M–$50M founders
            </p>
          </button>

          {/* Studio */}
          <button
            onClick={() => setSelectedBuild('studio')}
            className="border p-8 text-center transition-all duration-300 hover:bg-white hover:bg-opacity-5"
            style={{
              borderColor: selectedBuild === 'studio' ? 'var(--color-gold)' : 'rgba(201, 168, 76, 0.3)',
              borderWidth: selectedBuild === 'studio' ? '2px' : '1px',
              backgroundColor: selectedBuild === 'studio' ? 'rgba(201, 168, 76, 0.08)' : 'transparent'
            }}
          >
            <h3
              className="font-cormorant text-3xl font-light mb-3"
              style={{ color: 'var(--color-white)' }}
            >
              Studio
            </h3>
            <p
              className="font-baskerville text-sm"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              Small teams, early-stage, individuals
            </p>
          </button>
        </div>

        {/* Form area */}
        {selectedBuild && (
          <div className="max-w-2xl mx-auto mb-12 p-8 border" style={{ borderColor: 'var(--color-gold)' }}>
            <h4
              className="font-cormorant text-2xl font-light mb-6"
              style={{ color: 'var(--color-white)' }}
            >
              {selectedBuild === 'enterprise' && 'Enterprise Build Request'}
              {selectedBuild === 'principal' && 'Principal Build Request'}
              {selectedBuild === 'studio' && 'Studio Build Request'}
            </h4>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 bg-transparent border font-baskerville text-sm"
                style={{
                  borderColor: 'rgba(201, 168, 76, 0.3)',
                  color: 'var(--color-white)'
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 bg-transparent border font-baskerville text-sm"
                style={{
                  borderColor: 'rgba(201, 168, 76, 0.3)',
                  color: 'var(--color-white)'
                }}
              />
              <input
                type="text"
                placeholder="Company"
                className="w-full p-3 bg-transparent border font-baskerville text-sm"
                style={{
                  borderColor: 'rgba(201, 168, 76, 0.3)',
                  color: 'var(--color-white)'
                }}
              />
              <textarea
                placeholder="Tell us about your current pipeline challenges"
                rows={4}
                className="w-full p-3 bg-transparent border font-baskerville text-sm resize-none"
                style={{
                  borderColor: 'rgba(201, 168, 76, 0.3)',
                  color: 'var(--color-white)'
                }}
              />
              <button
                type="submit"
                className="w-full py-4 font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-navy)'
                }}
              >
                Submit Request
              </button>
            </form>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px mb-8" style={{ backgroundColor: 'rgba(201, 168, 76, 0.3)' }} />

        {/* Live demo option */}
        <p
          className="font-baskerville text-base italic mb-6"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Not sure which build fits your needs?
        </p>

        <button
          className="px-12 py-4 border font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:bg-white hover:bg-opacity-5"
          style={{
            borderColor: 'var(--color-gold)',
            color: 'var(--color-gold)'
          }}
        >
          Request a Live Demo
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        input::placeholder,
        textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </section>
  );
}
