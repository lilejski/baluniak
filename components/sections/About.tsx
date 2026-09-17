"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { BarChart3, Cpu, Activity, Layout, Database, Brain, ExternalLink, Award, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechLine } from "@/components/ui/tech-line";
import { useLanguage } from "@/contexts/LanguageContext";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const CERT_URL =
  "https://cdn.umiejetnoscijutra.pl/certificates/f60d74f1-5530-481d-8cc0-b1e5d661cf11";

const TOOLS = [
  { icon: Layout, label: "Next.js" },
  { icon: Cpu, label: "OpenAI" },
  { icon: Database, label: "Supabase" },
  { icon: Activity, label: "Vercel" },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { dict, localeSegment } = useLanguage();
  const stages = dict.about.stages;
  // Map each stage id to a Lucide icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconMap: Record<string, React.ComponentType<any>> = {
    fullstack: BarChart3,
    ai: Cpu,
    ux: Brain,
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative border-t border-border bg-bg section-y pb-[max(4rem,env(safe-area-inset-bottom))]"
      aria-labelledby="bridge-heading"
    >
      <div className="container-page">
        <SectionHeading id="bridge-heading" title={dict.about.bridgeTitle} />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:gap-10"
        >
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full border border-border-strong bg-surface sm:size-36 md:size-40">
            <Image
              src="/li.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 7rem, (max-width: 768px) 9rem, 10rem"
            />
          </div>
          <div className="min-w-0 max-w-[65ch] flex-1">
            <p className="text-h2 text-fg">BAŁUNIAK ŁUKASZ</p>
            <p className="text-lead mt-3 text-fg">
              {dict.about.headline}
            </p>
            <p className="mt-2 text-base leading-relaxed text-fg-muted">
              {dict.about.subheadline}
            </p>
            <div className="mt-4" aria-label="Expert-level tools">
              <TechLine items={TOOLS.map((tool) => tool.label)} />
            </div>
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stages.map((stage, i) => {
            const Icon = iconMap[stage.id] ?? BarChart3;
            return (
              <motion.div
                key={stage.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="card flex flex-col p-5 md:p-7"
              >
                <Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} aria-hidden />
                <p className="eyebrow">{stage.label}</p>
                <h3 className="text-h4 mt-1.5">{stage.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-fg-muted">
                  {stage.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Proof ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <p className="eyebrow-muted mb-3">
            {dict.about.proofTitle}
          </p>
          <a
            href={CERT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-interactive group flex max-w-md items-center gap-4 p-5"
          >
            <Award className="size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            <div className="min-w-0 flex-1">
              {/* Google wordmark — kept in Google's own colours */}
              <div className="mb-1 flex items-center gap-[2px]">
                <span className="text-sm font-bold tracking-tight" style={{ color: "#4285F4" }}>G</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#EA4335" }}>o</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#FBBC05" }}>o</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#4285F4" }}>g</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#34A853" }}>l</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#EA4335" }}>e</span>
              </div>
              <p className="text-[0.9375rem] font-medium leading-snug text-fg">{dict.about.proofDesc}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm text-accent underline underline-offset-3 transition-colors group-hover:text-accent-hover">
                {dict.about.proofCta}
                <ExternalLink className="size-3.5" aria-hidden />
              </p>
            </div>
          </a>
        </motion.div>

        {/* The second door: recruiters get their own page instead of this client pitch */}
        <p className="mt-10">
          <Link
            href={`/${localeSegment}/o-mnie`}
            className="group inline-flex min-h-11 items-center gap-2 text-sm text-fg-subtle transition-colors hover:text-fg hover:underline hover:underline-offset-4"
          >
            {dict.about.recruiterCta}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-[2px]" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
