import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Współpraca — Fast-Track | Product Engineer | BALUNIAK",
  description:
    "Zacznijmy budować. Wybierz termin w kalendarzu lub zostaw wiadomość. Od startu Twojego projektu dzieli Cię 30 sekund.",
};

export default function WspolpracaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
