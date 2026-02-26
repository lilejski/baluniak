"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Send, Zap, Rocket, Code, LayoutTemplate, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function KreatorCTA() {
  const { dict, localeSegment } = useLanguage();
  const k = dict.kreator as {
    ctaHeadlineStart?: string;
    ctaHeadlineHighlight?: string;
    ctaSubtext?: string;
    ctaTopic1Title?: string;
    ctaTopic1Desc?: string;
    ctaTopic2Title?: string;
    ctaTopic2Desc?: string;
    ctaTopic3Title?: string;
    ctaTopic3Desc?: string;
    ctaTopic4Title?: string;
    ctaTopic4Desc?: string;
    ctaInputPlaceholder?: string;
    ctaFreeQuote?: string;
    ctaModalTitle?: string;
    ctaModalSubtext?: string;
    ctaModalEmailPlaceholder?: string;
    ctaModalSubmit?: string;
  };

  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefEmail, setBriefEmail] = useState("");
  const [briefSending, setBriefSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendBrief = async () => {
    setBriefSending(true);
    // TODO: podepnij API np. fetch('/api/send-workshop-brief', { method: 'POST', body: JSON.stringify({ email: briefEmail, message }) })
    await new Promise((r) => setTimeout(r, 2000));
    setBriefSending(false);
    setBriefModalOpen(false);
    setBriefEmail("");
  };

  const topics = [
    { id: 1, icon: LayoutTemplate, title: k.ctaTopic1Title ?? "Strona Wizytówka", desc: k.ctaTopic1Desc ?? "Nowoczesna, ultraszybka strona" },
    { id: 2, icon: Code, title: k.ctaTopic2Title ?? "Aplikacja Webowa", desc: k.ctaTopic2Desc ?? "Zaawansowany system lub portal" },
    { id: 3, icon: Rocket, title: k.ctaTopic3Title ?? "MVP od zera", desc: k.ctaTopic3Desc ?? "Szybki start dla Twojego startupu" },
    { id: 4, icon: Zap, title: k.ctaTopic4Title ?? "Migracja na Next.js", desc: k.ctaTopic4Desc ?? "Większa wydajność i lepsze SEO" },
  ];

  return (
    <section
      id="kreator"
      className="relative scroll-mt-20 border-t border-zinc-800/80 w-full font-sans my-24 px-4 sm:px-6"
      aria-labelledby="kreator-cta-heading"
    >
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Tło - Mistyczny Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" aria-hidden />

        <div className="relative rounded-[2rem] bg-zinc-950/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.08] backdrop-blur-2xl p-6 sm:p-10 overflow-hidden">
          <div className="text-center mb-10">
            <h2 id="kreator-cta-heading" className="text-3xl font-light tracking-tight text-white mb-3">
              {k.ctaHeadlineStart ?? "Rozpocznijmy "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-pulse">
                {k.ctaHeadlineHighlight ?? "nowy projekt."}
              </span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              {k.ctaSubtext ?? "Wybierz temat i opisz krótko swój pomysł, a ja zajmę się resztą."}
            </p>
          </div>

          {/* Pływające kafelki z opcjami */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {topics.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.02] p-5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.05] backdrop-blur-md transition-all duration-300 ease-out hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none" aria-hidden />
                  <div className="relative mt-0.5 text-zinc-500 group-hover:text-indigo-400 transition-colors duration-300">
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="relative">
                    <h3 className="text-zinc-200 font-medium mb-1 group-hover:text-white transition-colors">{t.title}</h3>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Input & Główny Przycisk CTA */}
          <div className="flex flex-col sm:flex-row gap-4 items-center relative z-10">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={k.ctaInputPlaceholder ?? "Napisz mi krótko o swoim pomyśle..."}
                className="w-full h-14 pl-6 pr-14 rounded-full bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-500 outline-none ring-1 ring-white/[0.05] focus:ring-white/[0.2] focus:bg-zinc-900/80 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                aria-label={k.ctaInputPlaceholder ?? "Opisz swój pomysł"}
              />
              <Link
                href={`/${localeSegment}/wspolpraca`}
                className="absolute right-2 top-2 bottom-2 w-10 bg-white/[0.05] hover:bg-white/[0.1] rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors duration-300"
                aria-label="Wyślij"
              >
                <Send className="w-4 h-4" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setBriefModalOpen(true)}
              className="group relative h-14 px-8 rounded-full bg-zinc-950 text-white font-medium transition-all duration-300 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.6),0_0_0_1px_rgba(139,92,246,0.6)] flex items-center gap-2 overflow-hidden w-full sm:w-auto justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" aria-hidden />
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors shrink-0" aria-hidden />
              <span className="relative z-10">{k.ctaFreeQuote ?? "Darmowa wycena"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Wyceny (Glassmorphism) */}
      {briefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="brief-modal-title">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setBriefModalOpen(false)} aria-hidden />
          <div className="relative w-full max-w-md bg-zinc-900/90 rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setBriefModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-lg"
              aria-label="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id="brief-modal-title" className="text-xl font-medium text-white mb-2">
              {k.ctaModalTitle ?? "Gdzie wysłać wycenę?"}
            </h3>
            <p className="text-sm text-zinc-400 mb-8">
              {k.ctaModalSubtext ?? "Podaj swój adres email, na który wyślę bezpłatną estymację oraz dalsze kroki."}
            </p>

            <div className="space-y-4">
              <input
                type="email"
                value={briefEmail}
                onChange={(e) => setBriefEmail(e.target.value)}
                placeholder={k.ctaModalEmailPlaceholder ?? "twoj@email.com"}
                className="w-full h-12 px-4 rounded-xl bg-zinc-950/50 text-zinc-100 placeholder:text-zinc-500 outline-none ring-1 ring-white/[0.1] focus:ring-indigo-500/50 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                autoFocus
                disabled={briefSending}
                aria-label="Email"
              />
              <button
                type="button"
                onClick={handleSendBrief}
                disabled={!briefEmail.trim() || briefSending}
                className="w-full h-12 rounded-xl bg-white text-black font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                {briefSending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" aria-hidden />
                ) : (
                  <>
                    {k.ctaModalSubmit ?? "Wyślij zapytanie"}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
