import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/Navbar";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { GrainTexture } from "@/components/GrainTexture";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "baluniak",
  description: "Projekty, sklep, współpraca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        {/* Background layer: grid + vignette (z-0, behind everything) */}
        <BackgroundGrid opacity={0.2} variant="lines" />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        {/* Content above background */}
        <div className="relative z-10">
          <Navbar />
          <main className="pt-16">{children}</main>
          <Analytics />
        </div>
        {/* Film/retro grain overlay: fixed on top of whole page, pointer-events-none */}
        <GrainTexture opacity={0.06} className="z-[100]" />
      </body>
    </html>
  );
}
