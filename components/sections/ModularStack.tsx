"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Layers, Brain, Wallet, Cloud } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLanguage } from "@/contexts/LanguageContext";

const BLOCK_ICONS = [Layers, Brain, Wallet, Cloud] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const blockVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
};

export function ModularStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const { dict } = useLanguage();
  const blocks = dict.modularStack.blocks;

  return (
    <section
      ref={sectionRef}
      id="modular-stack"
      className="relative border-t border-border bg-bg section-y pb-[max(4rem,env(safe-area-inset-bottom))]"
      aria-labelledby="modular-stack-heading"
    >
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
        >
          <SectionHeading
            id="modular-stack-heading"
            title={dict.modularStack.heading}
            lead={dict.modularStack.subtext}
          />
        </motion.div>

        <motion.div
          className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Connector between the four steps — desktop row only */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
            <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px -translate-y-1/2 bg-border-strong" />
            <span className="absolute left-[25%] top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            <span className="absolute left-[50%] top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            <span className="absolute left-[75%] top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
          </div>

          {blocks.map((block, i) => {
            const Icon = BLOCK_ICONS[i];
            return (
              <motion.div
                key={`stack-${i}`}
                variants={blockVariants}
                className="relative z-10"
              >
                <div className="card flex h-full flex-col p-5 md:p-6">
                  <Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} aria-hidden />
                  <p className="eyebrow">{block.subtitle}</p>
                  <h3 className="text-h4 mt-1.5">{block.title}</h3>
                  <p className="mt-2 text-[0.9375rem] font-medium text-fg">{block.tech}</p>
                  <p className="mt-1.5 text-base leading-relaxed text-fg-muted">{block.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
