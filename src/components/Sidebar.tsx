import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import DemoRequestModal from './DemoRequestModal';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const toggleAccordion = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleDemoClick = () => {
    setIsOpen(false);
    setIsDemoModalOpen(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 w-7 h-20 flex items-center justify-center border-r-2 transition-transform"
        style={{
          backgroundColor: 'var(--color-navy)',
          borderColor: 'var(--color-gold)',
        }}
      >
        {isOpen ? (
          <ChevronLeft size={16} color="var(--color-gold)" />
        ) : (
          <ChevronRight size={16} color="var(--color-gold)" />
        )}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-60 z-40 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-navy)' }}
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col items-center mb-8">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img
                src="/iconic-sidebar.png"
                alt="Ecliptica"
                className="w-auto h-16 cursor-pointer transition-opacity hover:opacity-80"
              />
            </Link>
          </div>

          <nav className="flex-1">
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => toggleAccordion('ecliptica')}
                  className="w-full text-left font-cormorant small-caps text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Ecliptica
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: activeSection === 'ecliptica' ? '200px' : '0',
                  }}
                >
                  <div className="mt-3 ml-4 space-y-2">
                    <a
                      href="/#sales-systems"
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2"
                      style={{
                        color: 'var(--color-gold)',
                        letterSpacing: '0.15em',
                        fontSize: '11px'
                      }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                    >
                      The Sales Systems
                    </a>
                    <a
                      href="/#ai-sales-systems"
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2"
                      style={{
                        color: 'var(--color-gold)',
                        letterSpacing: '0.15em',
                        fontSize: '11px'
                      }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                    >
                      The Intelligence Systems
                    </a>
                    <button
                      onClick={handleDemoClick}
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2 text-left w-full"
                      style={{
                        color: 'var(--color-gold)',
                        letterSpacing: '0.15em',
                        fontSize: '11px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      Request Live Demo
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleAccordion('ma')}
                  className="w-full text-left font-cormorant small-caps text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  M&A
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: activeSection === 'ma' ? '200px' : '0',
                  }}
                >
                  <div className="mt-3 ml-4 space-y-2">
                    <a
                      href="/#ma"
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2"
                      style={{ color: '#C9A84C' }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.8)';
                        e.currentTarget.style.filter = 'brightness(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      Full Suite
                    </a>
                    <a
                      href="/#ma-conversation"
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2"
                      style={{ color: '#C9A84C' }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.8)';
                        e.currentTarget.style.filter = 'brightness(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      Start a Conversation
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleAccordion('about')}
                  className="w-full text-left font-cormorant small-caps text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  About
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: activeSection === 'about' ? '200px' : '0',
                  }}
                >
                  <div className="mt-3 ml-4 space-y-2">
                    <a
                      href="/#faqs"
                      className="block font-montserrat text-xs tracking-wider uppercase transition-all hover:border-l-2 pl-2"
                      style={{ color: '#C9A84C' }}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.8)';
                        e.currentTarget.style.filter = 'brightness(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      FAQs
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <Link
                  to="/newsletter"
                  className="block w-full text-left font-cormorant small-caps text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                  onClick={() => setIsOpen(false)}
                >
                  Newsletter
                </Link>
              </div>

              <div className="border-t border-opacity-20 pt-6" style={{ borderColor: 'var(--color-gold)' }}>
                <Link
                  to="/login"
                  className="block font-cormorant small-caps text-lg transition-colors"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Login
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <DemoRequestModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        sourcePage={window.location.pathname}
        sourceSection="sidebar"
      />
    </>
  );
}
