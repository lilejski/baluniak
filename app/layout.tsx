import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/Navbar";
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
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} font-sans min-h-screen bg-zinc-950 text-zinc-100 antialiased`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
