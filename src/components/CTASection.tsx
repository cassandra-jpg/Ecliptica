export default function CTASection() {
  return (
    <section
      id="demo"
      className="min-h-[60vh] py-20 px-6 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1B2340 0%, #2D1B5C 100%)',
      }}
    >
      <div className="max-w-4xl w-full text-center fade-in">
        <h2
          className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-light mb-8"
          style={{ color: 'var(--color-white)' }}
        >
          Most Companies Optimize Pipelines. We Obsolete Them.
        </h2>

        <a
          href="mailto:sales@ecliptica-ops.com?subject=Demo%20Request%20via%20Ecliptica.com"
          className="inline-block font-montserrat text-xs tracking-[0.25em] uppercase px-12 py-5 transition-all duration-300 hover:shadow-lg mb-4"
          style={{
            backgroundColor: 'var(--color-button-muted)',
            color: 'var(--color-white)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-button-muted)';
          }}
        >
          Request Live Demo
        </a>

        <p
          className="font-montserrat text-xs tracking-[0.2em] uppercase mt-4"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          Custom AI Sales & Intelligence Systems. Built To Scale.
        </p>
      </div>
    </section>
  );
}
