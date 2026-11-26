"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Gamepad2, Maximize2, Minimize2, RotateCcw } from "lucide-react";

export function SpaceShootaPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be unavailable on some mobile browsers (e.g. iOS Safari)
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#040310] text-fg">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#070618]/90 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-cyan-400/40 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>baluniak.com</span>
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            <Gamepad2 className="hidden h-4 w-4 shrink-0 text-cyan-400 sm:block" />
            <span className="truncate font-display text-sm font-semibold tracking-tight text-fg sm:text-base">
              Space Shoota
            </span>
            <span className="hidden rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-cyan-300 sm:inline-block">
              WEB DEMO
            </span>
            <a
              href="/games/spaceshoota/SupaShootav5.apk"
              download="SupaShootav5.apk"
              title="Pobierz SupaShootav5.apk (Android)"
              aria-label="Pobierz APK SupaShootav5.apk"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-emerald-200 transition-colors hover:border-emerald-300/70 hover:bg-emerald-400/25 sm:text-[11px]"
            >
              <Download className="h-3 w-3 shrink-0" />
              <span>POBIERZ APK</span>
            </a>
          </div>
        </div>

        <div className="hidden items-center text-xs text-fg-muted md:flex">
          <span>Mysz / Dotyk / A-D &bull; ESC pauza</span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            title="Restart gry"
            aria-label="Restart gry"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-cyan-400/40 hover:text-fg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
            aria-label={isFullscreen ? "Wyjdź z pełnego ekranu" : "Pełny ekran"}
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Wyjdź</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Pełny ekran</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex min-h-0 w-full flex-1 items-center justify-center sm:p-4">
        <div
          ref={containerRef}
          className={
            isFullscreen
              ? "h-full w-full overflow-hidden bg-[#040310]"
              : "h-full w-full overflow-hidden bg-[#040310] sm:aspect-[9/16] sm:h-full sm:max-h-[920px] sm:w-auto sm:rounded-2xl sm:border sm:border-cyan-400/25 sm:shadow-[0_0_60px_rgba(0,229,255,0.14)]"
          }
        >
          <iframe
            key={reloadKey}
            src="/games/spaceshoota/index.html"
            title="Space Shoota"
            allow="autoplay; fullscreen; gamepad"
            allowFullScreen
            className="h-full w-full border-0 bg-[#040310]"
          />
        </div>
      </main>
    </div>
  );
}
