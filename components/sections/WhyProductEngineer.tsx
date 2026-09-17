"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, LayoutDashboard, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLanguage } from "@/contexts/LanguageContext";

/** Website, custom software, automation — in the order of the cards. */
const CARD_ICONS = [Globe, LayoutDashboard, Workflow] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
      className="relative border-t border-border bg-bg section-y"
      aria-labelledby="why-pe-heading"
    >
      <div className="container-page">
        <SectionHeading id="why-pe-heading" title={section.title} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <motion.article
                key={card.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="card flex flex-col p-5 md:p-7"
              >
                <Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} aria-hidden />
                <h3 className="text-h4">{card.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-fg-muted">
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
