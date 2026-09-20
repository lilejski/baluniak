/**
 * Shared shapes for the Kreator — the guided order builder.
 *
 * The whole flow is deliberately price-free: it collects WHAT the client
 * needs in plain language, never what it costs.
 */

/** Mirrors the site dictionary — the builder speaks every language the site does. */
export type Lang = import("../translations").Language;

/** The service tiles a visitor starts from. */
export type ServiceId =
  | "website"
  | "shop"
  | "app"
  | "ai"
  | "automation"
  | "audit"
  | "migration"
  | "unsure";

export type Service = {
  id: ServiceId;
  /** Short name on the tile. */
  label: string;
  /** One plain-language line — no jargon, no English loanwords. */
  blurb: string;
  /** Lucide icon name, resolved on the client. */
  icon: string;
};

export type KreatorOption = {
  id: string;
  label: string;
  /** Optional clarifier shown under the label. */
  hint?: string;
};

export type KreatorQuestion = {
  id: string;
  title: string;
  hint?: string;
  options: KreatorOption[];
  /** Whether several options can be picked at once. */
  multi: boolean;
};

export type KreatorAnswer = {
  questionId: string;
  question: string;
  /** Labels of the chosen options, in display order. */
  selected: string[];
  /** Whatever the client typed instead of, or alongside, the options. */
  note?: string;
};

/** What `/api/kreator/next` returns. */
export type NextStep =
  | { done: false; question: KreatorQuestion; step: number; totalHint: number }
  | { done: true; summary: string };

export type ContactDetails = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
};

export type OrderPayload = {
  /** Where this visitor first arrived from. Absent when storage was blocked. */
  attribution?: import("../attribution").Attribution;
  lang: Lang;
  serviceId: ServiceId;
  serviceLabel: string;
  answers: KreatorAnswer[];
  summary?: string;
  contact: ContactDetails;
};

/** Hard ceilings — these bound both the prompt size and the AI spend. */
export const MAX_QUESTIONS = 6;
export const MAX_NOTE_LENGTH = 1200;
export const MAX_ANSWERS_IN_PROMPT = 12;
