"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const panelVariants = {
  hiddenLeft: { opacity: 0, x: -24 },
  hiddenRight: { opacity: 0, x: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const inputBarVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.35, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const TYPEWRITER_MS = 12;
const MAX_EXCHANGES = 3;

type Exchange = {
  prompt: string;
  agent1: string;
  agent2: string;
  suggestedLink?: "fotarobota" | "saas-guide";
};

const CTA_LINKS = {
  fotarobota: { label: "Zobacz Fotarobota", href: "https://www.fotarobota.pl" },
  "saas-guide": { label: "Check my SaaS Guide", href: "/saas-guide" },
} as const;

export function AIDuelLayout() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [displayedLeft, setDisplayedLeft] = useState("");
  const [displayedRight, setDisplayedRight] = useState("");
  const [typewriterRunning, setTypewriterRunning] = useState(false);
  const cancelledRef = useRef(false);
  const typewriterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastExchange = exchanges[exchanges.length - 1];
  const lastPrompt = lastExchange?.prompt ?? null;
  const showNextSteps = exchanges.length >= MAX_EXCHANGES;
  const suggestedLink = lastExchange?.suggestedLink;

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (typewriterTimerRef.current)
        clearTimeout(typewriterTimerRef.current);
    };
  }, []);

  const runTypewriter = useCallback((agent1: string, agent2: string) => {
    setDisplayedLeft("");
    setDisplayedRight("");
    cancelledRef.current = false;
    setTypewriterRunning(true);

    const maxLen = Math.max(agent1.length, agent2.length);
    let i = 0;

    const tick = () => {
      if (cancelledRef.current) {
        setTypewriterRunning(false);
        return;
      }
      setDisplayedLeft(agent1.slice(0, i + 1));
      setDisplayedRight(agent2.slice(0, i + 1));
      i++;
      if (i < maxLen) {
        typewriterTimerRef.current = setTimeout(tick, TYPEWRITER_MS);
      } else {
        setTypewriterRunning(false);
      }
    };

    typewriterTimerRef.current = setTimeout(tick, TYPEWRITER_MS);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const message = input.trim();
      if (!message || loading || typewriterRunning) return;
      if (exchanges.length >= MAX_EXCHANGES) return;

      setError(null);
      setInput("");
      setLoading(true);

      try {
        const previousExchanges = exchanges.map(({ prompt, agent1, agent2 }) => ({
          prompt,
          agent1,
          agent2,
        }));
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, previousExchanges }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error ?? `Error ${res.status}`);
          setLoading(false);
          return;
        }

        if (typeof data?.agent1 !== "string" || typeof data?.agent2 !== "string") {
          setError("Invalid response from API");
          setLoading(false);
          return;
        }

        const link =
          data.suggestedLink === "fotarobota" || data.suggestedLink === "saas-guide"
            ? data.suggestedLink
            : undefined;
        setExchanges((prev) =>
          prev.concat({
            prompt: message,
            agent1: data.agent1,
            agent2: data.agent2,
            ...(link && { suggestedLink: link }),
          })
        );
        setLoading(false);
        runTypewriter(data.agent1, data.agent2);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
        setLoading(false);
      }
    },
    [input, loading, typewriterRunning, runTypewriter, exchanges]
  );

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-zinc-950">
      <div className="flex min-h-0 flex-1">
        {/* Left: Developer Persona – dark terminal */}
        <motion.div
          custom={0.15}
          variants={panelVariants}
          initial="hiddenLeft"
          animate="visible"
          className="flex w-1/2 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950"
        >
          <div className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-zinc-500">
                developer_persona
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {lastPrompt && (
              <div className="mb-4 text-zinc-500">
                <span className="text-zinc-500">&gt;</span> {lastPrompt}
              </div>
            )}
            {displayedLeft ? (
              <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-zinc-900 [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                <ReactMarkdown>{displayedLeft}</ReactMarkdown>
                {typewriterRunning && (
                  <span className="animate-pulse text-emerald-400">▌</span>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-emerald-400/90">
                <p>
                  <span className="text-zinc-500">&gt;</span> node --version
                </p>
                <p className="text-zinc-400">v20.10.0</p>
                <p>
                  <span className="text-zinc-500">&gt;</span> npm run dev
                </p>
                <p className="text-zinc-400">Ready in 1.2s</p>
                <p>
                  <span className="text-zinc-500">&gt;</span>{" "}
                  <span className="text-amber-300/90">_</span>
                </p>
                <p className="mt-6 text-zinc-500 text-xs">
                  Type an idea above and hit Send. Technical steps will appear
                  here in Markdown.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Business Persona – light glassmorphism */}
        <motion.div
          custom={0.3}
          variants={panelVariants}
          initial="hiddenRight"
          animate="visible"
          className="flex w-1/2 flex-col overflow-hidden bg-zinc-900/50"
        >
          <div
            className="flex flex-1 flex-col overflow-auto border-l border-white/10 bg-white/5 backdrop-blur-xl"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white/95">Business Persona</h2>
              <p className="mt-0.5 text-sm text-white/60">
                Strategic view · KPIs · Stakeholder language
              </p>
            </div>
            <div className="flex-1 overflow-auto p-5 text-sm text-white/80">
              {displayedRight ? (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {displayedRight}
                  {typewriterRunning && (
                    <span className="animate-pulse text-white">▌</span>
                  )}
                </div>
              ) : (
                <>
                  <p className="leading-relaxed">
                    Summaries and recommendations will appear here in clear,
                    non-technical language.
                  </p>
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs uppercase tracking-wider">
                      Placeholder
                    </p>
                    <p className="mt-2 text-white/90">
                      Business value and monetization strategy will stream here
                      with a typewriter effect.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed bottom: input bar or Next Steps card */}
      <motion.div
        variants={inputBarVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md"
      >
        {showNextSteps ? (
          <div className="mx-auto max-w-4xl">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <h3 className="font-semibold text-white/95">Next Steps</h3>
              <p className="mt-1 text-sm text-white/60">
                Based on your conversation, here’s a suggested next step.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {suggestedLink ? (
                  <a
                    href={CTA_LINKS[suggestedLink].href}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  >
                    {CTA_LINKS[suggestedLink].label}
                  </a>
                ) : (
                  <>
                    <a
                      href={CTA_LINKS.fotarobota.href}
                      className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                      {CTA_LINKS.fotarobota.label}
                    </a>
                    <a
                      href={CTA_LINKS["saas-guide"].href}
                      className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white/95 backdrop-blur-sm transition-all hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                      {CTA_LINKS["saas-guide"].label}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-4xl flex-col gap-2"
          >
            {exchanges.length > 0 && (
              <p className="text-xs text-zinc-500">
                Exchange {exchanges.length} of {MAX_EXCHANGES}
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your idea..."
                disabled={loading}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-50"
                aria-label="Message input"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {loading ? "..." : "Send"}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <div className="h-[72px] shrink-0" aria-hidden />
    </div>
  );
}
