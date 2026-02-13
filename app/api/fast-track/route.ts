import { NextResponse } from "next/server";

export const runtime = "edge";

type FastTrackBody = {
  name?: string;
  email?: string;
  projectType?: string;
  message?: string;
};

/** Receives Fast-Track form. Log for now; replace with email/CRM when ready. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FastTrackBody;
    const { name, email, projectType, message } = body;

    console.info("[Fast-Track]", {
      name,
      email,
      projectType,
      messageLength: message?.length ?? 0,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Zgłoszenie wysłane." });
  } catch (error) {
    console.error("Fast-Track API error:", error);
    return NextResponse.json(
      { error: "Nie udało się wysłać zgłoszenia." },
      { status: 500 }
    );
  }
}
