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
  Lang,
  NextStep,
  ServiceId,
} from "@/lib/kreator/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { readAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

type Stage = "service" | "question" | "review" | "done";

/** A question paired with what the visitor answered, so Back costs nothing. */
type HistoryEntry = { question: KreatorQuestion; answer: KreatorAnswer };

/** Carries the server's reason for a failed send, so the message can fit it. */
class SubmitError extends Error {
  constructor(readonly code?: "rate-limited" | "transport" | "invalid") {
    super("submit failed");
  }
}

/** Label for whatever the visitor adds beyond the questions. */
const EXTRA_NOTE_LABEL: Record<Lang, string> = {
  PL: "Dodatkowe uwagi",
  EN: "Anything else",
  DE: "Ergänzende Hinweise",
};

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
          track("kreator_review", { service, steps: nextAnswers.length, has_summary: Boolean(step.summary) });
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
        track("kreator_review", { service, steps: nextAnswers.length, has_summary: false });
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
    track("kreator_start", { service: id });
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
    // The step number is what makes the drop-off visible: a funnel of
    // start → step 1 … n → review → generate_lead shows where people leave.
    track("kreator_step", { service: serviceId, step: nextHistory.length });
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
            question: EXTRA_NOTE_LABEL[lang],
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
          attribution: readAttribution() ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        confirmationSent?: boolean;
        code?: "rate-limited" | "transport" | "invalid";
      };
      if (!res.ok || !data.success) {
        // The reason matters to the visitor: "try again" is useless advice
        // when the mail transport is down, and wrong when they simply sent
        // too many in a row.
        console.error("[kreator] submit failed", res.status, data.code ?? "unknown");
        throw new SubmitError(data.code);
      }
      setConfirmationSent(data.confirmationSent !== false);
      setStage("done");
      // GA4's recommended lead event, so it can be marked as a key event as-is.
      track("generate_lead", { form: "kreator", service: serviceId });
      scrollTop();
    } catch (err) {
      const code = err instanceof SubmitError ? err.code : undefined;
      setSendError(
        code === "rate-limited"
          ? copy.errorSendBusy
          : code === "transport"
          ? copy.errorSendUnavailable
          : copy.errorSend
      );
      track("kreator_submit_error", { service: serviceId, reason: code ?? "unknown" });
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
    <div className="min-h-screen bg-bg pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div ref={topRef} className="container-article page-top">
        <Button variant="ghost" size="sm" asChild className="-ml-4 mb-8">
          <Link href={`/${localeSegment}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            baluniak.com
          </Link>
        </Button>

        {stage !== "done" && (
          <header className="mb-10">
            <p className="eyebrow-muted">
              {copy.eyebrow}
            </p>
            <h1 className="text-h1 mt-3">
              {copy.title}
            </h1>
            <p className="text-lead mt-4 text-fg-muted">
              {copy.subtitle}
            </p>

            {serviceId && stage !== "service" && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface py-1 pl-3 pr-1 text-sm">
                <span className="text-fg">{serviceLabel}</span>
                <button
                  type="button"
                  onClick={startOver}
                  className="min-h-9 rounded-sm px-2.5 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
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
              <LoaderCircle className="size-7 animate-spin text-accent" aria-hidden />
              <p className="text-base text-fg-muted">{copy.thinking}</p>
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
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-border-strong">
                <CircleCheck className="size-8 text-accent" strokeWidth={1.5} aria-hidden />
              </div>
              <h1 className="text-h1 mt-7">
                {copy.doneTitle}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted">
                {copy.doneBody}
              </p>
              {confirmationSent && (
                <p className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm text-fg-muted">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {copy.doneMeta}
                </p>
              )}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild>
                  <Link href={`/${localeSegment}`}>baluniak.com</Link>
                </Button>
                <Button variant="ghost" onClick={startOver}>
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
