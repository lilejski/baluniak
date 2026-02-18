"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Brain, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CARD_ICONS = [Zap, Brain, Shield] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function WhyProductEngineer() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { dict } = useLanguage();
  const section = dict.whyProductEngineer;
  const cards = section.cards;

  return (
    <section
      ref={sectionRef}
      id="why-product-engineer"
      className="relative border-t border-white/10 bg-zinc-950/50 px-5 py-16 sm:px-6 md:py-20"
      aria-labelledby="why-pe-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="why-pe-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl"
        >
          {section.title}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <motion.article
                key={card.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex flex-col rounded-xl border border-white/10 bg-zinc-900/50 p-6 transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/80"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-zinc-100">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {card.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
