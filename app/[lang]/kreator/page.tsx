"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CircleCheck, LoaderCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServicePicker } from "@/components/kreator/ServicePicker";
import { QuestionStep } from "@/components/kreator/QuestionStep";
import { OrderReview } from "@/components/kreator/OrderReview";
import { getService, SCRIPT_LENGTH, SERVICES, UI } from "@/lib/kreator/content";
import type {
  ContactDetails,
  KreatorAnswer,
  KreatorQuestion,
  NextStep,
  ServiceId,
} from "@/lib/kreator/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Stage = "service" | "question" | "review" | "done";

/** A question paired with what the visitor answered, so Back costs nothing. */
type HistoryEntry = { question: KreatorQuestion; answer: KreatorAnswer };

export default function KreatorPage() {
  const { lang, localeSegment } = useLanguage();
  const copy = UI[lang];
  const services = SERVICES[lang];

  const [stage, setStage] = useState<Stage>("service");
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [current, setCurrent] = useState<KreatorQuestion | null>(null);
  const [prefill, setPrefill] = useState<{ selected: string[]; note: string }>({
    selected: [],
    note: "",
  });
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(true);

  const topRef = useRef<HTMLDivElement>(null);
  const answers = useMemo(() => history.map((h) => h.answer), [history]);
  const serviceLabel = serviceId ? (getService(lang, serviceId)?.label ?? "") : "";

  const scrollTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /** Ask the server for whatever comes after `nextAnswers`. */
  const advance = useCallback(
    async (service: ServiceId, nextAnswers: KreatorAnswer[]) => {
      setLoading(true);
      try {
        const res = await fetch("/api/kreator/next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, serviceId: service, answers: nextAnswers }),
        });
        if (!res.ok) throw new Error(`next failed: ${res.status}`);
        const step = (await res.json()) as NextStep;

        if (step.done) {
          setSummary(step.summary);
          setCurrent(null);
          setStage("review");
        } else {
          setCurrent(step.question);
          setPrefill({ selected: [], note: "" });
          setStage("question");
        }
      } catch {
        // The server already falls back to its script, so reaching here means
        // the network itself is down. Send them to the review step with what
        // we have rather than trapping them mid-flow.
        setSummary("");
        setCurrent(null);
        setStage("review");
      } finally {
        setLoading(false);
        scrollTop();
      }
    },
    [lang, scrollTop]
  );

  function pickService(id: ServiceId) {
    setServiceId(id);
    setHistory([]);
    void advance(id, []);
  }

  function answerCurrent(selected: string[], note: string) {
    if (!current || !serviceId) return;
    const answer: KreatorAnswer = {
      questionId: current.id,
      question: current.title,
      selected,
      note: note || undefined,
    };
    const nextHistory = [...history, { question: current, answer }];
    setHistory(nextHistory);
    void advance(
      serviceId,
      nextHistory.map((h) => h.answer)
    );
  }

  function goBack() {
    if (history.length === 0) {
      setStage("service");
      setServiceId(null);
      setCurrent(null);
      scrollTop();
      return;
    }
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrent(last.question);
    setPrefill({ selected: last.answer.selected, note: last.answer.note ?? "" });
    setStage("question");
    scrollTop();
  }

  async function submitOrder(contact: ContactDetails, extraNote: string) {
    if (!serviceId) return;
    setSending(true);
    setSendError(null);

    const payloadAnswers: KreatorAnswer[] = extraNote
      ? [
          ...answers,
          {
            questionId: "extra",
            question: lang === "PL" ? "Dodatkowe uwagi" : "Anything else",
            selected: [],
            note: extraNote,
          },
        ]
      : answers;

    try {
      const res = await fetch("/api/kreator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          serviceId,
          answers: payloadAnswers,
          summary: summary || undefined,
          contact,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        confirmationSent?: boolean;
      };
      if (!res.ok || !data.success) throw new Error("submit failed");
      setConfirmationSent(data.confirmationSent !== false);
      setStage("done");
      scrollTop();
    } catch {
      setSendError(copy.errorSend);
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    setStage("service");
    setServiceId(null);
    setHistory([]);
    setCurrent(null);
    setSummary("");
    setSendError(null);
    scrollTop();
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-[max(3rem,env(safe-area-inset-bottom))] text-zinc-100">
      <div ref={topRef} className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3 text-zinc-500 hover:text-zinc-300">
          <Link href={`/${localeSegment}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            baluniak.com
          </Link>
        </Button>

        {stage !== "done" && (
          <header className="mb-10">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-emerald-400/80">
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-100 text-balance sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
              {copy.subtitle}
            </p>

            {serviceId && stage !== "service" && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 py-1 pl-3 pr-1 text-sm">
                <span className="text-zinc-300">{serviceLabel}</span>
                <button
                  type="button"
                  onClick={startOver}
                  className="rounded-full px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {copy.changeService}
                </button>
              </div>
            )}
          </header>
        )}

        {/* Plain conditional rendering, not AnimatePresence: stage swaps here
            replace the whole view, and waiting on exit animations only adds
            latency and a way for the flow to get stuck mid-transition. Each
            stage still animates in via its own key. */}
        <div>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-h-64 flex-col items-center justify-center gap-4 text-center"
            >
              <LoaderCircle className="size-7 animate-spin text-emerald-500" aria-hidden />
              <p className="text-sm text-zinc-500">{copy.thinking}</p>
            </motion.div>
          ) : stage === "service" ? (
            <motion.div key="service" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ServicePicker
                services={services}
                onPick={pickService}
                heading={copy.pickService}
                hint={copy.pickServiceHint}
              />
            </motion.div>
          ) : stage === "question" && current ? (
            <motion.div key="question" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <QuestionStep
                key={`${current.id}-${history.length}`}
                question={current}
                copy={copy}
                step={history.length + 1}
                total={SCRIPT_LENGTH}
                initialSelected={prefill.selected}
                initialNote={prefill.note}
                canGoBack
                onBack={goBack}
                onSubmit={answerCurrent}
              />
            </motion.div>
          ) : stage === "review" ? (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <OrderReview
                copy={copy}
                serviceLabel={serviceLabel}
                summary={summary}
                answers={answers}
                sending={sending}
                sendError={sendError}
                onBack={goBack}
                onSubmit={submitOrder}
              />
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="py-6 text-center"
            >
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <CircleCheck className="size-8 text-emerald-400" aria-hidden />
              </div>
              <h1 className="mt-7 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
                {copy.doneTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
                {copy.doneBody}
              </p>
              {confirmationSent && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-500">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {copy.doneMeta}
                </p>
              )}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
                  <Link href={`/${localeSegment}`}>baluniak.com</Link>
                </Button>
                <Button variant="ghost" onClick={startOver} className="text-zinc-400 hover:text-zinc-200">
                  {copy.startOver}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
