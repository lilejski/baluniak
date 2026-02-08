"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  Rocket,
  ShoppingCart,
  Bot,
  CreditCard,
  Calendar,
  Moon,
  FileText,
  Database,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getPriceRange,
  getComplexity,
  type ConfiguratorSelection,
  type ProjectType,
  type FeatureId,
} from "@/lib/configurator-pricing";

const STEPS = [
  { id: 1, label: "Typ projektu" },
  { id: 2, label: "Zakres" },
  { id: 3, label: "Supermoce" },
] as const;

type SummaryPhase = "idle" | "loading" | "done" | "sent";

type StatusLogEntry = { id: number; text: string };

const PROJECT_TYPES: { id: ProjectType; label: string; icon: React.ElementType }[] = [
  { id: "landing", label: "Landing Page", icon: LayoutTemplate },
  { id: "saas", label: "SaaS MVP", icon: Rocket },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
];

const SUPER_FEATURES: { id: FeatureId; label: string; icon: React.ElementType }[] = [
  { id: "aiChatbot", label: "AI Chatbot", icon: Bot },
  { id: "payments", label: "Stripe Payments", icon: CreditCard },
  { id: "booking", label: "Booking Calendar", icon: Calendar },
  { id: "darkMode", label: "Dark Mode", icon: Moon },
];

const defaultSelection: ConfiguratorSelection = {
  projectType: "landing",
  pageCount: 5,
  cms: false,
  auth: false,
  features: [],
};

/** Log messages for system status when user toggles options. */
const FEATURE_LOG_MESSAGES: Record<FeatureId, { on: string; off: string }> = {
  aiChatbot: { on: "Loading AI Chatbot module...", off: "AI Chatbot module disabled." },
  payments: { on: "Integrating Stripe... Payment layer ready.", off: "Stripe module disconnected." },
  booking: { on: "Calendar & booking module loaded.", off: "Booking module disabled." },
  darkMode: { on: "Theme: dark mode enabled.", off: "Dark mode disabled." },
  authDatabase: { on: "", off: "" },
  cms: { on: "", off: "" },
};

/** Animate number from current display to target when value changes. */
function useCountUp(value: number, durationMs = 500): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  displayRef.current = display;
  useEffect(() => {
    if (displayRef.current === value) return;
    const start = displayRef.current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const next = Math.round(start + (value - start) * eased);
      setDisplay(next);
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value, durationMs]);
  return display;
}

function useCountUpRange(
  min: number,
  max: number,
  durationMs = 500
): { displayMin: number; displayMax: number } {
  const displayMin = useCountUp(min, durationMs);
  const displayMax = useCountUp(max, durationMs);
  return { displayMin, displayMax };
}

