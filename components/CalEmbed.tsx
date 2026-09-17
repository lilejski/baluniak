"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const CAL_ORIGIN = "https://cal.com";
const CAL_LINK = "łukasz-bałuniak-wafkto/30min";
const PRIMARY_COLOR = "#3DCB8B";

type CalEmbedProps = {
  fallbackMessage: string;
  fallbackEmail: string;
};

function CalEmbedFallback({ message, email }: { message: string; email: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-md border border-border bg-surface-2 p-6 text-center">
      <p className="text-[0.9375rem] text-fg-muted">{message}</p>
      <a
        href={`mailto:${email}`}
        className="link-inline"
      >
        {email}
      </a>
    </div>
  );
}

export function CalEmbed({ fallbackMessage, fallbackEmail }: CalEmbedProps) {
  const { lang } = useLanguage();
  const calLocale = lang === "PL" ? "pl" : "en";

  const [mounted, setMounted] = useState(false);
  const [loadError, setLoadError] = useState(false);
  type CalComponentProps = {
    calLink: string;
    calOrigin: string;
    config?: {
      theme?: string;
      primaryColor?: string;
      locale?: string;
      hideEventTypeDetails?: boolean;
    };
  };
  const [CalComponent, setCalComponent] = useState<React.ComponentType<CalComponentProps> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    import("@calcom/embed-react")
      .then((mod) => {
        if (!cancelled) setCalComponent(() => mod.default as React.ComponentType<CalComponentProps>);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div
        className="min-h-[700px] w-full animate-pulse bg-surface-2"
        style={{ minHeight: "700px" }}
        aria-hidden
      />
    );
  }

  if (loadError) {
    return <CalEmbedFallback message={fallbackMessage} email={fallbackEmail} />;
  }

  if (!CalComponent) {
    return (
      <div
        className="min-h-[700px] w-full animate-pulse bg-surface-2"
        style={{ minHeight: "700px" }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="cal-embed-container min-h-[700px] w-full overflow-auto [&_iframe]:min-h-[700px] [&_iframe]:w-full"
      style={{ minHeight: "700px" }}
    >
      <CalComponent
        key={lang}
        calLink={CAL_LINK}
        calOrigin={CAL_ORIGIN}
        config={{
          theme: "dark",
          primaryColor: PRIMARY_COLOR,
          locale: calLocale,
          hideEventTypeDetails: false,
        }}
      />
    </div>
  );
}
