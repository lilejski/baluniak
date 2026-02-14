import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isPl = lang === "pl";
  return {
    title: isPl
      ? "Współpraca — Fast-Track | Product Engineer | BALUNIAK"
      : "Collaboration — Fast-Track | Product Engineer | BALUNIAK",
    description: isPl
      ? "Zacznijmy budować. Wybierz termin w kalendarzu lub zostaw wiadomość. Od startu Twojego projektu dzieli Cię 30 sekund."
      : "Let's build. Pick a slot in the calendar or leave a message. You're 30 seconds away from starting your project.",
  };
}

export default function WspolpracaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