export default function KreatorPage() {
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [selection, setSelection] = useState<ConfiguratorSelection>(defaultSelection);
  const [summaryPhase, setSummaryPhase] = useState<SummaryPhase>("idle");
  const [architectText, setArchitectText] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [statusLog, setStatusLog] = useState<StatusLogEntry[]>([]);
  const logIdRef = useRef(0);
  const logScrollRef = useRef<HTMLDivElement>(null);

  const { min, max } = getPriceRange(selection);
  const { level, score } = getComplexity(selection);
  const { displayMin, displayMax } = useCountUpRange(min, max);

  const addLog = useCallback((text: string) => {
    const id = ++logIdRef.current;
    setStatusLog((prev) => [...prev.slice(-14), { id, text }]);
    setTimeout(() => logScrollRef.current?.scrollTo({ top: logScrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  const runArchitect = useCallback(async () => {
    setSummaryPhase("loading");
    setArchitectText("");
    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: selection,
          priceRange: { min, max },
        }),
      });
      if (!res.ok || !res.body) throw new Error("Architect request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setArchitectText(text);
      }
      setSummaryPhase("done");
    } catch {
      setArchitectText("Nie udało się pobrać analizy. Spróbuj ponownie.");
      setSummaryPhase("done");
    }
  }, [selection, min, max]);

  const sendInquiry = useCallback(async () => {
    setInquirySending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: selection,
          priceRange: { min, max },
          architectSummary: architectText,
        }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) setSummaryPhase("sent");
    } finally {
      setInquirySending(false);
    }
  }, [selection, min, max, architectText]);

  const update = useCallback(
    <K extends keyof ConfiguratorSelection>(key: K, value: ConfiguratorSelection[K]) => {
      if (key === "projectType") {
        const label = PROJECT_TYPES.find((p) => p.id === value)?.label ?? "Project";
        addLog(`Initializing ${label} template...`);
      } else if (key === "pageCount" && typeof value === "number") {
        addLog(`Configuring scope: ${value} pages. Complexity adjusted.`);
      } else if (key === "cms") {
        addLog(value ? "Connecting CMS module... Content layer enabled." : "CMS module disconnected.");
      } else if (key === "auth") {
        addLog(value ? "Connecting Supabase module... Complexity increased +15%." : "Auth module disconnected.");
      }
      setSelection((s) => ({ ...s, [key]: value }));
    },
    [addLog]
  );

  const toggleFeature = useCallback(
    (id: FeatureId) => {
      setSelection((s) => {
        const adding = !s.features.includes(id);
        const msg = FEATURE_LOG_MESSAGES[id]?.[adding ? "on" : "off"];
        if (msg) addLog(msg);
        return {
          ...s,
          features: adding ? [...s.features, id] : s.features.filter((f) => f !== id),
        };
      });
    },
    [addLog]
  );

  const progressPct = summaryPhase !== "idle" ? 100 : (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">Kreator projektu</h1>
        <p className="mb-6 text-sm text-zinc-500">
          {summaryPhase === "idle"
            ? "Wybierz typ, zakres i funkcje – zobaczysz wycenę na żywo."
            : summaryPhase === "loading"
              ? "AI Architect analizuje wymagania…"
              : "Podsumowanie i zapytanie ofertowe."}
        </p>

        {/* Progress bar */}
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Summary phase: loading or result */}
        {summaryPhase === "loading" && (
          <Card className="border-white/10 bg-zinc-900/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mb-4 size-10 rounded-full border-2 border-emerald-500 border-t-transparent"
              />
              <p className="text-zinc-400">AI Architect analizuje wymagania…</p>
            </CardContent>
          </Card>
        )}

        {summaryPhase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-6"
          >
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-zinc-200">Strategia implementacji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {architectText}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={sendInquiry}
                disabled={inquirySending}
                className="bg-emerald-600 px-8 text-base hover:bg-emerald-500"
              >
                {inquirySending ? "Wysyłanie…" : "Wyślij zapytanie"}
              </Button>
            </div>
          </motion.div>
        )}

        {summaryPhase === "sent" && (
          <Card className="border-emerald-500/30 bg-emerald-950/20">
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-emerald-200">Zapytanie zostało wysłane.</p>
              <p className="mt-1 text-sm text-zinc-400">Skontaktujemy się wkrótce.</p>
            </CardContent>
          </Card>
        )}

        {summaryPhase === "idle" && (
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left: Wizard */}
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-200">{STEPS[step - 1].label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait" initial={false}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 40 * -stepDirection }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 * stepDirection }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    {PROJECT_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("projectType", id)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-5 text-left transition-all",
                          selection.projectType === id
                            ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                            : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        )}
                      >
                        <Icon className="size-8 shrink-0" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 40 * -stepDirection }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 * stepDirection }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <Layers className="size-4 text-zinc-500" />
                        Liczba stron: <strong>{selection.pageCount}</strong>
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={selection.pageCount}
                        onChange={(e) => update("pageCount", parseInt(e.target.value, 10))}
                        className="h-2 w-full appearance-none rounded-full bg-zinc-700 accent-emerald-500"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selection.cms}
                          onChange={(e) => update("cms", e.target.checked)}
                          className="size-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                        />
                        <FileText className="size-4 text-zinc-400" />
                        <span className="text-sm text-zinc-300">CMS</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selection.auth}
                          onChange={(e) => update("auth", e.target.checked)}
                          className="size-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                        />
                        <Database className="size-4 text-zinc-400" />
                        <span className="text-sm text-zinc-300">Auth / Baza</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 40 * -stepDirection }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 * stepDirection }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {SUPER_FEATURES.map(({ id, label, icon: Icon }) => (
                      <label
                        key={id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all",
                          selection.features.includes(id)
                            ? "border-emerald-500/60 bg-emerald-950/30"
                            : "border-white/10 bg-zinc-800/50 hover:border-white/20"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selection.features.includes(id)}
                          onChange={() => toggleFeature(id)}
                          className="size-4 rounded border-zinc-600 bg-zinc-800 accent-emerald-500"
                        />
                        <Icon className="size-5 shrink-0 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-200">{label}</span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStepDirection(-1);
                    setStep((s) => Math.max(1, s - 1));
                  }}
                  disabled={step === 1}
                  className="border-white/20"
                >
                  Wstecz
                </Button>
                {step < STEPS.length ? (
                  <Button
                    onClick={() => {
                      setStepDirection(1);
                      setStep((s) => s + 1);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Dalej
                  </Button>
                ) : (
                  <Button onClick={runArchitect} className="bg-emerald-600 hover:bg-emerald-500">
                    Finalizuj
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Live estimate (sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="border-white/10 bg-zinc-900/80 shadow-xl">
              <CardHeader>
                <CardTitle className="text-zinc-200">Szacunek wyceny</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Przedział cenowy
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-400">
                    {displayMin.toLocaleString("pl-PL")} – {displayMax.toLocaleString("pl-PL")} PLN
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Złożoność
                  </p>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        level === "low" && "bg-emerald-500",
                        level === "medium" && "bg-amber-500",
                        level === "high" && "bg-rose-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    {level === "low" && "Niska"}
                    {level === "medium" && "Średnia"}
                    {level === "high" && "Wysoka"}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-zinc-950/80 font-mono">
                  <p className="border-b border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    System status
                  </p>
                  <div
                    ref={logScrollRef}
                    className="max-h-32 overflow-y-auto px-3 py-2 text-xs text-zinc-400"
                  >
                    {statusLog.length === 0 ? (
                      <span className="text-zinc-600">Idle. Change options to see activity.</span>
                    ) : (
                      <ul className="space-y-1">
                        <AnimatePresence initial={false}>
                          {statusLog.map((entry) => (
                            <motion.li
                              key={entry.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start gap-2 text-emerald-400/90"
                            >
                              <span className="shrink-0 text-zinc-600">›</span>
                              <span>{entry.text}</span>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  Wycena orientacyjna. Ostateczna oferta po konsultacji.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
