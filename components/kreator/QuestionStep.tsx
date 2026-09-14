"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_NOTE_LENGTH, type KreatorQuestion } from "@/lib/kreator/types";
import type { KreatorCopy } from "@/lib/kreator/content";


export function QuestionStep({
  question,
  copy,
  step,
  total,
  initialSelected,
  initialNote,
  canGoBack,
  onBack,
  onSubmit,
}: {
  question: KreatorQuestion;
  copy: KreatorCopy;
  step: number;
  total: number;
  initialSelected: string[];
  initialNote: string;
  canGoBack: boolean;
  onBack: () => void;
  onSubmit: (selected: string[], note: string) => void;
}) {
  // The parent remounts this component per question (via `key`), so props
  // only ever seed the initial state — no prop-to-state syncing effect needed.
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [note, setNote] = useState(initialNote);
  const [noteOpen, setNoteOpen] = useState(Boolean(initialNote));
  const [touched, setTouched] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (noteOpen) noteRef.current?.focus();
  }, [noteOpen]);

  const hasAnswer = selected.length > 0 || note.trim().length > 0;

  function toggle(label: string) {
    setTouched(false);
    setSelected((current) => {
      if (question.multi) {
        return current.includes(label)
          ? current.filter((l) => l !== label)
          : [...current, label];
      }
      return current.includes(label) ? [] : [label];
    });
  }

  function submit() {
    if (!hasAnswer) {
      setTouched(true);
      return;
    }
    onSubmit(selected, note.trim());
  }

  // Number keys pick options; Enter moves on. Costs nothing and makes the
  // whole thing feel quick to anyone who keeps their hands on the keyboard.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        return;
      }
      if (e.key >= "1" && e.key <= "9") {
        const index = Number(e.key) - 1;
        const option = question.options[index];
        if (option) {
          e.preventDefault();
          toggle(option.label);
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
            {copy.stepOf.replace("{current}", String(step)).replace("{total}", String(total))}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={false}
            animate={{ width: `${(step / total) * 100}%` }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-zinc-100 text-balance sm:text-3xl">
            {question.title}
          </h2>
          {question.hint && <p className="mt-3 text-sm text-zinc-500">{question.hint}</p>}

          <div className="mt-7 grid gap-2.5">
            {question.options.map((option, index) => {
              const isOn = selected.includes(option.label);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggle(option.label)}
                  aria-pressed={isOn}
                  className={cn(
                    "group flex items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                    isOn
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-all",
                      question.multi ? "rounded-md" : "rounded-full",
                      isOn
                        ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                        : "border-zinc-600 text-transparent group-hover:border-zinc-500"
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", isOn ? "text-zinc-50" : "text-zinc-200")}>
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="mt-0.5 block text-xs text-zinc-500">{option.hint}</span>
                    )}
                  </span>
                  <span
                    className="mt-0.5 hidden shrink-0 font-mono text-[0.65rem] text-zinc-600 sm:block"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>

          {/* The escape hatch — always available, never buried */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setNoteOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm text-emerald-400/90 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              <PenLine className="size-4 shrink-0" aria-hidden />
              {noteOpen ? copy.ownWordsToggleOpen : copy.ownWordsToggle}
            </button>

            <AnimatePresence initial={false}>
              {noteOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <textarea
                    ref={noteRef}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value.slice(0, MAX_NOTE_LENGTH));
                      setTouched(false);
                    }}
                    rows={4}
                    placeholder={copy.ownWordsPlaceholder}
                    className="mt-3 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="mt-2 text-xs text-zinc-600">{copy.ownWordsHint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {touched && !hasAnswer && (
            <p className="mt-4 text-sm text-amber-400">{copy.chooseAtLeastOne}</p>
          )}

          <div className="mt-8 flex items-center gap-3">
            {canGoBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <ChevronLeft className="mr-1 size-4" />
                {copy.back}
              </Button>
            )}
            <Button
              type="button"
              onClick={submit}
              disabled={!hasAnswer}
              className="ml-auto min-w-36 bg-emerald-600 font-medium hover:bg-emerald-500 disabled:opacity-40"
            >
              {copy.next}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
