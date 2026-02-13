import AIDuelLayout from "@/components/AIDuelLayout";
import { About } from "@/components/sections/About";
import { HeroSection } from "@/components/sections/HeroSection";
import { OnboardingSteps } from "@/components/sections/OnboardingSteps";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { ModularStack } from "@/components/sections/ModularStack";

/** Teksty (copywriting) – sekcja nad czatem, edytuj tutaj */
const INTRO_COPY = {
  title: "Wypróbuj na żywo",
  paragraph:
    "Zadaj pytanie poniżej—DEV odpowie technicznie, BIZ biznesowo. Porównaj obie perspektywy w jednym miejscu.",
} as const;

export default function Home() {
  return (
    <>
      <HeroSection />
      <OnboardingSteps />
      <section id="ai-duel" className="scroll-mt-20" aria-label="AI Duel – wypróbuj">
        {/* Sekcja wprowadzająca nad kontenerem czatu */}
        <div className="relative z-10 mx-auto max-w-2xl px-5 pt-8 pb-4 text-center sm:px-6 sm:pt-12 sm:pb-6">
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            {INTRO_COPY.title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            {INTRO_COPY.paragraph}
          </p>
        </div>
        <AIDuelLayout />
      </section>
      <TechStack />
      <ModularStack />
      <Projects />
      <About />
    </>
  );
}
