"use client";

import { useEffect, useState } from "react";

const AGENTS = ["ERBSBUNDE", "KIWI", "ZEPHYR", "ORCHESTRATOR - SABER"];

/**
 * The flickering neon sign lifted from the Quantum OM command centre.
 * The original is fixed to the dashboard's bottom-right corner; here it sits
 * inline in the case study so the project keeps its own visual signature.
 */
export function SeeleNeon() {
  const [agentIndex, setAgentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setAgentIndex((i) => (i + 1) % AGENTS.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center gap-6 overflow-hidden rounded-xl border border-zinc-800 bg-black px-6 py-8 select-none"
      aria-hidden="true"
    >
      {/* faint scanline wash, so the sign reads as a screen rather than a graphic */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative flex flex-col items-end">
        <div
          className="seele-flicker font-mono font-black uppercase tracking-[0.3em]"
          style={{
            fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
            color: "#ff4500",
            textShadow:
              "0 0 10px #ff4500, 0 0 20px #ff4500, 0 0 40px #f97316, 0 0 80px rgba(249,115,22,0.4)",
            lineHeight: 1,
          }}
        >
          SEELE
        </div>

        <div
          className="mt-1 font-mono text-[0.6rem] uppercase sm:text-xs"
          style={{
            color: "#00f3ff",
            opacity: visible ? 1 : 0,
            textShadow: "0 0 8px #00f3ff, 0 0 16px rgba(0,243,255,0.5)",
            transition: "opacity 400ms ease",
            letterSpacing: "0.4em",
          }}
        >
          {AGENTS[agentIndex]}
        </div>

        <div
          className="mt-2 h-px w-full"
          style={{
            background:
              "linear-gradient(to left, rgba(255,69,0,0.6), rgba(249,115,22,0.2), transparent)",
          }}
        />
      </div>

      <div
        className="relative text-2xl sm:text-3xl"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          color: "rgb(136, 19, 55)",
          opacity: 0.25,
          letterSpacing: "0.1em",
          lineHeight: 1.2,
          fontFamily: "'Noto Serif JP', serif",
        }}
      >
        制御システム
      </div>
    </div>
  );
}
