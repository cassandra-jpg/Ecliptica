import HeroSection from '../components/HeroSection';
import ArchitectureShiftSection from '../components/ArchitectureShiftSection';
import AISalesSection from '../components/AISalesSection';
import EngineeredIntelligenceSection from '../components/EngineeredIntelligenceSection';
import MASection from '../components/MASection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function HomePage() {
  useScrollAnimation();

  return (
    <>
      <HeroSection />
      <ArchitectureShiftSection />
      <AISalesSection />
      <EngineeredIntelligenceSection />
      <MASection />
      <FAQSection />
      <CTASection />
      <Footer />
    </>
  );
}
