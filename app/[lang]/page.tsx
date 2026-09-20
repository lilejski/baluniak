import { About } from "@/components/sections/About";
import { WhyProductEngineer } from "@/components/sections/WhyProductEngineer";
import { HeroSection } from "@/components/sections/HeroSection";
import { Projects } from "@/components/sections/Projects";
import { TechStackTrust } from "@/components/sections/TechStackTrust";
import { ModularStack } from "@/components/sections/ModularStack";
import { ContactSection } from "@/components/sections/ContactSection";
import { JsonLd } from "@/components/JsonLd";
import { personJsonLd } from "@/lib/structured-data";
import { isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <>
      <JsonLd data={personJsonLd(isLocale(lang) ? lang : "pl")} />
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
