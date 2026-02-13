"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  Monitor,
  Cpu,
  FileDown,
  Send,
  CheckCircle,
  Zap,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type Branch,
  type FunnelState,
  type StandardAnswers,
  type ProfessionalAnswers,
  STANDARD_STEPS,
  PROFESSIONAL_STEPS,
  getTotalSteps,
  getDefaultAnswers,
  buildConfigForApi,
  getStackSummary,
  getTimelineSummary,
} from "@/lib/kreator-funnel";

type SummaryPhase = "idle" | "processing" | "done" | "sent";

/** Framer Motion transition for step animations. */
const transition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
};

/** Step slide animation props (initial, animate, exit). Typed for motion.div compatibility. */
function slideIn(dir: number): {
  initial: { opacity: number; x: number };
  animate: { opacity: number; x: number };
  exit: { opacity: number; x: number };
} {
  return {
    initial: { opacity: 0, x: 40 * -dir },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 * dir },
  };
}

export default function KreatorPage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const [standard, setStandard] = useState<Partial<StandardAnswers>>({});
  const [professional, setProfessional] = useState<Partial<ProfessionalAnswers>>({});
  const [summaryPhase, setSummaryPhase] = useState<SummaryPhase>("idle");
  const [architectText, setArchitectText] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const offerPrintRef = useRef<HTMLDivElement>(null);

  const state: FunnelState = { branch, step, standard, professional };
  const totalSteps = branch ? getTotalSteps(branch) : 0;
  const currentStepLabel =
    branch === "standard" && step >= 1 && step <= STANDARD_STEPS.length
      ? STANDARD_STEPS[step - 1].label
      : branch === "professional" && step >= 1 && step <= PROFESSIONAL_STEPS.length
        ? PROFESSIONAL_STEPS[step - 1].label
        : "";

  const progressPct =
    summaryPhase !== "idle"
      ? summaryPhase === "processing"
        ? 85
        : 100
      : branch === null
        ? 0
        : totalSteps > 0
          ? (step / (totalSteps + 1)) * 100
          : 33;

  const chooseBranch = useCallback((b: Branch) => {
    setBranch(b);
    setStep(1);
    setStepDirection(1);
    const defaults = getDefaultAnswers(b);
    if (b === "standard") setStandard(defaults as StandardAnswers);
    else setProfessional(defaults as ProfessionalAnswers);
  }, []);

  const goBack = useCallback(() => {
    if (step <= 1) {
      setBranch(null);
      setStep(0);
      setStandard({});
      setProfessional({});
    } else {
      setStepDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const goNext = useCallback(() => {
    if (branch && step >= totalSteps) {
      setSummaryPhase("processing");
      return;
    }
    setStepDirection(1);
    setStep((s) => s + 1);
  }, [branch, step, totalSteps]);

  const runArchitect = useCallback(async () => {
    const config = buildConfigForApi(state);
    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, priceRange: { min: 0, max: 0 } }),
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
      setArchitectText("Nie udało się wygenerować analizy. Możesz i tak wysłać zapytanie.");
      setSummaryPhase("done");
    }
  }, [branch, step, standard, professional]);

  const sendToBaluniak = useCallback(async () => {
    const config = buildConfigForApi(state);
    setInquirySending(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          priceRange: { min: 0, max: 0 },
          architectSummary: architectText,
        }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) setSummaryPhase("sent");
    } finally {
      setInquirySending(false);
    }
  }, [branch, step, standard, professional, architectText]);

  const downloadOfferPdf = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  const isLastStep = branch !== null && step >= totalSteps;
  const canProceed =
    branch === "standard"
      ? step === 1 || step === 2 || (step === 3 && standard.deadline)
      : branch === "professional"
        ? step === 1 ||
          step === 2 ||
          step === 3 ||
          (step === 4 && professional.scalability !== undefined)
        : false;

  const processingStarted = useRef(false);
  useEffect(() => {
    if (summaryPhase !== "processing") {
      processingStarted.current = false;
      return;
    }
    if (processingStarted.current) return;
    processingStarted.current = true;
    const id = setTimeout(() => runArchitect(), 3200);
    return () => clearTimeout(id);
  }, [summaryPhase, runArchitect]);

  return (
    <div className="min-h-screen px-4 py-8">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #offer-print, #offer-print * { visibility: visible; }
          #offer-print { position: absolute; left: 0; top: 0; width: 100%; background: white; color: #111; padding: 2rem; }
        }
      `}</style>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-zinc-100">
          AI Architect: Zaplanujmy Twój sukces.
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Wybierz ścieżkę, a ja przygotuję dla Ciebie wstępną architekturę i wycenę.
        </p>

        {/* Progress bar */}
        <div className="mb-8 h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {summaryPhase === "processing" && (
            <p className="mt-2 text-xs text-zinc-500">Analiza Architekta…</p>
          )}
        </div>

        {/* Processing: terminal vibe */}
        {summaryPhase === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 font-mono text-sm"
          >
            <div className="border-b border-zinc-700 px-4 py-2 text-zinc-500">
              AI Architect — Processing...
            </div>
            <div className="space-y-1 px-4 py-4 text-emerald-400/90">
              <TerminalLine delay={0}>Analyzing requirements...</TerminalLine>
              <TerminalLine delay={400}>Building stack recommendation...</TerminalLine>
              <TerminalLine delay={800}>Generating timeline...</TerminalLine>
              <TerminalLine delay={1200}>Preparing preliminary offer...</TerminalLine>
              <motion.span
                className="inline-block h-4 w-2 bg-emerald-500"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}

        {/* Final offer (done) */}
        {summaryPhase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div id="offer-print" ref={offerPrintRef} className="space-y-6 print:block">
              <Card className="border-white/10 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-zinc-200">
                    <Zap className="size-5 text-emerald-500" />
                    Wstępna strategia i oferta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Rekomendowany stack
                    </h3>
                    <p className="text-zinc-200">{getStackSummary(state)}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      Szacowany czas
                    </h3>
                    <p className="text-zinc-200">{getTimelineSummary(state)}</p>
                  </div>
                  {architectText && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        Analiza Architekta
                      </h3>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                        {architectText}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center print:hidden">
              <Button
                size="lg"
                variant="outline"
                onClick={downloadOfferPdf}
                className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/50"
              >
                <FileDown className="mr-2 size-5 shrink-0" />
                Pobierz ofertę (PDF)
              </Button>
              <Button
                size="lg"
                onClick={sendToBaluniak}
                disabled={inquirySending}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <Send className="mr-2 size-5 shrink-0" />
                {inquirySending ? "Wysyłanie…" : "Wyślij do Baluniaka"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Sent success */}
        {summaryPhase === "sent" && (
          <Card className="border-emerald-500/30 bg-emerald-950/20">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="mb-4 size-12 text-emerald-400" />
              <p className="text-lg font-medium text-emerald-200">
                Strategia została wysłana. Odpowiem w ciągu 24h.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wizard: Step 0 or branch steps */}
        {summaryPhase === "idle" && (
          <Card className="border-white/10 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-200">
                {branch === null ? "Wybierz ścieżkę" : currentStepLabel}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait" initial={false}>
                {branch === null && (
                  <motion.div
                    key="step0"
                    {...slideIn(stepDirection)}
                    transition={transition}
                    className="grid gap-4 sm:grid-cols-2"
                  >
                    <button
                      type="button"
                      onClick={() => chooseBranch("standard")}
                      className={cn(
                        "flex flex-col items-center gap-4 rounded-xl border-2 p-8 text-left transition-all",
                        "border-white/10 bg-zinc-800/50 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-zinc-800/80"
                      )}
                    >
                      <Monitor className="size-14 text-emerald-500/90" />
                      <div className="text-center">
                        <span className="block font-semibold text-zinc-100">
                          Ścieżka Standard (Wizytówka)
                        </span>
                        <span className="mt-1 block text-sm text-zinc-500">
                          Prosta strona wizytówka. Branding, szybkość, czysty design.
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseBranch("professional")}
                      className={cn(
                        "flex flex-col items-center gap-4 rounded-xl border-2 p-8 text-left transition-all",
                        "border-white/10 bg-zinc-800/50 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-zinc-800/80"
                      )}
                    >
                      <Cpu className="size-14 text-emerald-500/90" />
                      <div className="text-center">
                        <span className="block font-semibold text-zinc-100">
                          Ścieżka Professional (MVP/SaaS)
                        </span>
                        <span className="mt-1 block text-sm text-zinc-500">
                          Landing + system. Konwersja, AI, płatności, skalowalność.
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )}

                {branch === "standard" && step >= 1 && (
                  <StandardSteps
                    key="standard"
                    step={step}
                    stepDirection={stepDirection}
                    standard={standard}
                    setStandard={setStandard}
                    slideIn={slideIn}
                    transition={transition}
                  />
                )}

                {branch === "professional" && step >= 1 && (
                  <ProfessionalSteps
                    key="professional"
                    step={step}
                    stepDirection={stepDirection}
                    professional={professional}
                    setProfessional={setProfessional}
                    slideIn={slideIn}
                    transition={transition}
                  />
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={goBack} className="border-white/20">
                  <ArrowLeft className="mr-2 size-4" />
                  Wstecz
                </Button>
                {branch !== null && (
                  <Button
                    onClick={goNext}
                    disabled={!canProceed && !isLastStep}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    {isLastStep ? (
                      "Przygotuj ofertę"
                    ) : (
                      <>
                        Dalej
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TerminalLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.2 }}
    >
      &gt; {children}
    </motion.div>
  );
}

function StandardSteps({
  step,
  stepDirection,
  standard,
  setStandard,
  slideIn,
  transition,
}: {
  step: number;
  stepDirection: number;
  standard: Partial<StandardAnswers>;
  setStandard: React.Dispatch<React.SetStateAction<Partial<StandardAnswers>>>;
  slideIn: (d: number) => { initial: { opacity: number; x: number }; animate: { opacity: number; x: number }; exit: { opacity: number; x: number } };
  transition: Transition;
}) {
  return (
    <>
      {step === 1 && (
        <motion.div
          key="s1"
          {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)}
          transition={transition}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(
            [
              { id: "wizerunek" as const, label: "Wizerunek firmy" },
              { id: "portfolio" as const, label: "Portfolio" },
              { id: "kontakt" as const, label: "Kontakt z klientem" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setStandard((s) => ({ ...s, branding: id }))}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                standard.branding === id
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
      {step === 2 && (
        <motion.div
          key="s2"
          {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)}
          transition={transition}
          className="space-y-3"
        >
          {(["about", "gallery", "contact"] as const).map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={standard.sections?.[key] ?? false}
                onChange={(e) =>
                  setStandard((s) => ({
                    ...s,
                    sections: {
                      about: s.sections?.about ?? true,
                      gallery: s.sections?.gallery ?? false,
                      contact: s.sections?.contact ?? true,
                      [key]: e.target.checked,
                    },
                  }))
                }
                className="size-4 rounded accent-emerald-500"
              />
              <span className="text-sm text-zinc-200">
                {key === "about" && "O nas"}
                {key === "gallery" && "Galeria"}
                {key === "contact" && "Kontakt"}
              </span>
            </label>
          ))}
        </motion.div>
      )}
      {step === 3 && (
        <motion.div
          key="s3"
          {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)}
          transition={transition}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(
            [
              { id: "asap" as const, label: "Jak najszybciej" },
              { id: "2weeks" as const, label: "~2 tygodnie" },
              { id: "1month" as const, label: "Do 1 miesiąca" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setStandard((s) => ({ ...s, deadline: id }))}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                standard.deadline === id
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
}

function ProfessionalSteps({
  step,
  stepDirection,
  professional,
  setProfessional,
  slideIn,
  transition,
}: {
  step: number;
  stepDirection: number;
  professional: Partial<ProfessionalAnswers>;
  setProfessional: React.Dispatch<React.SetStateAction<Partial<ProfessionalAnswers>>>;
  slideIn: (d: number) => { initial: { opacity: number; x: number }; animate: { opacity: number; x: number }; exit: { opacity: number; x: number } };
  transition: Transition;
}) {
  return (
    <>
      {step === 1 && (
        <motion.div
          key="p1"
          {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)}
          transition={transition}
          className="grid gap-3 sm:grid-cols-3"
        >
          {(
            [
              { id: "fal" as const, label: "Fal.ai" },
              { id: "openai" as const, label: "OpenAI" },
              { id: "both" as const, label: "Oba" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, aiIntegration: id }))}
              className={cn(
                "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                professional.aiIntegration === id
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
      {step === 2 && (
        <motion.div key="p2" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">Płatności (Autopay / Stripe)?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, payments: true }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.payments === true
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Tak
            </button>
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, payments: false }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.payments === false
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Nie
            </button>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div key="p3" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">Logowanie / użytkownicy?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, userAuth: true }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.userAuth === true
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Tak
            </button>
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, userAuth: false }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.userAuth === false
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Nie
            </button>
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div key="p4" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">Planujesz skalowanie (więcej użytkowników / ruch)?</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, scalability: true }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.scalability === true
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Tak
            </button>
            <button
              type="button"
              onClick={() => setProfessional((s) => ({ ...s, scalability: false }))}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-sm font-medium",
                professional.scalability === false
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-100"
                  : "border-white/10 bg-zinc-800/50 text-zinc-400"
              )}
            >
              Nie
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
