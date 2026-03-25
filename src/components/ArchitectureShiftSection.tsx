export default function ArchitectureShiftSection() {
  return (
    <section
      id="sales-systems"
      className="min-h-screen py-20 px-6 flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-navy)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-gold) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="max-w-6xl w-full fade-in relative z-10">
        <p className="font-montserrat text-xs tracking-[0.35em] uppercase text-center mb-6" style={{ color: 'var(--color-gold)' }}>The Sales Systems</p>

        <h2 className="font-cormorant text-4xl md:text-5xl text-center mb-3 max-w-4xl mx-auto" style={{ color: 'var(--color-white)' }}>
          The pipeline problem was never about people. It was always about architecture.
        </h2>

        <p className="font-cormorant italic text-center mb-16" style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>
          Performance-dependent systems have a ceiling. Ecliptica replaces the ceiling with a structure that compounds.
        </p>

        <div className="mb-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 border" style={{ borderColor: 'var(--color-gold)', borderWidth: '1px' }}>
            <div className="p-6 border-b border-r" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-center" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Conventional Systems</p>
            </div>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-center" style={{ color: 'var(--color-gold)' }}>Ecliptica Infrastructure</p>
            </div>
            <div className="p-6 border-b border-r" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-white)' }}>Revenue tied to rep performance</p>
            </div>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-gold-light)' }}>Revenue tied to system logic.</p>
            </div>
            <div className="p-6 border-b border-r" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-white)' }}>Pipeline visibility is retrospective</p>
            </div>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-gold-light)' }}>Pipeline intelligence is predictive.</p>
            </div>
            <div className="p-6 border-b border-r" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-white)' }}>Hiring scales cost before it scales output</p>
            </div>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-gold-light)' }}>Architecture scales output without headcount.</p>
            </div>
            <div className="p-6 border-r" style={{ borderColor: 'var(--color-gold)' }}>
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-white)' }}>Signal lives in CRM fields</p>
            </div>
            <div className="p-6">
              <p className="font-baskerville text-sm text-center" style={{ color: 'var(--color-gold-light)' }}>Signal lives in behavioral timing layers.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="relative" style={{ width: '480px', height: '480px', maxWidth: '90vw', maxHeight: '90vw' }}>
            <svg viewBox="0 0 480 480" className="w-full h-full" style={{ animation: 'rotate 18s linear infinite' }}>
              <circle cx="240" cy="240" r="180" fill="none" stroke="rgba(201, 168, 76, 0.4)" strokeWidth="1.5" />
            </svg>
            <div className="absolute" style={{ top: '10%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="flex flex-col items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C9A84C' }} />
                <p className="font-montserrat uppercase mt-3 text-center max-w-[180px]" style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em' }}>Behavioral Trigger</p>
              </div>
            </div>
            <div className="absolute" style={{ top: '50%', right: '10%', transform: 'translate(50%, -50%)' }}>
              <div className="flex flex-col items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C9A84C' }} />
                <p className="font-montserrat uppercase mt-3 text-center max-w-[180px]" style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em' }}>Timing Layer</p>
              </div>
            </div>
            <div className="absolute" style={{ bottom: '10%', left: '50%', transform: 'translate(-50%, 50%)' }}>
              <div className="flex flex-col items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C9A84C' }} />
                <p className="font-montserrat uppercase mt-3 text-center max-w-[180px]" style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em' }}>Structural Output</p>
              </div>
            </div>
            <div className="absolute" style={{ top: '50%', left: '10%', transform: 'translate(-50%, -50%)' }}>
              <div className="flex flex-col items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C9A84C' }} />
                <p className="font-montserrat uppercase mt-3 text-center max-w-[180px]" style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em' }}>Signal Compounding</p>
              </div>
            </div>
          </div>
        </div>

        <p className="font-baskerville text-lg italic text-center mb-6 max-w-3xl mx-auto" style={{ color: 'var(--color-white)' }}>
          We do not optimize pipelines. We replace the conditions that make optimization necessary.
        </p>

        <p className="font-montserrat text-xs tracking-[0.25em] uppercase text-center" style={{ color: 'var(--color-gold)' }}>
          Behavioral Architecture · Predictive Sequencing · Compounding Infrastructure
        </p>

        <style>{`@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </section>
  );
}
