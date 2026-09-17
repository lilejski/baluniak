"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroCube = dynamic(
  () => import("@/components/HeroCube").then((m) => ({ default: m.HeroCube })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center border-none bg-transparent"
        aria-hidden
      >
        <div className="h-24 w-24 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    ),
  }
);

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export function HeroSection() {
  const { dict, localeSegment } = useLanguage();
  const h = dict.hero;

  return (
    <motion.section
      id="hero"
      className="relative z-0 w-full overflow-hidden bg-bg pb-16 pt-10 sm:pt-14 md:pb-24 lg:pt-16"
      aria-labelledby="hero-heading"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      {/* The only grid on the site: barely there, fading out towards the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(237,239,236,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(237,239,236,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 30%, transparent 80%)",
        }}
      />

      {/* Desktop: cube left, text right. Mobile: text and CTAs first, the cube below them. */}
      <div className="container-page relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
        <motion.div
          className="relative order-2 flex h-[34vh] max-h-[320px] min-h-[220px] w-full items-center justify-center bg-transparent lg:order-1 lg:h-[600px] lg:max-h-none"
          style={{ background: "transparent" }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Soft brand-green glow under the cube */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at center, rgba(61,203,139,0.16) 0%, rgba(30,140,122,0.07) 35%, transparent 60%)",
            }}
          />
          <motion.div
            variants={itemVariants}
            className="relative z-0 h-full w-full cursor-grab border-none bg-transparent active:cursor-grabbing"
            style={{ background: "transparent" }}
          >
            <HeroCube />
          </motion.div>
        </motion.div>

        <motion.div
          className="order-1 flex flex-col items-start text-left lg:order-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={itemVariants}
            className="mb-5 text-sm font-medium leading-relaxed text-fg-muted"
          >
            {h.badge}
          </motion.p>

          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="text-h1 text-fg"
          >
            {h.headline}
            {h.headlineAccent ? (
              <>
                {" "}
                <span className="text-accent">{h.headlineAccent}</span>
                {h.headlineEnd}
              </>
            ) : null}
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lead mt-5">
            {h.subtext}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex w-full flex-col gap-3 min-[480px]:w-auto min-[480px]:flex-row"
          >
            <Button asChild size="lg" className="w-full min-[480px]:w-auto">
              <Link href={`/${localeSegment}/kreator`}>{h.ctaPrimary}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="w-full min-[480px]:w-auto">
              <Link href={`/${localeSegment}#projekty`}>
                {h.ctaSecondary}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
