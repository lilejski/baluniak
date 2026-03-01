import { Inter, Roboto_Mono } from "next/font/google";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { GrainTexture } from "@/components/GrainTexture";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "latin-ext"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans min-h-screen bg-background text-foreground antialiased`}
      >
        <BackgroundGrid color="39, 39, 42" opacity={0.15} variant="lines" />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 140% 90% at 50% -10%, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.6) 40%, transparent 65%),
              radial-gradient(ellipse 130% 80% at 50% 120%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, transparent 75%),
              radial-gradient(circle at 15% 0%, rgba(16,185,129,0.12), transparent 55%),
              radial-gradient(circle at 85% 100%, rgba(16,185,129,0.08), transparent 55%)
            `,
          }}
        />
        <div className="relative z-10">{children}</div>
        <GrainTexture opacity={0.06} className="z-[100]" />
      </body>
    </html>
  );
}
