import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getService } from "@/lib/kreator/content";
import { clientEmailHtml, ownerEmailHtml, subjects } from "@/lib/kreator/email";
import { clientKey, isForeignOrigin, rateLimit } from "@/lib/kreator/rate-limit";
import { MAX_ANSWERS_IN_PROMPT, MAX_NOTE_LENGTH, type OrderPayload } from "@/lib/kreator/types";

export const runtime = "nodejs";
export const maxDuration = 20;

const FROM = "Łukasz Bałuniak <lukasz@baluniak.com>";
const OWNER_EMAIL = "lukasz@baluniak.com";

const bodySchema = z.object({
  lang: z.enum(["PL", "EN", "DE"]),
  serviceId: z.enum([
    "website",
    "shop",
    "app",
    "ai",
    "automation",
    "audit",
    "migration",
    "unsure",
  ]),
  answers: z
    .array(
      z.object({
        questionId: z.string().max(64),
        question: z.string().max(300),
        selected: z.array(z.string().max(200)).max(12),
        note: z.string().max(MAX_NOTE_LENGTH).optional(),
      })
    )
    .max(MAX_ANSWERS_IN_PROMPT),
  summary: z.string().max(4000).optional(),
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(180),
    phone: z.string().trim().max(40).optional(),
    company: z.string().trim().max(160).optional(),
  }),
  // Supplied by the browser, so every field is capped and optional — a missing
  // or malformed attribution must never cost us the lead.
  attribution: z
    .object({
      source: z.string().max(120).optional(),
      medium: z.string().max(120).optional(),
      campaign: z.string().max(120).optional(),
      content: z.string().max(120).optional(),
      term: z.string().max(120).optional(),
      clickId: z.string().max(200).optional(),
      referrer: z.string().max(300).optional(),
      landingPath: z.string().max(200).optional(),
      firstSeen: z.string().max(40),
    })
    .optional(),
});

export async function POST(req: Request) {
  if (isForeignOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Sending is far more expensive to abuse than asking, so the window is tighter.
  const limit = rateLimit(clientKey(req, "kreator-submit"), 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests", code: "rate-limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request", code: "invalid" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[kreator/submit] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Mail transport unavailable", code: "transport" }, { status: 503 });
  }

  const order: OrderPayload = {
    ...parsed,
    serviceLabel: getService(parsed.lang, parsed.serviceId)?.label ?? parsed.serviceId,
  };

  const subject = subjects(order);
  const resend = new Resend(apiKey);

  try {
    // The owner copy is the one that must not be lost, so it is awaited first
    // and its failure fails the request. A bounced client confirmation is
    // annoying; a lost lead is not recoverable.
    const owner = await resend.emails.send({
      from: FROM,
      to: OWNER_EMAIL,
      subject: subject.owner,
      html: ownerEmailHtml(order),
      replyTo: order.contact.email,
    });

    if (owner.error) {
      console.error("[kreator/submit] owner email failed:", owner.error);
      return NextResponse.json({ error: "Send failed", code: "transport" }, { status: 502 });
    }

    const confirmation = await resend.emails.send({
      from: FROM,
      to: order.contact.email,
      subject: subject.client,
      html: clientEmailHtml(order),
      replyTo: OWNER_EMAIL,
    });

    // The lead is already safe at this point, so a failed confirmation is
    // reported as success with a flag rather than as an error.
    if (confirmation.error) {
      console.error("[kreator/submit] client confirmation failed:", confirmation.error);
      return NextResponse.json({ success: true, confirmationSent: false });
    }

    return NextResponse.json({ success: true, confirmationSent: true });
  } catch (err) {
    console.error("[kreator/submit]", err);
    return NextResponse.json({ error: "Send failed", code: "transport" }, { status: 500 });
  }
}
