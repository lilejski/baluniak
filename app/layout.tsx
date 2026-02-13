import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
            background: `
              radial-gradient(
                ellipse 140% 90% at 50% -10%,
                rgba(15,23,42,0.95) 0%,
                rgba(15,23,42,0.7) 40%,
                transparent 65%
              ),
              radial-gradient(
                ellipse 130% 80% at 50% 120%,
                rgba(0,0,0,0.95) 0%,
                rgba(0,0,0,0.7) 45%,
                transparent 75%
              ),
              radial-gradient(circle at 15% 0%, rgba(56,189,248,0.16), transparent 55%),
              radial-gradient(circle at 85% 100%, rgba(245,158,11,0.18), transparent 55%)
            `,
          }}
        />
        {/* Content above background */}
        <div className="relative z-10">
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
          <Analytics />
        </div>
        {/* Film/retro grain overlay: fixed on top of whole page, pointer-events-none */}
        <GrainTexture opacity={0.06} className="z-[100]" />
      </body>
    </html>
  );
}
