import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Baluniak.com - Portfolio',
  description: 'Moje portfolio i projekty',
};

// Headings. Variable font: one file covers the 600 and 700 weights used.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Body, UI, navigation, buttons and forms.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Code in articles and small numbers only.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable} min-h-screen bg-bg font-sans text-fg antialiased`}
      >
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
