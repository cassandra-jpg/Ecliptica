import { useState } from 'react';
import DemoRequestModal from './DemoRequestModal';

export default function HeroSection() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-ivory)' }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse
          cx="600"
          cy="400"
          rx="300"
          ry="180"
          fill="none"
          stroke="#E8E4F0"
          strokeWidth="1"
          opacity="0.4"
        />
        <ellipse
          cx="600"
          cy="400"
          rx="420"
          ry="250"
          fill="none"
          stroke="#E8E4F0"
          strokeWidth="1"
          opacity="0.4"
        />
        <ellipse
          cx="600"
          cy="400"
          rx="540"
          ry="320"
          fill="none"
          stroke="#E8E4F0"
          strokeWidth="1"
          opacity="0.4"
        />

        <circle cx="750" cy="320" r="12" fill="#C5B8D8" opacity="0.3" />
        <circle cx="450" cy="480" r="8" fill="#C5B8D8" opacity="0.3" />
        <circle cx="850" cy="450" r="10" fill="#C5B8D8" opacity="0.3" />
        <circle cx="350" cy="350" r="6" fill="#C5B8D8" opacity="0.3" />
        <circle cx="680" cy="280" r="7" fill="#C5B8D8" opacity="0.3" />
        <circle cx="520" cy="520" r="9" fill="#C5B8D8" opacity="0.3" />
      </svg>

      <div className="relative z-10 text-center px-6 max-w-5xl fade-in">
        <img
          src="/PRIMARY_LOGO.png"
          alt="Ecliptica"
          className="w-[460px] h-auto mx-auto mb-6"
        />

        <p
          className="font-montserrat text-xs tracking-[0.4em] uppercase mb-14"
          style={{ color: 'var(--color-gold)' }}
        >
          AI Sales & Intelligence Systems
        </p>

        <h2
          className="font-cormorant text-5xl md:text-6xl lg:text-7xl font-light mb-7 max-w-4xl mx-auto"
          style={{ color: 'var(--color-text-dark)', lineHeight: '1.05' }}
        >
          Engineered to Hunt. Built to Scale.
        </h2>

        <p
          className="font-montserrat text-xs tracking-[0.2em] uppercase mb-10 max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Custom-built pipeline systems, powered by 17 years of proprietary signal
        </p>

        <button
          onClick={() => setIsDemoModalOpen(true)}
          className="inline-block font-montserrat text-xs tracking-[0.25em] uppercase px-12 py-5 transition-all duration-300 hover:shadow-lg"
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
        </button>
      </div>

      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        sourcePage={window.location.pathname}
        sourceSection="hero"
      />
    </section>
  );
}
