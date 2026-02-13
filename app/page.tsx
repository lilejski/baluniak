import AIDuelLayout from "@/components/AIDuelLayout";
import { TryLiveIntro } from "@/components/TryLiveIntro";
import { About } from "@/components/sections/About";
import { HeroSection } from "@/components/sections/HeroSection";
import { OnboardingSteps } from "@/components/sections/OnboardingSteps";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { ModularStack } from "@/components/sections/ModularStack";

export default function Home() {
  return (
    <>
      <HeroSection />
      <OnboardingSteps />
      <section id="ai-duel" className="scroll-mt-20" aria-label="AI Duel – try live">
        <TryLiveIntro />
        <AIDuelLayout />
      </section>
      <TechStack />
      <ModularStack />
      <Projects />
      <About />
    </>
  );
}
