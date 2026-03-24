import { Link } from 'react-router-dom';

export default function Footer() {
  const navLinks = [
    { label: 'M&A', href: '#ma' },
    { label: 'About', href: '#' },
    { label: 'Members', href: '#' },
    { label: 'Login', href: '/login' },
  ];

  return (
    <footer
      className="py-16 px-6 md:px-20"
      style={{ backgroundColor: '#0F1628' }}
    >
      <div
        className="h-px w-full mb-16"
        style={{ backgroundColor: 'var(--color-gold)' }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col items-start">
          <img
            src="/reversed_logo_color.png"
            alt="Ecliptica"
            className="h-32 mb-3"
          />
          <p
            className="font-cormorant italic text-sm"
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            Engineered to Hunt. Built to Scale.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          {navLinks.map((link, index) =>
            link.href.startsWith('/') ? (
              <Link
                key={index}
                to={link.href}
                className="font-montserrat text-xs uppercase transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={index}
                href={link.href}
                className="font-montserrat text-xs uppercase transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="flex items-start md:justify-end">
          <p
            className="font-montserrat text-xs"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            &copy; 2025 Ecliptica LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
