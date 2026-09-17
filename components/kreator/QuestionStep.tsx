"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, PenLine } from "lucide-react";
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
          <span className="text-sm font-medium text-fg-subtle">
            {copy.stepOf.replace("{current}", String(step)).replace("{total}", String(total))}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-accent"
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
          <h2 className="text-h2">
            {question.title}
          </h2>
          {question.hint && <p className="mt-3 text-base text-fg-muted">{question.hint}</p>}

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
                    "group flex min-h-12 items-start gap-3.5 rounded-lg border px-4 py-3.5 text-left transition-colors",
                    isOn
                      ? "border-accent bg-accent-soft"
                      : "border-border bg-surface hover:border-border-strong"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center border transition-all",
                      question.multi ? "rounded-md" : "rounded-full",
                      isOn
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-border-strong text-transparent group-hover:border-fg-subtle"
                    )}
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-base text-fg", isOn && "font-medium")}>
                      {option.label}
                    </span>
                    {option.hint && (
                      <span className="mt-0.5 block text-sm text-fg-subtle">{option.hint}</span>
                    )}
                  </span>
                  <span
                    className="mt-0.5 hidden shrink-0 font-mono text-xs text-fg-subtle sm:block"
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
              className="inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-hover"
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
                    className="field mt-3 resize-y leading-relaxed"
                  />
                  <p className="mt-2 text-sm text-fg-subtle">{copy.ownWordsHint}</p>
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
              >
                <ChevronLeft className="mr-1 size-4" />
                {copy.back}
              </Button>
            )}
            <Button
              type="button"
              onClick={submit}
              disabled={!hasAnswer}
              className="ml-auto min-w-36 disabled:opacity-40"
            >
              {copy.next}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
