"use client";

import { Card, CardContent } from "@/components/ui/card";

const MARQUEE_ITEMS = [
  "Next.js (App Router)",
  "Tailwind CSS",
  "Lucide React",
  "React",
  "TypeScript",
  "Vercel",
  "AI SDK",
  "Radix UI",
  "Framer Motion",
] as const;

function MarqueeRow({ items }: { items: readonly string[] }) {
  return (
    <div className="flex w-max shrink-0 gap-4 pr-4">
      {items.map((item) => (
        <Card
          key={item}
          className="group relative shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-900/40 px-4 py-2 text-card-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-emerald-400/60 hover:bg-zinc-900/70 hover:shadow-[0_0_16px_rgba(16,185,129,0.35)]"
        >
          {/* Subtle inner glow for the chip on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(56,189,248,0.18), transparent 55%)",
              mixBlendMode: "screen",
            }}
          />
          <CardContent className="relative z-10 flex items-center justify-center p-0">
            <span className="whitespace-nowrap text-sm font-medium text-zinc-300 transition-colors group-hover:text-emerald-100 md:text-base">
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
      className="relative my-24 overflow-hidden border-t border-white/10 bg-black/30 px-5 py-16 backdrop-blur-sm sm:px-6 md:py-24"
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
