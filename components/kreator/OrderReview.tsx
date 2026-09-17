"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, PenLine } from "lucide-react";
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
    "w-full";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-h2">
        {copy.summaryTitle}
      </h2>
      <p className="mt-2 text-base text-fg-muted">{copy.summaryHint}</p>

      {/* Summary */}
      <div className="card mt-6 p-5 md:p-7">
        <p className="eyebrow">
          {serviceLabel}
        </p>
        <div className="mt-4 space-y-3.5">
          {summary
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-fg">
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
          className="inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-accent transition-colors hover:text-accent-hover"
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
            className="field mt-3 resize-y leading-relaxed"
          />
        )}
      </div>

      {/* Answers recap */}
      <details className="card group mt-6">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-[0.9375rem] font-medium text-fg-muted transition-colors hover:text-fg">
          {copy.yourAnswers}
          <span className="text-fg-subtle transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="space-y-4 border-t border-border px-5 py-4">
          {answers.map((a) => (
            <div key={a.questionId}>
              <p className="text-sm text-fg-subtle">{a.question}</p>
              {a.selected.length > 0 && (
                <p className="mt-1 text-base text-fg">{a.selected.join(" · ")}</p>
              )}
              {a.note && (
                <p className="mt-1.5 whitespace-pre-wrap rounded-md bg-surface-2 px-3 py-2 text-base text-fg-muted">
                  {a.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </details>

      {/* Contact */}
      <form onSubmit={submit} className="mt-10">
        <h3 className="text-h3">{copy.contactTitle}</h3>
        <p className="mt-1.5 text-base text-fg-muted">{copy.contactHint}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="field-label">{copy.nameLabel}</span>
            <Input
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              className={cn(field, errors.name && "border-red-500/60")}
            />
            {errors.name && <span className="mt-1.5 block text-sm text-red-400">{errors.name}</span>}
          </label>

          <label className="block">
            <span className="field-label">{copy.emailLabel}</span>
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
            {errors.email && <span className="mt-1.5 block text-sm text-red-400">{errors.email}</span>}
          </label>

          <label className="block">
            <span className="field-label">
              {copy.phoneLabel}{" "}
              <span className="text-fg-subtle">({copy.phoneOptional})</span>
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
            <span className="field-label">
              {copy.companyLabel} <span className="text-fg-subtle">({copy.phoneOptional})</span>
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
          <p className="mt-5 rounded-md border border-red-500/30 bg-red-950/20 px-4 py-3 text-[0.9375rem] text-red-300">
            {sendError}
          </p>
        )}

        <div className="mt-8 flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={sending}
          >
            <ChevronLeft className="mr-1 size-4" />
            {copy.back}
          </Button>
          <Button
            type="submit"
            disabled={sending}
            className="ml-auto min-w-44 disabled:opacity-60"
          >
            {sending ? (
              copy.submitting
            ) : (
              <>
                {copy.submit}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
