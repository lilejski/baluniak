"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import {
  Cpu,
  FileDown,
  Send,
  CheckCircle,
  Zap,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  type FunnelState,
  buildConfigForApi,
  getStackSummary,
  getTimelineSummary,
  getEstimatedDays,
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

type SummaryPhase = "idle" | "processing" | "done" | "sent";

type AiOption = {
  label: string;
  value: string;
  priceImpact?: number;
};

type HistoryEntry = {
  question: string;
  answer: string;
  priceImpact?: number;
};

type AiSummary = {
  projectType: string;
  features: string[];
  totalEstimate: number;
  stack: string;
};

const transition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
};

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

  // AI conversation state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState<AiOption[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedFeatures, setSelectedFeatures] = useState<Array<{ id: string; label: string; price: number }>>([]);

  // Summary / email state (kept from original)
  const [summaryPhase, setSummaryPhase] = useState<SummaryPhase>("idle");
  const [architectText, setArchitectText] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [isPortfolioDiscount, setIsPortfolioDiscount] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const offerPrintRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const discountAmount = isPortfolioDiscount ? Math.round(0.1 * totalPrice) : 0;
  const finalTotal = totalPrice - discountAmount;
  const displayTotal = useCountUp(finalTotal);

  const currencyCode = k.currencyCode as string;

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, currentQuestion, isAiLoading]);

  // Fetch first question on mount
  useEffect(() => {
    fetchAiQuestion([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAiQuestion = useCallback(async (newHistory: HistoryEntry[]) => {
    setIsAiLoading(true);
    setCurrentQuestion("");
    setCurrentOptions([]);
    try {
      const res = await fetch("/api/configurator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory, lang }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();

      if (data.done && data.summary) {
        setAiSummary(data.summary);
        setCurrentQuestion(data.question || "");
        setCurrentOptions([]);
        // Use AI's total estimate
        if (data.summary.totalEstimate) {
          setTotalPrice(data.summary.totalEstimate);
        }
        setSummaryPhase("processing");
      } else {
        setCurrentQuestion(data.question || "");
        setCurrentOptions(data.options || []);
      }
    } catch {
      setCurrentQuestion(
        lang === "PL"
          ? "Przepraszam, wystąpił błąd. Spróbuj odświeżyć stronę."
          : "Sorry, an error occurred. Try refreshing the page."
      );
      setCurrentOptions([]);
    } finally {
      setIsAiLoading(false);
    }
  }, [lang]);

  const handleOptionSelect = useCallback((option: AiOption) => {
    const newEntry: HistoryEntry = {
      question: currentQuestion,
      answer: option.label,
      priceImpact: option.priceImpact || 0,
    };
    const newHistory = [...history, newEntry];
    setHistory(newHistory);

    // Update price
    if (option.priceImpact && option.priceImpact > 0) {
      setTotalPrice((prev) => prev + option.priceImpact!);
      setSelectedFeatures((prev) => [
        ...prev,
        { id: `feat-${Date.now()}`, label: option.label, price: option.priceImpact! },
      ]);
    }

    fetchAiQuestion(newHistory);
  }, [currentQuestion, history, fetchAiQuestion]);

  // Processing terminal for summary generation
  const apiDoneRef = useRef(false);
  const logSequenceCompleteRef = useRef(false);

  const tryTransitionToDone = useCallback(() => {
    if (apiDoneRef.current && logSequenceCompleteRef.current) {
      setSummaryPhase("done");
    }
  }, []);

  const runArchitect = useCallback(async () => {
    apiDoneRef.current = false;
    const config = {
      conversationHistory: history,
      aiSummary,
      totalPrice,
      features: selectedFeatures,
    };
    try {
      const res = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, priceRange: { min: 0, max: totalPrice }, lang }),
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
  }, [history, aiSummary, totalPrice, selectedFeatures, tryTransitionToDone, k.analysisFailed, lang]);

  // Processing phase effects
  const processingStarted = useRef(false);
  const [visibleLogIndex, setVisibleLogIndex] = useState(-1);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

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

  // Email sending (preserved from original)
  const sendToBaluniak = useCallback(async () => {
    setInquirySending(true);
    try {
      const res = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          projectType: aiSummary?.projectType || "AI Configurator",
          budgetRange: { min: 0, max: finalTotal },
          config: {
            conversationHistory: history,
            aiSummary,
            selectedFeatures,
          },
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
  }, [history, aiSummary, selectedFeatures, architectText, finalTotal, clientName, clientEmail, k]);

  const downloadOfferPdf = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  const progressPct =
    summaryPhase !== "idle"
      ? summaryPhase === "processing"
        ? 85
        : 100
      : history.length > 0
        ? Math.min((history.length / 5) * 100, 80)
        : 5;

  // Price summary sidebar content
  const priceSummaryContent = (
    <motion.div layout className="space-y-4">
      <h3 className="text-base font-bold text-white">
        {k.yourConfig}
      </h3>
      {selectedFeatures.length === 0 && totalPrice === 0 ? (
        <p className="text-sm text-zinc-500">{k.selectPathToSeePrice}</p>
      ) : (
        <>
          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {selectedFeatures.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between gap-2 text-sm text-zinc-400"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="shrink-0 tabular-nums">
                    +{formatPrice(item.price, lang, currencyCode)}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="border-t border-zinc-800 pt-4">
            <label className="mb-3 flex cursor-pointer items-start gap-2">
              <input
                type="checkbox"
                checked={isPortfolioDiscount}
                onChange={(e) => setIsPortfolioDiscount(e.target.checked)}
                className="mt-1 size-4 rounded border-zinc-600 accent-emerald-500"
              />
              <span className="text-xs text-zinc-400">{k.portfolioDiscountLabel}</span>
            </label>
            {discountAmount > 0 ? (
              <>
                <p className="text-sm tabular-nums text-zinc-500 line-through">
                  {k.estimatedTotal}: {formatPrice(totalPrice, lang, currencyCode)}
                </p>
                <motion.p
                  key={`${displayTotal}-${lang}`}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="text-2xl font-bold tabular-nums text-emerald-500"
                >
                  {k.estimatedTotal}: {formatPrice(displayTotal, lang, currencyCode)}
                </motion.p>
                <span className="mt-1 inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  {k.savingsBadge.replace("{amount}", String(discountAmount))}
                </span>
              </>
            ) : (
              <motion.p
                key={`${displayTotal}-${lang}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="text-2xl font-bold tabular-nums text-emerald-500"
              >
                {k.estimatedTotal}: {formatPrice(displayTotal, lang, currencyCode)}
              </motion.p>
            )}
          </div>
          <p className="text-xs text-zinc-500">{k.priceDisclaimer}</p>
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
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.1), inset 0 0 15px rgba(16, 185, 129, 0.05); }
          50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.25), inset 0 0 25px rgba(16, 185, 129, 0.1); }
        }
        .ai-btn-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.08) 25%, rgba(16, 185, 129, 0.15) 50%, rgba(16, 185, 129, 0.08) 75%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .ai-btn-glow {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }
      `}</style>
      <div className={cn("mx-auto", summaryPhase === "idle" ? "max-w-6xl" : "max-w-3xl")}>
        <motion.h1 layout className="mb-2 text-2xl font-bold text-zinc-100">
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
        </div>

        {/* Processing Terminal */}
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

        {/* Summary Done */}
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
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                      {k.chosenFeatures}
                    </h3>
                    <ul className="space-y-2">
                      {selectedFeatures.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-2 text-sm text-zinc-300">
                          <span>{item.label}</span>
                          <span className="tabular-nums">+{formatPrice(item.price, lang, currencyCode)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 border-t border-zinc-700 pt-4">
                      <label className="mb-3 flex cursor-pointer items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isPortfolioDiscount}
                          onChange={(e) => setIsPortfolioDiscount(e.target.checked)}
                          className="mt-1 size-4 rounded border-zinc-600 accent-emerald-500"
                        />
                        <span className="text-xs text-zinc-400">{k.portfolioDiscountLabel}</span>
                      </label>
                      {discountAmount > 0 ? (
                        <>
                          <p className="text-sm tabular-nums text-zinc-500 line-through">
                            {k.sumLabel} {formatPrice(totalPrice, lang, currencyCode)}
                          </p>
                          <motion.p
                            key={`final-${displayTotal}-${lang}`}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="text-2xl font-bold tabular-nums text-emerald-400"
                          >
                            {k.sumLabel} {formatPrice(displayTotal, lang, currencyCode)}
                          </motion.p>
                          <span className="mt-1 inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                            {k.savingsBadge.replace("{amount}", String(discountAmount))}
                          </span>
                        </>
                      ) : (
                        <motion.p
                          key={`final-${displayTotal}-${lang}`}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="text-2xl font-bold tabular-nums text-emerald-400"
                        >
                          {k.sumLabel} {formatPrice(displayTotal, lang, currencyCode)}
                        </motion.p>
                      )}
                      <p className="mt-2 text-xs text-zinc-500">{k.billingNote}</p>
                    </div>
                  </div>
                  {aiSummary && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                        {k.recommendedStack}
                      </h3>
                      <p className="text-zinc-200">{aiSummary.stack}</p>
                    </div>
                  )}
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
            {/* Contact form */}
            <div className="rounded-xl border border-white/10 bg-zinc-900/30 px-4 py-4 print:hidden">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {k.contactSectionTitle}
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="kreator-client-name" className="mb-1 block text-xs font-medium text-zinc-500">
                    {k.contactNameLabel} <span className="text-red-400" aria-hidden>*</span>
                  </label>
                  <Input
                    id="kreator-client-name"
                    type="text"
                    value={clientName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
                    placeholder={k.contactNamePlaceholder}
                    className="h-11 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="kreator-client-email" className="mb-1 block text-xs font-medium text-zinc-500">
                    {k.contactEmailLabel} <span className="text-red-400" aria-hidden>*</span>
                  </label>
                  <Input
                    id="kreator-client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientEmail(e.target.value)}
                    placeholder={k.contactEmailPlaceholder}
                    className="h-11 border-zinc-700 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500"
                    autoComplete="email"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500">{k.contactDisclaimer}</p>
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
                disabled={inquirySending || !clientName.trim() || !clientEmail.trim()}
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

        {/* AI Conversation (idle only) */}
        {summaryPhase === "idle" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <Card className="border-white/10 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-zinc-200">
                  <Sparkles className="size-5 text-emerald-500" />
                  AI Architect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conversation history */}
                <div className="space-y-4">
                  {history.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      {/* AI question */}
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                          <Cpu className="size-4 text-emerald-400" />
                        </div>
                        <p className="rounded-xl rounded-tl-sm bg-zinc-800/80 px-4 py-3 text-sm text-zinc-200">
                          {entry.question}
                        </p>
                      </div>
                      {/* User answer */}
                      <div className="flex justify-end">
                        <div className="rounded-xl rounded-tr-sm bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-300">
                          {entry.answer}
                          {entry.priceImpact && entry.priceImpact > 0 && (
                            <span className="ml-2 text-xs text-emerald-500">
                              +{entry.priceImpact} PLN
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Loading state */}
                {isAiLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-xl bg-zinc-800/50 px-4 py-6"
                  >
                    <Loader2 className="size-5 animate-spin text-emerald-500" />
                    <span className="text-sm text-zinc-400">
                      {lang === "PL" ? "AI Architect analizuje..." : "AI Architect analyzing..."}
                    </span>
                  </motion.div>
                )}

                {/* Current question + options */}
                {!isAiLoading && currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transition}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                        <Cpu className="size-4 text-emerald-400" />
                      </div>
                      <p className="rounded-xl rounded-tl-sm bg-zinc-800/80 px-4 py-3 text-sm text-zinc-200">
                        {currentQuestion}
                      </p>
                    </div>

                    {/* Option buttons */}
                    <div className="grid gap-3 pl-10 sm:grid-cols-2">
                      {currentOptions.map((option, i) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => handleOptionSelect(option)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1, ...transition }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "ai-btn-glow relative overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-zinc-800/60 px-4 py-4 text-left transition-colors",
                            "hover:border-emerald-500/70 hover:bg-zinc-800/90",
                            "focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          )}
                        >
                          {/* Shimmer overlay */}
                          <div className="ai-btn-shimmer pointer-events-none absolute inset-0 rounded-xl" />

                          <span className="relative block text-sm font-semibold text-zinc-100">
                            {option.label}
                          </span>
                          {option.priceImpact !== undefined && option.priceImpact > 0 && (
                            <span className="relative mt-1 block text-xs font-medium text-emerald-400">
                              +{option.priceImpact} PLN
                            </span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </CardContent>
            </Card>

            {/* Desktop: sticky price summary sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
              <Card className="border-zinc-800 bg-zinc-950/95 shadow-xl ring-1 ring-white/5">
                <CardContent className="p-6">
                  {priceSummaryContent}
                </CardContent>
              </Card>
            </div>

            {/* Mobile: fixed bottom bar + drawer */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/80 bg-zinc-950/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
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
