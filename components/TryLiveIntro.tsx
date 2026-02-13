"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function TryLiveIntro() {
  const { dict } = useLanguage();
  const t = dict.tryLive;

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-5 pt-8 pb-4 text-center sm:px-6 sm:pt-12 sm:pb-6">
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        {t.title}
      </h2>
      <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
        {t.desc}
      </p>
    </div>
  );
}
