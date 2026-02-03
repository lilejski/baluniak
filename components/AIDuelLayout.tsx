"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

const LETTER_DELAY_MS = 20;

function getAssistantTextContent(
  messages: { role: string; parts?: Array<{ type: string; text?: string }> }[]
): string {
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (!lastAssistant?.parts) return "";
  return lastAssistant.parts
    .filter(
      (p): p is { type: string; text: string } =>
        p.type === "text" && typeof p.text === "string"
    )
    .map((p) => p.text)
    .join("");
}

function parseDuelJson(raw: string): { dev: string; biz: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "dev" in parsed &&
      "biz" in parsed &&
      typeof (parsed as { dev: unknown }).dev === "string" &&
      typeof (parsed as { biz: unknown }).biz === "string"
    ) {
      return {
        dev: (parsed as { dev: string }).dev,
        biz: (parsed as { biz: string }).biz,
      };
    }
  } catch {
    // Fallback
  }
  return null;
}

function useTypewriter(text: string, enabled: boolean) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled || !text || displayed.length >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed((prev) => text.slice(0, prev.length + 1));
    }, LETTER_DELAY_MS);
    return () => clearTimeout(t);
  }, [text, enabled, displayed]);
  return enabled ? displayed : text;
}

function FrequencyBar({ active }: { active: boolean }) {
  const bars = 12;
  return (
    <div className="flex h-full w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 bg-black/80 py-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-sm bg-emerald-500"
          animate={{
            height: active ? [4, 24, 8, 20, 4] : [6, 10, 6],
            opacity: active ? [0.9, 1, 0.7, 1, 0.9] : [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.05,
          }}
          style={{ height: 8 }}
        />
      ))}
    </div>
  );
}

export default function AIDuelLayout() {
  const [input, setInput] = useState("");
  const [devResponse, setDevResponse] = useState("");
  const [bizResponse, setBizResponse] = useState("");
  const [showTypewriter, setShowTypewriter] = useState(true);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const rawContent = useMemo(
    () => getAssistantTextContent(messages),
    [messages]
  );
  const parsed = useMemo(() => parseDuelJson(rawContent), [rawContent]);

  useEffect(() => {
    if (parsed) {
      setDevResponse(parsed.dev);
      setBizResponse(parsed.biz);
      setShowTypewriter(true);
    }
  }, [parsed]);

  useEffect(() => {
    if (isLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        setDevResponse("ANALYZING ARCHITECTURE...");
        setBizResponse("CALCULATING ROI...");
        setShowTypewriter(false);
      }
    }
  }, [messages, isLoading]);

  const devDisplayed = useTypewriter(devResponse, showTypewriter && !!devResponse);
  const bizDisplayed = useTypewriter(bizResponse, showTypewriter && !!bizResponse);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const value = input.trim();
      if (!value || isLoading) return;
      sendMessage({ text: value });
      setInput("");
    },
    [input, isLoading, sendMessage]
  );

  const connectionError = !!error;

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] font-[var(--font-vt323)] text-lg text-[#c0ff00]"
      style={{ fontFamily: "var(--font-vt323), monospace" }}
    >
      {/* CRT Scanlines overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        }}
      />

      {/* CONNECTION ERROR glitch */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [1, 0.9, 1],
            x: [0, -2, 2, 0],
            textShadow: [
              "0 0 0 #c0ff00",
              "2px 0 0 #ff0040",
              "-2px 0 0 #00ffff",
              "0 0 0 #c0ff00",
            ],
          }}
          transition={{ duration: 0.15, repeat: Infinity }}
          className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded border border-red-500/80 bg-black/95 px-6 py-3 font-[var(--font-vt323)] text-xl tracking-widest text-red-400"
        >
          CONNECTION ERROR
        </motion.div>
      )}

      {/* Split screen: Left | Frequency | Right */}
      <div className="relative z-10 flex flex-1 flex-col md:flex-row">
        {/* LEFT PANEL - DEV (Snake / Green) */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-1 flex-col border-r border-emerald-500/30 bg-[#061006] p-4 md:p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-20 w-20 flex-shrink-0 rounded border-2 border-emerald-500/60 bg-emerald-950/80 md:h-28 md:w-28" />
            <div>
              <p className="text-emerald-400/90 text-xl tracking-widest md:text-2xl">
                DEV
              </p>
              <p className="text-emerald-600 text-xs">CODEC CHANNEL</p>
            </div>
          </div>
          <div className="min-h-[120px] flex-1 whitespace-pre-wrap border border-emerald-500/20 bg-black/30 p-4 font-[var(--font-vt323)] text-base leading-relaxed text-emerald-300/95 md:min-h-[180px]">
            {devDisplayed || "> AWAITING INPUT..."}
            {(isLoading || (showTypewriter && devResponse)) && (
              <span className="animate-pulse">_</span>
            )}
          </div>
        </motion.div>

        {/* MIDDLE - Frequency bar */}
        <FrequencyBar active={isLoading} />

        {/* RIGHT PANEL - BIZ (Otacon / Blue-Amber) */}
        <motion.div
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-1 flex-col border-l border-amber-500/30 bg-[#0c0a08] p-4 md:p-6"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-20 w-20 flex-shrink-0 rounded border-2 border-amber-500/50 bg-amber-950/60 md:h-28 md:w-28" />
            <div>
              <p className="text-amber-400/90 text-xl tracking-widest md:text-2xl">
                BIZ
              </p>
              <p className="text-amber-600/80 text-xs">CODEC CHANNEL</p>
            </div>
          </div>
          <div className="min-h-[120px] flex-1 whitespace-pre-wrap border border-amber-500/20 bg-black/30 p-4 font-[var(--font-vt323)] text-base leading-relaxed text-amber-200/90 md:min-h-[180px]">
            {bizDisplayed ||
              "Strategic summaries and recommendations will appear here."}
            {(isLoading || (showTypewriter && bizResponse)) && (
              <span className="animate-pulse">_</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Tactical command prompt input */}
      <div className="relative z-20 border-t border-emerald-500/40 bg-[#050505] p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3"
        >
          <span className="text-emerald-500">&#62;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER MISSION PARAMETERS..."
            disabled={isLoading}
            className="flex-1 rounded-none border border-emerald-500/50 bg-black/80 px-4 py-3 font-[var(--font-vt323)] text-lg tracking-wider text-[#c0ff00] placeholder:text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50 disabled:opacity-60"
            aria-label="Tactical command input"
          />
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-none border border-emerald-500/70 bg-emerald-950/80 px-6 py-3 font-[var(--font-vt323)] text-lg tracking-widest text-emerald-300 disabled:opacity-50"
          >
            {isLoading ? "TRANSMITTING..." : "SEND"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
