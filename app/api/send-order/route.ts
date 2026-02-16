import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateEmailHtml, type OrderEmailData } from "@/lib/email-template";

const FROM = "onboarding@resend.dev";
const TO = "l.baluniak@gmail.com";

type SendOrderBody = {
  clientName?: string;
  clientEmail?: string;
  projectType?: string;
  budgetRange?: { min: number; max: number };
  config?: unknown;
  architectSummary?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendOrderBody;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[send-order] Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Konfiguracja email nie jest ustawiona." },
        { status: 500 }
      );
    }

    const clientName = body.clientName ?? "Nie podano";
    const clientEmail = body.clientEmail ?? "Nie podano";
    const projectType = body.projectType ?? "Kreator";
    const subject = `Nowy Lead: ${projectType} od ${clientName}.`;

    const emailData: OrderEmailData = {
      clientName,
      clientEmail,
      projectType,
      budgetRange: body.budgetRange,
      selectedFeatures: body.config,
      architectSummary: body.architectSummary,
    };

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      subject,
      html: generateEmailHtml(emailData),
    });

    if (error) {
      console.error("[send-order] Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Nie udało się wysłać wiadomości." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-order]", err);
    return NextResponse.json(
      { error: "Nie udało się wysłać zapytania." },
      { status: 500 }
    );
  }
}
