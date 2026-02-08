import { NextResponse } from "next/server";

export const runtime = "edge";

/** Receives config + AI summary and logs them. Replace with email (Resend, SendGrid) when ready. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      config?: unknown;
      priceRange?: { min: number; max: number };
      architectSummary?: string;
    };
    const { config, priceRange, architectSummary } = body;

    // Log for now – in production, send email or save to DB
    console.info("[Inquiry]", {
      config,
      priceRange,
      architectSummaryLength: architectSummary?.length ?? 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Zapytanie zapisane." });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "Nie udało się wysłać zapytania." },
      { status: 500 }
    );
  }
}
