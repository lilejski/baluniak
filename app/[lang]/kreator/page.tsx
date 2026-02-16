"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  type Branch,
  type FunnelState,
  type StandardAnswers,
  type ProfessionalAnswers,
  type AdvancedModules,
  getStandardSteps,
  getProfessionalSteps,
  getTotalSteps,
  getDefaultAnswers,
  buildConfigForApi,
  getStackSummary,
  getTimelineSummary,
  getPriceBreakdown,
  ADVANCED_MODULE_IDS,
} from "@/lib/kreator-funnel";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language, translations } from "@/lib/translations";
import { ShoppingCart } from "lucide-react";

const PLN_TO_USD = 0.25;

function formatPrice(pln: number, lang: Language, currencyCode: string): string {
  const value = lang === "PL" ? pln : Math.round(pln * PLN_TO_USD);
  const locale = lang === "PL" ? "pl-PL" : "en-US";
  return `${value.toLocaleString(locale)} ${currencyCode}`;
}

type KreatorOptions = (typeof translations)[Language]["kreator"]["options"];

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

/** Animate number toward target (count-up effect). */
function useCountUp(target: number, durationMs = 600): number {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    if (prevRef.current === target) return;
    const start = prevRef.current;
    prevRef.current = target;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - (1 - t) ** 2;
      setDisplay(Math.round(start + (target - start) * eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, durationMs]);
  return display;
}

