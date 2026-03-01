import AIDuelLayout from "@/components/AIDuelLayout";
import { TryLiveIntro } from "@/components/TryLiveIntro";
import { About } from "@/components/sections/About";
import { WhyProductEngineer } from "@/components/sections/WhyProductEngineer";
import { HeroSection } from "@/components/sections/HeroSection";
import { KreatorCTA } from "@/components/sections/KreatorCTA";
import { OnboardingSteps } from "@/components/sections/OnboardingSteps";
import { Projects } from "@/components/sections/Projects";
import { TechStackTrust } from "@/components/sections/TechStackTrust";
import { ModularStack } from "@/components/sections/ModularStack";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TechStackTrust />
      <KreatorCTA />
      <OnboardingSteps />
      <section
        id="ai-duel"
        className="scroll-mt-20 pb-[max(2rem,env(safe-area-inset-bottom))] md:pb-0"
        aria-label="AI Duel – try live"
      >
        <TryLiveIntro />
        <AIDuelLayout />
      </section>
      <ModularStack />
      <Projects />
      <WhyProductEngineer />
      <About />
      <ContactSection />
    </>
  );
}
