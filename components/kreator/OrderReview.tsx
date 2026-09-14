"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, PenLine, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { KreatorCopy } from "@/lib/kreator/content";
import { MAX_NOTE_LENGTH, type ContactDetails, type KreatorAnswer } from "@/lib/kreator/types";


const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function OrderReview({
  copy,
  serviceLabel,
  summary,
  answers,
  sending,
  sendError,
  onBack,
  onSubmit,
}: {
  copy: KreatorCopy;
  serviceLabel: string;
  summary: string;
  answers: KreatorAnswer[];
  sending: boolean;
  sendError: string | null;
  onBack: () => void;
  onSubmit: (contact: ContactDetails, extraNote: string) => void;
}) {
  const [extraOpen, setExtraOpen] = useState(false);
  const [extra, setExtra] = useState("");
  const [contact, setContact] = useState<ContactDetails>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!contact.name.trim()) next.name = copy.errorRequired;
    if (!contact.email.trim()) next.email = copy.errorRequired;
    else if (!EMAIL_RE.test(contact.email.trim())) next.email = copy.errorEmail;
    setErrors(next);
    if (Object.keys(next).length) return;

    onSubmit(
      {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone?.trim() || undefined,
        company: contact.company?.trim() || undefined,
      },
      extra.trim()
    );
  }

  const field =
    "w-full rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
        {copy.summaryTitle}
      </h2>
      <p className="mt-2 text-sm text-zinc-500">{copy.summaryHint}</p>

      {/* Summary */}
      <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-400/80">
          {serviceLabel}
        </p>
        <div className="mt-4 space-y-3.5">
          {summary
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-zinc-200 sm:text-base">
                {paragraph}
              </p>
            ))}
        </div>
      </div>

      {/* Add something */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExtraOpen((v) => !v)}
          className="inline-flex items-center gap-2 py-1.5 text-sm text-emerald-400/90 transition-colors hover:text-emerald-300"
        >
          <PenLine className="size-4 shrink-0" aria-hidden />
          {copy.summaryEdit}
        </button>
        {extraOpen && (
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value.slice(0, MAX_NOTE_LENGTH))}
            rows={3}
            placeholder={copy.summaryEditPlaceholder}
            className="mt-3 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        )}
      </div>

      {/* Answers recap */}
      <details className="group mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40">
        <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-medium text-zinc-300 transition-colors hover:text-zinc-100">
          {copy.yourAnswers}
          <span className="float-right text-zinc-600 transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="space-y-4 border-t border-zinc-800 px-5 py-4">
          {answers.map((a) => (
            <div key={a.questionId}>
              <p className="text-xs text-zinc-500">{a.question}</p>
              {a.selected.length > 0 && (
                <p className="mt-1 text-sm text-zinc-200">{a.selected.join(" · ")}</p>
              )}
              {a.note && (
                <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300">
                  {a.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>

      {/* Contact */}
      <form onSubmit={submit} className="mt-10">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-100">{copy.contactTitle}</h3>
        <p className="mt-1.5 text-sm text-zinc-500">{copy.contactHint}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">{copy.nameLabel}</span>
            <Input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              className={cn(field, errors.name && "border-red-500/60")}
            />
            {errors.name && <span className="mt-1 block text-xs text-red-400">{errors.name}</span>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">{copy.emailLabel}</span>
            <Input
              type="email"
              inputMode="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              className={cn(field, errors.email && "border-red-500/60")}
            />
            {errors.email && <span className="mt-1 block text-xs text-red-400">{errors.email}</span>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">
              {copy.phoneLabel}{" "}
              <span className="text-zinc-600">({copy.phoneOptional})</span>
            </span>
            <Input
              type="tel"
              inputMode="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              placeholder={copy.phonePlaceholder}
              autoComplete="tel"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-zinc-400">
              {copy.companyLabel} <span className="text-zinc-600">({copy.phoneOptional})</span>
            </span>
            <Input
              value={contact.company}
              onChange={(e) => setContact({ ...contact, company: e.target.value })}
              placeholder={copy.companyPlaceholder}
              autoComplete="organization"
              className={field}
            />
          </label>
        </div>

        {sendError && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {sendError}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={sending}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <ChevronLeft className="mr-1 size-4" />
            {copy.back}
          </Button>
          <Button
            type="submit"
            disabled={sending}
            className="ml-auto min-w-44 bg-emerald-600 font-medium hover:bg-emerald-500 disabled:opacity-60"
          >
            {sending ? (
              copy.submitting
            ) : (
              <>
                {copy.submit}
                <Send className="ml-2 size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