export default function KreatorPage() {
  const { dict, lang } = useLanguage();
  const k = dict.kreator;
  const standardSteps = getStandardSteps(lang);
  const professionalSteps = getProfessionalSteps(lang);

  const [branch, setBranch] = useState<Branch | null>(null);
  const [step, setStep] = useState(0);
  const [stepDirection, setStepDirection] = useState(1);
  const [standard, setStandard] = useState<Partial<StandardAnswers>>({});
  const [professional, setProfessional] = useState<Partial<ProfessionalAnswers>>({});
  const [modules, setModules] = useState<Partial<AdvancedModules>>({});
  const [summaryPhase, setSummaryPhase] = useState<SummaryPhase>("idle");
  const [architectText, setArchitectText] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const offerPrintRef = useRef<HTMLDivElement>(null);

  const state: FunnelState = { branch, step, standard, professional, modules };
  const { lineItems: selectedFeatures, total: totalPrice } = useMemo(
    () => getPriceBreakdown(state, lang),
    [branch, standard, professional, modules, lang]
  );
  const displayTotal = useCountUp(totalPrice);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const totalSteps = branch ? getTotalSteps(branch) : 0;
  const currentStepLabel =
    branch === "standard" && step >= 1 && step <= standardSteps.length
      ? standardSteps[step - 1].label
      : branch === "professional" && step >= 1 && step <= professionalSteps.length
        ? professionalSteps[step - 1].label
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

  const apiDoneRef = useRef(false);
  const logSequenceCompleteRef = useRef(false);

  const tryTransitionToDone = useCallback(() => {
    if (apiDoneRef.current && logSequenceCompleteRef.current) {
      setSummaryPhase("done");
    }
  }, []);

  const runArchitect = useCallback(async () => {
    apiDoneRef.current = false;
    const config = buildConfigForApi(state);
    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, priceRange: { min: 0, max: 0 }, lang }),
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
      apiDoneRef.current = true;
      tryTransitionToDone();
    } catch {
      setArchitectText(k.analysisFailed);
      apiDoneRef.current = true;
      tryTransitionToDone();
    }
  }, [branch, step, standard, professional, tryTransitionToDone]);

  const sendToBaluniak = useCallback(async () => {
    const config = buildConfigForApi(state);
    const projectType =
      branch === "standard"
        ? k.pathStandard
        : branch === "professional"
          ? k.pathProfessional
          : "Kreator";
    setInquirySending(true);
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "",
          clientEmail: "",
          projectType,
          budgetRange: { min: 0, max: totalPrice },
          config,
          architectSummary: architectText,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setSummaryPhase("sent");
      } else {
        alert(k.sendError);
      }
    } catch {
      alert(k.sendError);
    } finally {
      setInquirySending(false);
    }
  }, [branch, step, standard, professional, modules, architectText, totalPrice, k]);

  const downloadOfferPdf = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  const isLastStep = branch !== null && step >= totalSteps;
  const canProceed =
    branch === "standard"
      ? step === 1 || step === 2 || (step === 3 && standard.deadline) || step === 4
      : branch === "professional"
        ? step === 1 ||
          step === 2 ||
          step === 3 ||
          (step === 4 && professional.scalability !== undefined) ||
          step === 5
        : false;

  const [visibleLogIndex, setVisibleLogIndex] = useState(-1);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const processingStarted = useRef(false);

  useEffect(() => {
    if (summaryPhase !== "processing") {
      processingStarted.current = false;
      logSequenceCompleteRef.current = false;
      apiDoneRef.current = false;
      setVisibleLogIndex(-1);
      return;
    }
    if (processingStarted.current) return;
    processingStarted.current = true;
    runArchitect();
  }, [summaryPhase, runArchitect]);

  const logQueueTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (summaryPhase !== "processing") return;
    const stepsCount = 5;
    const runNext = (index: number) => {
      setVisibleLogIndex(index);
      if (index >= stepsCount) {
        logSequenceCompleteRef.current = true;
        tryTransitionToDone();
        return;
      }
      const delay = 800 + Math.random() * 700;
      logQueueTimeoutRef.current = setTimeout(() => runNext(index + 1), delay);
    };
    const firstId = setTimeout(() => runNext(0), 400);
    logQueueTimeoutRef.current = firstId;
    return () => {
      if (logQueueTimeoutRef.current) {
        clearTimeout(logQueueTimeoutRef.current);
        logQueueTimeoutRef.current = null;
      }
    };
  }, [summaryPhase, tryTransitionToDone]);

  useEffect(() => {
    if (summaryPhase !== "processing" || !terminalScrollRef.current) return;
    const el = terminalScrollRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [summaryPhase, visibleLogIndex]);

  const currencyCode = k.currencyCode as string;
  const priceSummaryContent = (
    <motion.div layout className="space-y-4">
      <h3 className="text-base font-bold text-white">
        {k.yourConfig}
      </h3>
      {selectedFeatures.length === 0 ? (
        <p className="text-sm text-zinc-500">{k.selectPathToSeePrice}</p>
      ) : (
        <>
          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {selectedFeatures.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between gap-2 text-sm text-zinc-400"
                >
                  <span>{item.label}</span>
                  <span className="shrink-0 tabular-nums">
                    {i === 0 ? "" : "+"}
                    {formatPrice(item.price, lang, currencyCode)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="border-t border-zinc-800 pt-4">
            <motion.p
              key={`${displayTotal}-${lang}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="text-2xl font-bold tabular-nums text-emerald-500"
            >
              {k.estimatedTotal}: {formatPrice(displayTotal, lang, currencyCode)}
            </motion.p>
          </div>
          <p className="text-xs text-zinc-500">
            {k.priceDisclaimer}
          </p>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen px-4 py-8 pb-[max(8rem,calc(env(safe-area-inset-bottom)+8rem))] lg:pb-8">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #offer-print, #offer-print * { visibility: visible; }
          #offer-print { position: absolute; left: 0; top: 0; width: 100%; background: white; color: #111; padding: 2rem; }
        }
      `}</style>
      <div className={cn("mx-auto", summaryPhase === "idle" ? "max-w-6xl" : "max-w-3xl")}>
        <motion.h1
          layout
          className="mb-2 text-2xl font-bold text-zinc-100"
        >
          {k.title}
        </motion.h1>
        <p className="mb-6 text-sm text-zinc-500">
          {k.subtitle}
        </p>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          {summaryPhase === "processing" && (
            <p className="mt-2 text-xs text-zinc-500">{k.progressAnalysing}</p>
          )}
        </div>

        {summaryPhase === "processing" && (
          <ProcessingTerminal
            title={k.terminalTitle}
            steps={[k.terminalLine1, k.terminalLine2, k.terminalLine3, k.terminalLine4, k.terminalLine5]}
            visibleLogIndex={visibleLogIndex}
            processingLabel={k.processingLabel}
            scrollRef={terminalScrollRef}
            isProcessing={true}
          />
        )}

        {/* Preliminary Strategy (done) */}
        {summaryPhase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div id="offer-print" ref={offerPrintRef} className="space-y-6 print:block">
              <Card className="border-emerald-500/20 bg-zinc-900/50 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-zinc-100">
                    <Zap className="size-6 text-emerald-500" />
                    {k.offerTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Chosen features + final price */}
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      {k.chosenFeatures}
                    </h3>
                    <ul className="space-y-2">
                      {selectedFeatures.map((item, i) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-sm text-zinc-300"
                        >
                          <span>{item.label}</span>
                          <span className="tabular-nums">
                            {i === 0 ? "" : "+"}
                            {formatPrice(item.price, lang, currencyCode)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 border-t border-zinc-700 pt-4">
                      <motion.p
                        key={`final-${displayTotal}-${lang}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="text-2xl font-bold tabular-nums text-emerald-400"
                      >
                        {k.sumLabel} {formatPrice(displayTotal, lang, currencyCode)}
                      </motion.p>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      {k.recommendedStack}
                    </h3>
                    <p className="text-zinc-200">{getStackSummary(state, lang)}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      {k.estimatedTime}
                    </h3>
                    <p className="text-zinc-200">{getTimelineSummary(state, lang)}</p>
                  </div>
                  {architectText && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        {k.architectAnalysis}
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
                onClick={downloadOfferPdf}
                className="min-h-12 bg-emerald-600 px-8 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
              >
                <FileDown className="mr-2 size-5 shrink-0" />
                {k.downloadPdf}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={sendToBaluniak}
                disabled={inquirySending}
                className="min-h-12 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/50"
              >
                <Send className="mr-2 size-5 shrink-0" />
                {inquirySending ? k.sending : k.sendToBaluniak}
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
                {k.sentSuccess}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Wizard + Price Summary (idle only) */}
        {summaryPhase === "idle" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-zinc-200">
                  {branch === null ? k.choosePath : currentStepLabel}
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
                        "flex min-h-[48px] min-w-[48px] flex-col items-center gap-4 rounded-xl border-2 p-8 text-left transition-all",
                        "border-white/10 bg-zinc-800/50 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-zinc-800/80"
                      )}
                    >
                      <Monitor className="size-14 text-emerald-500/90" />
                      <div className="text-center">
                        <span className="block font-semibold text-zinc-100">
                          {k.pathStandard}
                        </span>
                        <span className="mt-1 block text-sm text-zinc-500">
                          {k.pathStandardDesc}
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseBranch("professional")}
                      className={cn(
                        "flex min-h-[48px] min-w-[48px] flex-col items-center gap-4 rounded-xl border-2 p-8 text-left transition-all",
                        "border-white/10 bg-zinc-800/50 hover:-translate-y-2 hover:border-emerald-500/50 hover:bg-zinc-800/80"
                      )}
                    >
                      <Cpu className="size-14 text-emerald-500/90" />
                      <div className="text-center">
                        <span className="block font-semibold text-zinc-100">
                          {k.pathProfessional}
                        </span>
                        <span className="mt-1 block text-sm text-zinc-500">
                          {k.pathProfessionalDesc}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                )}

                {branch === "standard" && step >= 1 && step <= 3 && (
                  <StandardSteps
                    key="standard"
                    step={step}
                    stepDirection={stepDirection}
                    standard={standard}
                    setStandard={setStandard}
                    slideIn={slideIn}
                    transition={transition}
                    options={k.options}
                  />
                )}

                {branch === "professional" && step >= 1 && step <= 4 && (
                  <ProfessionalSteps
                    key="professional"
                    step={step}
                    stepDirection={stepDirection}
                    professional={professional}
                    setProfessional={setProfessional}
                    slideIn={slideIn}
                    transition={transition}
                    options={k.options}
                  />
                )}

                {((branch === "standard" && step === 4) || (branch === "professional" && step === 5)) && (
                  <ModulesStep
                    key="modules"
                    modules={modules}
                    setModules={setModules}
                    slideIn={slideIn}
                    transition={transition}
                    options={k.options}
                  />
                )}
              </AnimatePresence>

              <div className="flex justify-between gap-3 pt-4 lg:pt-4">
                <Button variant="outline" size="lg" onClick={goBack} className="min-h-12 border-white/20">
                  <ArrowLeft className="mr-2 size-4" />
                  {k.back}
                </Button>
                {branch !== null && (
                  <Button
                    size="lg"
                    onClick={goNext}
                    disabled={!canProceed && !isLastStep}
                    className="min-h-12 bg-emerald-600 hover:bg-emerald-500"
                  >
                    {isLastStep ? (
                      k.prepareOffer
                    ) : (
                      <>
                        {k.next}
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Desktop: sticky price summary sidebar (premium checkout feel) */}
          <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <Card className="border-zinc-800 bg-zinc-950 shadow-xl">
              <CardContent className="p-6">
                {priceSummaryContent}
              </CardContent>
            </Card>
          </div>

          {/* Mobile: bottom bar + drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-left"
                  aria-label={k.openConfigAria}
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-white">
                    <ShoppingCart className="size-5 text-emerald-500" />
                    {k.yourConfig}
                  </span>
                  <span className="text-xl font-bold tabular-nums text-emerald-500">
                    {formatPrice(displayTotal, lang, currencyCode)}
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="border-zinc-800 bg-zinc-950">
                <SheetHeader>
                  <SheetTitle className="text-zinc-100">{k.yourConfig}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 pb-8">
                  {priceSummaryContent}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function ProcessingTerminal({
  title,
  steps,
  visibleLogIndex,
  processingLabel,
  scrollRef,
  isProcessing,
}: {
  title: string;
  steps: string[];
  visibleLogIndex: number;
  processingLabel: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  isProcessing: boolean;
}) {
  const hasLines = visibleLogIndex >= 0;
  const allLinesShown = visibleLogIndex >= steps.length;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-8 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 font-mono text-sm"
    >
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-2 text-zinc-500">
        <span>{title}</span>
        {isProcessing && (
          <motion.span
            className="text-xs text-emerald-400/90"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {processingLabel}
          </motion.span>
        )}
      </div>
      <div
        ref={scrollRef}
        className="max-h-[220px] space-y-1 overflow-y-auto px-4 py-4 text-emerald-400/90 scroll-smooth"
      >
        {!hasLines && (
          <motion.p
            className="text-xs text-zinc-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {processingLabel}
          </motion.p>
        )}
        {steps.slice(0, Math.max(0, visibleLogIndex + 1)).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-0.5"
          >
            <span>&gt; {line}</span>
            {i === visibleLogIndex && !allLinesShown && (
              <motion.span
                className="inline-block w-3 text-emerald-400"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                aria-hidden
              >
                _
              </motion.span>
            )}
          </motion.div>
        ))}
        {allLinesShown && (
          <motion.p
            className="pt-1 text-xs text-zinc-500"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {processingLabel}
          </motion.p>
        )}
      </div>
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
  options,
}: {
  step: number;
  stepDirection: number;
  standard: Partial<StandardAnswers>;
  setStandard: React.Dispatch<React.SetStateAction<Partial<StandardAnswers>>>;
  slideIn: (d: number) => { initial: { opacity: number; x: number }; animate: { opacity: number; x: number }; exit: { opacity: number; x: number } };
  transition: Transition;
  options: KreatorOptions;
}) {
  const o = options;
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
              { id: "wizerunek" as const, labelKey: "brandingWizerunek" as const },
              { id: "portfolio" as const, labelKey: "brandingPortfolio" as const },
              { id: "kontakt" as const, labelKey: "brandingKontakt" as const },
            ] as const
            ).map(({ id, labelKey }) => (
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
              {options[labelKey]}
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
                {key === "about" && o.sectionAbout}
                {key === "gallery" && o.sectionGallery}
                {key === "contact" && o.sectionContact}
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
              { id: "asap" as const, labelKey: "deadlineAsap" as const },
              { id: "2weeks" as const, labelKey: "deadline2weeks" as const },
              { id: "1month" as const, labelKey: "deadline1month" as const },
            ] as const
          ).map(({ id, labelKey }) => (
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
              {o[labelKey]}
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
  options,
}: {
  step: number;
  stepDirection: number;
  professional: Partial<ProfessionalAnswers>;
  setProfessional: React.Dispatch<React.SetStateAction<Partial<ProfessionalAnswers>>>;
  slideIn: (d: number) => { initial: { opacity: number; x: number }; animate: { opacity: number; x: number }; exit: { opacity: number; x: number } };
  transition: Transition;
  options: KreatorOptions;
}) {
  const o = options;
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
              { id: "fal" as const, labelKey: "aiFal" as const },
              { id: "openai" as const, labelKey: "aiOpenai" as const },
              { id: "both" as const, labelKey: "aiBoth" as const },
            ] as const
          ).map(({ id, labelKey }) => (
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
              {o[labelKey]}
            </button>
          ))}
        </motion.div>
      )}
      {step === 2 && (
        <motion.div key="p2" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">{o.paymentsQuestion}</p>
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
              {o.yes}
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
              {o.no}
            </button>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div key="p3" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">{o.authQuestion}</p>
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
              {o.yes}
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
              {o.no}
            </button>
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div key="p4" {...(slideIn(stepDirection) as React.ComponentProps<typeof motion.div>)} transition={transition}>
          <p className="mb-3 text-sm text-zinc-400">{o.scaleQuestion}</p>
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
              {o.yes}
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
              {o.no}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}

const MODULE_OPTION_KEYS: Record<(typeof ADVANCED_MODULE_IDS)[number], keyof KreatorOptions> = {
  seo: "moduleSeo",
  cms: "moduleCms",
  i18n: "moduleI18n",
  analytics: "moduleAnalytics",
  legal: "moduleLegal",
};

const MODULE_SUBTITLE_KEYS: Record<(typeof ADVANCED_MODULE_IDS)[number], keyof KreatorOptions> = {
  seo: "moduleSeoSubtitle",
  cms: "moduleCmsSubtitle",
  i18n: "moduleI18nSubtitle",
  analytics: "moduleAnalyticsSubtitle",
  legal: "moduleLegalSubtitle",
};

function ModulesStep({
  modules,
  setModules,
  slideIn,
  transition,
  options,
}: {
  modules: Partial<AdvancedModules>;
  setModules: React.Dispatch<React.SetStateAction<Partial<AdvancedModules>>>;
  slideIn: (d: number) => { initial: { opacity: number; x: number }; animate: { opacity: number; x: number }; exit: { opacity: number; x: number } };
  transition: Transition;
  options: KreatorOptions;
}) {
  return (
    <motion.div
      key="modules"
      {...(slideIn(1) as React.ComponentProps<typeof motion.div>)}
      transition={transition}
      className="space-y-3"
    >
      {ADVANCED_MODULE_IDS.map((id) => {
        const subtitle = options[MODULE_SUBTITLE_KEYS[id]];
        return (
          <label
            key={id}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-white/20"
          >
            <input
              type="checkbox"
              checked={modules[id] ?? false}
              onChange={(e) =>
                setModules((m) => ({ ...m, [id]: e.target.checked }))
              }
              className="mt-0.5 size-4 shrink-0 rounded accent-emerald-500"
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-zinc-200">
                {options[MODULE_OPTION_KEYS[id]] ?? id}
              </span>
              {subtitle && (
                <p className="mt-0.5 text-xs text-zinc-500" title={subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </motion.div>
  );
}
