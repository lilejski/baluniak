"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Layers, Brain, Wallet, Cloud } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
  const { dict, lang } = useLanguage();
  const blocks = dict.modularStack.blocks;

  return (
    <section
      ref={sectionRef}
      id="modular-stack"
      className="relative my-24 border-t border-zinc-800 bg-black/20 px-5 py-16 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 md:py-24 md:pb-24"
      aria-labelledby="modular-stack-heading"
    >
      <div className="mx-auto max-w-5xl">
        <motion.header
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <h2
            id="modular-stack-heading"
            className="mb-3 text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl"
          >
            {dict.modularStack.heading}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400 md:text-base">
            {dict.modularStack.subtext}
          </p>
        </motion.header>

        <motion.div
          className="relative grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
            <span className="absolute left-[25%] top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/60" />
            <span className="absolute left-[50%] top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/60" />
            <span className="absolute left-[75%] top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/60" />
            <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          </div>

          {blocks.map((block, i) => {
            const Icon = BLOCK_ICONS[i];
            return (
              <motion.div
                key={`stack-${i}`}
                variants={blockVariants}
                className="group relative z-10"
              >
                <div
                  className={cn(
                    "relative flex flex-col rounded-xl border border-zinc-700/80 bg-zinc-900/90 p-5 shadow-lg transition-all duration-300",
                    "hover:-translate-y-2 hover:border-emerald-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(16,185,129,0.08)]",
                    "md:p-6"
                  )}
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/50 text-emerald-500 transition-colors group-hover:bg-emerald-500/10">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <p className="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-emerald-400/90 md:text-xs">
                    {block.subtitle}
                  </p>
                  <h3 className="mb-1 text-base font-semibold text-zinc-100 md:text-lg">
                    {block.title}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400 md:text-sm">
                    {block.tech}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-zinc-500 md:text-xs">
                    {block.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile: vertical connector dots between row 1 and row 2 */}
        <div className="mt-4 flex justify-center gap-8 md:hidden" aria-hidden>
          <span className="size-1.5 rounded-full bg-emerald-500/50" />
          <span className="size-1.5 rounded-full bg-emerald-500/50" />
        </div>
      </div>
    </section>
  );
}
