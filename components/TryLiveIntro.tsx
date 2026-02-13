"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function TryLiveIntro() {
  const { t, mounted } = useLanguage();

  if (!mounted) {
    return (
      <div className="relative z-10 mx-auto max-w-2xl px-5 pt-8 pb-4 text-center sm:px-6 sm:pt-12 sm:pb-6">
        <div className="mb-2 h-7 w-48 animate-pulse rounded bg-zinc-700/50 mx-auto sm:h-8 sm:w-56" aria-hidden />
        <div className="h-4 w-full max-w-md animate-pulse rounded bg-zinc-700/30 mx-auto sm:h-5" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-5 pt-8 pb-4 text-center sm:px-6 sm:pt-12 sm:pb-6">
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
        {t("tryLive.title")}
      </h2>
      <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
        {t("tryLive.desc")}
      </p>
    </div>
  );
}
