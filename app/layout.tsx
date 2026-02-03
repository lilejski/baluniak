import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
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
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
