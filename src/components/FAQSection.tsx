import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  { question: 'Who is Ecliptica built for?', answer: 'Founders, operators, and capital groups running businesses between $5M and $500M+ who have outgrown their current growth infrastructure. Also institutional teams that need a proprietary intelligence layer without building one internally.' },
  { question: 'What makes your pipeline data proprietary?', answer: 'Seventeen years of behavioral and transactional signal across real deal cycles, seller psychology, and capital market timing. It is not a data vendor feed. It is a pattern architecture built from direct origination experience.' },
  { question: 'How is this different from a CRM or sales platform?', answer: 'Those tools record what already happened. Ours predicts what is about to happen. The distinction is not a feature. It is the entire design premise.' },
  { question: 'Are you a software company?', answer: 'No. The intelligence is proprietary and the infrastructure is AI-powered, but what you engage is a system with human execution behind it. You are not buying a tool. You are deploying an operating layer.' },
  { question: 'What does engagement actually look like?', answer: 'It begins with a scoped diagnostic, typically 30 to 60 days, that maps where your pipeline, acquisition readiness, or growth architecture has friction. Execution follows immediately. There is no report without a next step.' },
  { question: 'Can we use Ecliptica alongside our existing team or tech stack?', answer: 'Yes. Ecliptica is designed as a bolt-on layer, not a replacement. It integrates into existing workflows and amplifies what is already working while replacing what is not.' },
  { question: 'How does the M&A service connect to the sales infrastructure?', answer: 'They run on the same signal layer. Acquisition targets are identified using the same behavioral timing data that drives pipeline origination. The intelligence is unified, not siloed by service line.' },
  { question: 'We already have an investment banker. Why do we need this?', answer: 'Bankers execute transactions. We identify when, why, and who before the transaction begins. Origination intelligence and institutional packaging are upstream of what a banker does. We are not a substitute. We are the infrastructure that makes their work more precise.' },
  { question: 'What is the right time to engage?', answer: 'If your pipeline has become unpredictable, your acquisition thesis is defined but unexecuted, or your growth infrastructure was built for a business half the size of where you are now, the timing is right.' },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const leftColumnFAQs = faqs.filter((_, index) => index % 2 === 0);
  const rightColumnFAQs = faqs.filter((_, index) => index % 2 !== 0);

  return (
    <section id="faqs" className="py-20 px-6 flex items-center justify-center" style={{ backgroundColor: 'var(--color-navy)' }}>
      <div className="max-w-6xl w-full fade-in">
        <p className="font-montserrat text-xs tracking-[0.35em] uppercase mb-6 text-center" style={{ color: 'var(--color-gold)' }}>Common Questions</p>
        <h2 className="font-cormorant text-5xl md:text-6xl font-light mb-16 text-center" style={{ color: 'var(--color-ivory)' }}>What serious operators ask before they engage.</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div>
            {leftColumnFAQs.map((faq, index) => {
              const actualIndex = index * 2;
              const isOpen = openIndex === actualIndex;
              return (
                <div key={actualIndex}>
                  <button onClick={() => toggleFAQ(actualIndex)} className="w-full text-left py-6 flex items-start justify-between transition-colors group">
                    <span className="font-montserrat text-sm tracking-wide pr-4" style={{ color: 'var(--color-ivory)' }}>{faq.question}</span>
                    <ChevronDown size={20} style={{ color: 'var(--color-gold)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? '300px' : '0' }}>
                    <p className="font-baskerville text-sm leading-relaxed pb-6" style={{ color: 'var(--color-ivory)' }}>{faq.answer}</p>
                  </div>
                  <div className="h-px w-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                </div>
              );
            })}
          </div>
          <div>
            {rightColumnFAQs.map((faq, index) => {
              const actualIndex = index * 2 + 1;
              const isOpen = openIndex === actualIndex;
              return (
                <div key={actualIndex}>
                  <button onClick={() => toggleFAQ(actualIndex)} className="w-full text-left py-6 flex items-start justify-between transition-colors group">
                    <span className="font-montserrat text-sm tracking-wide pr-4" style={{ color: 'var(--color-ivory)' }}>{faq.question}</span>
                    <ChevronDown size={20} style={{ color: 'var(--color-gold)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? '300px' : '0' }}>
                    <p className="font-baskerville text-sm leading-relaxed pb-6" style={{ color: 'var(--color-ivory)' }}>{faq.answer}</p>
                  </div>
                  <div className="h-px w-full" style={{ backgroundColor: 'var(--color-gold)' }} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative w-full h-px" style={{ backgroundColor: 'var(--color-gold)' }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: 'var(--color-gold)' }} />
        </div>
      </div>
    </section>
  );
}
