"use client";

import { Card, CardContent } from "@/components/ui/card";

const MARQUEE_ITEMS = [
  "Next.js",
  "React",
  "TypeScript",
  "Vercel",
  "Supabase",
  "Fal.ai",
  "Tailwind",
  "Stripe",
] as const;

function MarqueeRow({ items }: { items: readonly string[] }) {
  return (
    <div className="flex w-max shrink-0 gap-4 pr-4">
      {items.map((item) => (
        <Card
          key={item}
          className="border-border bg-card text-card-foreground shrink-0 border px-4 py-2 grayscale shadow-sm transition-all duration-200 hover:grayscale-0 hover:border-emerald-500/30 hover:shadow-md"
        >
          <CardContent className="flex items-center justify-center p-0">
            <span className="whitespace-nowrap text-sm font-medium text-muted-foreground md:text-base">
              {item}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TechStack() {
  return (
    <section
      id="tech-stack"
      className="relative my-24 overflow-hidden border-t border-white/10 bg-black/30 px-4 py-16 backdrop-blur-sm md:py-24"
      aria-labelledby="tech-stack-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="tech-stack-heading"
          className="mb-10 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          Tech Stack
        </h2>
        {/* Infinite horizontal marquee: one strip, content duplicated for seamless loop */}
        <div className="overflow-hidden" aria-hidden>
          <div
            className="flex w-max"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            <MarqueeRow items={MARQUEE_ITEMS} />
            <MarqueeRow items={MARQUEE_ITEMS} />
          </div>
        </div>
      </div>
    </section>
  );
}
