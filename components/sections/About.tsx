import { Card, CardContent } from "@/components/ui/card";

export function About() {
  return (
    <section
      id="about"
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 backdrop-blur-sm sm:px-6 md:py-24"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="about-heading"
          className="mb-10 text-center text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          The Philosophy
        </h2>
        <Card className="border-border bg-card text-card-foreground shadow-sm">
          <CardContent className="px-6 py-8 text-center md:px-10 md:py-10">
            <p className="glitch-label mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90 md:mb-5 md:text-sm">
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-glitch-left text-red-400/80 mix-blend-screen"
                >
                  Product Engineer
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 animate-glitch-right text-cyan-300/80 mix-blend-screen"
                >
                  Product Engineer
                </span>
                <span className="relative z-10">Product Engineer</span>
              </span>
            </p>
            <p className="text-muted-foreground text-xl leading-relaxed md:text-2xl md:leading-relaxed">
              I don&apos;t just write code—I ship products. From SaaS automation and AI workflows to full-stack apps, I focus on clean architecture, fast iteration, and outcomes that users and businesses actually feel.
            </p>
            <p className="mt-4 text-muted-foreground/90 text-base leading-relaxed md:text-lg">
              Built and maintained this site with Next.js, the Vercel AI SDK, and a dual-persona chat to show both technical depth and business clarity in one place.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
