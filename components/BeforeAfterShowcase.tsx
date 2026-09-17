"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
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
        className="mb-6 inline-flex gap-1 rounded-md border border-border bg-surface p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={category === tab.id}
            onClick={() => selectCategory(tab.id)}
            className={cn(
              "min-h-10 rounded-sm px-4 text-sm font-semibold transition-colors",
              category === tab.id
                ? "bg-accent text-accent-ink"
                : "text-fg-muted hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:gap-5">
        {/* Before */}
        <div className="relative overflow-hidden rounded-md border border-border bg-surface md:w-2/5">
          <div className="relative h-56 w-full md:h-80">
            <Image
              src={BEFORE_SHOT[category]}
              alt={f.demoBeforeLabel}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 360px"
            />
          </div>
          <span className="absolute left-3 top-3 inline-flex items-center rounded-sm border border-border bg-bg/85 px-2.5 py-1 text-xs font-semibold text-fg">
            {f.demoBeforeLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-bg/80 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
              <X className="size-3.5 shrink-0" aria-hidden />
              {category === "food" ? f.demoBeforeCaptionFood : f.demoBeforeCaptionEcom}
            </p>
          </div>
        </div>

        {/* After */}
        <div className="relative overflow-hidden rounded-md border border-accent bg-surface md:flex-1">
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
          <span className="absolute right-3 top-3 z-10 inline-flex items-center rounded-sm bg-accent px-2.5 py-1 text-xs font-semibold text-accent-ink">
            {f.demoAfterLabel}
          </span>
          <div className="absolute inset-x-0 bottom-0 z-10 bg-bg/80 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-fg">
              <CheckCircle2 className="size-3.5 shrink-0 text-accent" aria-hidden />
              {f.demoAfterCaption}
            </p>
          </div>
          <div className="absolute bottom-10 right-3 z-10 flex gap-1.5">
            {shots.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => selectVariant(i)}
                aria-label={`${f.demoVariantAria} ${i + 1}`}
                aria-current={i === afterIndex}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === afterIndex ? "w-4 bg-accent" : "w-1.5 bg-fg/40 hover:bg-fg/70"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-fg-subtle">{f.demoNote}</p>
    </div>
  );
}
