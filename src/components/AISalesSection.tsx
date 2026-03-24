export default function AISalesSection() {
  return (
    <section
      id="ai-sales-systems"
      className="min-h-screen py-20 px-6 flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-ivory)' }}
    >
      <div className="max-w-6xl w-full text-center fade-in">
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--color-gold)' }}
        >
          The Intelligence Systems
        </p>

        <h2
          className="font-cormorant text-5xl md:text-6xl font-light mb-8"
          style={{ color: 'var(--color-navy)' }}
        >
          17 Years of Proprietary Signal.
        </h2>

        <p
          className="font-baskerville text-lg max-w-3xl mx-auto mb-16"
          style={{ color: 'var(--color-navy)', opacity: 0.7 }}
        >
          Behavioral data, psychological timing, and predictive pipeline logic.
        </p>

        {/* Full-width gold rule */}
        <div className="w-full h-px mb-16" style={{ backgroundColor: 'var(--color-gold)' }} />

        {/* Three-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-left">
          {/* Column 1 */}
          <div>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Behavioral Timing
            </p>
            <h3
              className="font-cormorant text-2xl font-bold mb-3"
              style={{ color: 'var(--color-navy)' }}
            >
              We Know Before They Do.
            </h3>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              We identify when a prospect is psychologically ready to transact before they announce intent. The signal precedes the action by weeks.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Pattern Intelligence
            </p>
            <h3
              className="font-cormorant text-2xl font-bold mb-3"
              style={{ color: 'var(--color-navy)' }}
            >
              Architecture, Not Instinct.
            </h3>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              Every contact in your pipeline is scored against 17 years of behavioral data. Not recency bias. Not guesswork.
            </p>
          </div>

          {/* Column 3 */}
          <div>
            <p
              className="font-montserrat text-xs tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-gold)' }}
            >
              Predictive Sequencing
            </p>
            <h3
              className="font-cormorant text-2xl font-bold mb-3"
              style={{ color: 'var(--color-navy)' }}
            >
              Timing Is the Product.
            </h3>
            <p
              className="font-baskerville text-sm leading-relaxed"
              style={{ color: 'var(--color-navy)' }}
            >
              The right message delivered to the right decision-maker at the precise moment it will land.
            </p>
          </div>
        </div>

        {/* Centered italic text */}
        <p
          className="font-baskerville text-lg italic mb-16 mt-8"
          style={{ color: 'var(--color-navy)' }}
        >
          Most systems chase leads. Ours reads the conditions that create them.
        </p>

        {/* BY THE NUMBERS section */}
        <p
          className="font-montserrat text-xs tracking-[0.35em] uppercase mb-8"
          style={{ color: 'var(--color-gold)' }}
        >
          By the Numbers
        </p>

        <div className="flex items-center justify-center gap-12 mb-16">
          {/* Stat 1 */}
          <div className="text-center">
            <p
              className="font-cormorant text-5xl font-light mb-2"
              style={{ color: 'var(--color-navy)' }}
            >
              17
            </p>
            <p
              className="font-montserrat text-xs tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Years of Signal
            </p>
          </div>

          {/* Divider */}
          <div className="h-16 w-px" style={{ backgroundColor: 'var(--color-gold)' }} />

          {/* Stat 2 */}
          <div className="text-center">
            <p
              className="font-cormorant text-5xl font-light mb-2"
              style={{ color: 'var(--color-navy)' }}
            >
              7
            </p>
            <p
              className="font-montserrat text-xs tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Behavioral Triggers
            </p>
          </div>

          {/* Divider */}
          <div className="h-16 w-px" style={{ backgroundColor: 'var(--color-gold)' }} />

          {/* Stat 3 */}
          <div className="text-center">
            <p
              className="font-cormorant text-5xl font-light mb-2"
              style={{ color: 'var(--color-navy)' }}
            >
              1
            </p>
            <p
              className="font-montserrat text-xs tracking-[0.25em] uppercase"
              style={{ color: 'var(--color-gold)' }}
            >
              Precision Layer
            </p>
          </div>
        </div>

        {/* Section divider with diamond */}
        <div className="relative w-full h-px" style={{ backgroundColor: 'var(--color-gold)' }}>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2"
            style={{ backgroundColor: 'var(--color-gold)' }}
          />
        </div>
      </div>
    </section>
  );
}
