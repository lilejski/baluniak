import AIDuelLayout from "@/components/AIDuelLayout";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";

export default function Home() {
  return (
    <>
      <AIDuelLayout />
      <TechStack />
      <Projects />
      <About />
    </>
  );
}
