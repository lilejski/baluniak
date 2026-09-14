import { About } from "@/components/sections/About";
import { WhyProductEngineer } from "@/components/sections/WhyProductEngineer";
import { HeroSection } from "@/components/sections/HeroSection";
import { Projects } from "@/components/sections/Projects";
import { TechStackTrust } from "@/components/sections/TechStackTrust";
import { ModularStack } from "@/components/sections/ModularStack";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TechStackTrust />
      <ModularStack />
      <Projects />
      <WhyProductEngineer />
      <About />
      <ContactSection />
    </>
  );
}
