export default function MASection() {
  return (
    <section
      id="ma"
      className="py-20 px-6 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-ivory)' }}
    >
      <div className="max-w-6xl w-full text-center fade-in">
        {/* Eyebrow */}
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--color-gold)' }}
        >
          M&A
        </p>

        {/* Headline */}
        <h2
          className="font-cormorant text-5xl md:text-6xl font-light mb-6"
          style={{ color: 'var(--color-navy)' }}
        >
          The Acquisition Intelligence Layer.
        </h2>

        {/* Subheadline */}
        <p
          className="font-cormorant text-2xl md:text-3xl font-light mb-8"
          style={{ color: 'var(--color-navy)' }}
        >
          A full-suite bolt-on for operators who acquire with intention, not just opportunity.
        </p>

        {/* Small gold caps line */}
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-8"
          style={{ color: 'var(--color-gold)' }}
        >
          Engineered for Roll-Ups and Multiple Acquisition Thesis
        </p>

        {/* Full-width gold rule */}
        <div className="w-full h-px mb-16" style={{ backgroundColor: 'var(--color-gold)' }} />

        {/* Four-column pipeline stage layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Column 1 */}
          <div className="border-t py-8" style={{ borderColor: 'var(--color-gold)' }}>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Origination
            </p>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              We identify acquisition targets before they surface. Behavioral signal, market timing, and seller readiness data converge into a precision shortlist.
            </p>
          </div>

          {/* Column 2 */}
          <div className="border-t py-8" style={{ borderColor: 'var(--color-gold)' }}>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Institutional Packaging
            </p>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              Capital formation, acquisition financing structure, and investor-ready documentation built to meet institutional standards from day one.
            </p>
          </div>

          {/* Column 3 */}
          <div className="border-t py-8" style={{ borderColor: 'var(--color-gold)' }}>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              LOI Contact and Liaison
            </p>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              We manage the approach. Seller communication, term facilitation, and relationship continuity from first contact through signed letter of intent.
            </p>
          </div>

          {/* Column 4 */}
          <div className="border-t py-8" style={{ borderColor: 'var(--color-gold)' }}>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Post-Integration Optimization
            </p>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              Native technology integration, operational continuity, and capital formation. Talent & asset sourcing.
            </p>
          </div>
        </div>

        {/* Centered italic line */}
        <p
          className="font-baskerville text-lg italic mb-16"
          style={{ color: 'var(--color-navy)' }}
        >
          An Acquisition Pipeline Designed To Compound. Not Just To Close.
        </p>

        {/* Two tool cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl mx-auto">
          {/* Card 1 */}
          <div
            className="border p-8 transition-all duration-300 hover:border-2"
            style={{ borderColor: 'var(--color-gold)' }}
          >
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Growth Diagnostic
            </p>
            <p
              className="font-baskerville text-sm"
              style={{ color: 'var(--color-navy)' }}
            >
              Map your acquisition readiness across capital structure, pipeline signal, and integration capacity.
            </p>
          </div>

          {/* Card 2 */}
          <a
            href="https://ecliptica-ops.com/acquisition-simulator"
            target="_blank"
            rel="noopener noreferrer"
            className="border p-8 transition-all duration-300 hover:border-2 cursor-pointer block"
            style={{ borderColor: 'var(--color-gold)' }}
          >
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Acquisition Simulator
            </p>
            <p
              className="font-baskerville text-sm"
              style={{ color: 'var(--color-navy)' }}
            >
              Model target scenarios, financing structures, and post-close outcomes before you move.
            </p>
          </a>
        </div>

        {/* CTA Button */}
        <a
          id="ma-conversation"
          href="mailto:sales@ecliptica-ops.com?subject=Demo%20Request%20via%20Ecliptica.com"
          className="inline-block px-12 py-4 border font-montserrat text-xs tracking-[0.25em] uppercase transition-all duration-300 hover:opacity-80 mb-16"
          style={{
            backgroundColor: 'var(--color-navy)',
            color: 'var(--color-ivory)',
            borderColor: 'var(--color-gold)'
          }}
        >
          Start a Conversation
        </a>

        {/* Closing gold rule */}
        <div className="w-full h-px" style={{ backgroundColor: 'var(--color-gold)' }} />
      </div>
    </section>
  );
}
