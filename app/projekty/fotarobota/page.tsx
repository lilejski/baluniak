"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, Camera, Zap, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export default function FotarobotaCaseStudyPage() {
  const problemRef = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const problemInView = useInView(problemRef, { once: true, amount: 0.15 });
  const solutionInView = useInView(solutionRef, { once: true, amount: 0.15 });
  const techInView = useInView(techRef, { once: true, amount: 0.15 });
  const resultsInView = useInView(resultsRef, { once: true, amount: 0.15 });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Back to Projects */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
            <Link href="/projekty" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Powrót do projektów
            </Link>
          </Button>
        </motion.div>

        {/* HERO */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-100 text-balance sm:text-4xl md:text-5xl">
            Fotarobota: AI-Powered Photo Transformation
          </h1>
          <p className="mb-2 text-lg text-zinc-400 text-balance sm:text-xl">
            Od pomysłu do działającego SaaS w 2 tygodnie.
          </p>
          <p className="text-sm text-zinc-500">
            Rewolucja w branży zdjęć produktowych: profesjonalne portrety w kilka sekund zamiast wielogodzinnych sesji.
          </p>

          {/* 16:9 Video Demo placeholder */}
          <div
            className="mt-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
            style={{ aspectRatio: "16/9" }}
          >
            <div className="flex h-full w-full items-center justify-center bg-zinc-900">
              <div className="text-center">
                <Camera className="mx-auto size-14 text-zinc-600" aria-hidden />
                <p className="mt-3 text-sm font-medium text-zinc-500">Demo wideo (placeholder)</p>
                <p className="mt-1 text-xs text-zinc-600">Wstaw tutaj embed lub link do wideo</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* WYZWANIE (The Problem) */}
        <motion.section
          ref={problemRef}
          initial="hidden"
          animate={problemInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="wyzwanie-heading"
        >
          <motion.h2
            id="wyzwanie-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Wyzwanie
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm"
            >
              <p className="text-sm leading-relaxed text-zinc-400">
                Tradycyjne sesje zdjęciowe są drogie, czasochłonne i logistycznie trudne. Koszty wynajmu studia, ekipy i retuszu sięgają tysięcy złotych, a czas realizacji — tygodni.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm"
            >
              <p className="text-sm leading-relaxed text-zinc-400">
                Dla małych firm i e-commerce oznacza to barierę wejścia: brak profesjonalnych zdjęć produktowych obniża konwersję i wiarygodność marki.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ARCHITEKTURA AI (The AI Solution) */}
        <motion.section
          ref={solutionRef}
          initial="hidden"
          animate={solutionInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="architektura-heading"
        >
          <motion.h2
            id="architektura-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Architektura AI
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6 backdrop-blur-sm sm:p-8"
          >
            <p className="mb-4 text-sm leading-relaxed text-zinc-300">
              Wykorzystanie zaawansowanych modeli dyfuzyjnych (Fal.ai) do generowania profesjonalnych portretów w kilka sekund. Użytkownik wgrywa zdjęcie produktu, wybiera styl tła i oświetlenia — system zwraca gotowy zestaw wizerunków bez studia i ekipy.
            </p>
            <p className="text-sm font-medium text-emerald-400">
              Efekt „magii”: od surowego zdjęcia do kampanii reklamowej w czasie jednej kawy.
            </p>
          </motion.div>
        </motion.section>

        {/* TECH STACK */}
        <motion.section
          ref={techRef}
          initial="hidden"
          animate={techInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="tech-heading"
        >
          <motion.h2
            id="tech-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Silnik technologiczny
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Frontend", value: "Next.js", icon: Zap },
              { label: "AI Processing", value: "Fal.ai", icon: Camera },
              { label: "Płatności", value: "Autopay", icon: CreditCard },
              { label: "Skalowalność", value: "Serverless", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.value}
                  variants={itemVariants}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm"
                >
                  <Icon className="size-6 text-emerald-500/90" aria-hidden />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-100">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* EFEKTY BIZNESOWE (Business Results) */}
        <motion.section
          ref={resultsRef}
          initial="hidden"
          animate={resultsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-16"
          aria-labelledby="efekty-heading"
        >
          <motion.h2
            id="efekty-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Efekty biznesowe
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-sm sm:p-8"
          >
            <ul className="space-y-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span><strong className="text-zinc-100">MVP dowiezione w 14 dni.</strong> Pełny cykl od briefu do działającej aplikacji.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>W pełni funkcjonalny system płatności i automatyzacja procesów.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>Redukcja kosztów produkcji zdjęć produktowych o <strong className="text-emerald-400">90%</strong> w porównaniu z tradycyjną sesją.</span>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 border-t border-zinc-800 pt-12 text-center"
        >
          <p className="text-sm text-zinc-500">Zobacz produkt na żywo</p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500">
            <a href="https://www.fotarobota.pl" target="_blank" rel="noopener noreferrer">
              fotarobota.pl
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
