"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Camera, CheckCircle2, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type Category = "food" | "ecommerce";

const AFTER_SHOTS: Record<Category, string[]> = {
  ecommerce: [
    "/fotarobota/product-after1.webp",
    "/fotarobota/product-after2.webp",
    "/fotarobota/product-after3.webp",
    "/fotarobota/product-after4.webp",
  ],
  food: [
    "/fotarobota/food-after1.webp",
    "/fotarobota/food-after2.webp",
    "/fotarobota/food-after3.webp",
    "/fotarobota/food-after4.webp",
  ],
};

const BEFORE_SHOT: Record<Category, string> = {
  ecommerce: "/fotarobota/product-before.webp",
  food: "/fotarobota/food-before.webp",
};

const ROTATE_MS = 3200;

/**
 * Recreates the before/after module from the live Fotarobota landing page.
 * Every asset is static, so the showcase keeps working now that the product
 * itself is archived.
 */
export function BeforeAfterShowcase() {
  const { dict } = useLanguage();
  const f = dict.fotarobotaPage;

  const [category, setCategory] = useState<Category>("ecommerce");
  const [afterIndex, setAfterIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const shots = AFTER_SHOTS[category];

  // Auto-rotate, unless the visitor took over or asked for reduced motion.
  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setAfterIndex((i) => (i + 1) % shots.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, shots.length]);

  const selectCategory = useCallback((next: Category) => {
    setCategory(next);
    setAfterIndex(0);
  }, []);

  const selectVariant = useCallback((index: number) => {
    setAfterIndex(index);
    setPaused(true);
  }, []);

  const tabs: { id: Category; label: string }[] = [
    { id: "food", label: f.demoTabFood },
    { id: "ecommerce", label: f.demoTabEcom },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label={f.demoTitle}
        className="mb-6 inline-flex gap-1 rounded-xl border border-white/10 bg-black/40 p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={category === tab.id}
            onClick={() => selectCategory(tab.id)}
            className={cn(
              "rounded-lg px-5 py-2 text-sm font-semibold tracking-wide transition-colors",
              category === tab.id
                ? "bg-amber-500/90 text-zinc-950 shadow-lg shadow-amber-500/20"
                : "text-zinc-400 hover:text-zinc-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-5">
        {/* Before */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-white/15 bg-black/40 shadow-xl md:w-2/5">
          <div className="relative h-56 w-full md:h-80">
            <Image
              src={BEFORE_SHOT[category]}
              alt={f.demoBeforeLabel}
              fill
              className="object-cover opacity-90"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          </div>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-200 backdrop-blur-md">
            <Camera className="size-3" aria-hidden />
            {f.demoBeforeLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-300">
              <X className="size-3 shrink-0" aria-hidden />
              {category === "food" ? f.demoBeforeCaptionFood : f.demoBeforeCaptionEcom}
            </p>
          </div>
        </div>

        {/* After */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/70 bg-black/40 shadow-xl ring-1 ring-amber-500/20 md:flex-1">
          <div className="relative h-56 w-full md:h-80">
            {shots.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`${f.demoAfterLabel} ${i + 1}`}
                fill
                priority={i === 0}
                className={cn(
                  "object-cover transition-opacity duration-700",
                  i === afterIndex ? "opacity-100" : "opacity-0"
                )}
                sizes="(max-width: 768px) 100vw, 520px"
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-lg backdrop-blur-md">
            <Sparkles className="size-3" aria-hidden />
            {f.demoAfterLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 to-transparent p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="size-3 shrink-0" aria-hidden />
              {f.demoAfterCaption}
            </p>
          </div>
          <div className="absolute bottom-9 right-3 z-10 flex gap-1.5">
            {shots.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => selectVariant(i)}
                aria-label={`${f.demoVariantAria} ${i + 1}`}
                aria-current={i === afterIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === afterIndex ? "w-4 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-zinc-500">{f.demoNote}</p>
    </div>
  );
}
