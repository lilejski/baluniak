"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SPLITTER = " ||| ";
const MAX_INTERACTIONS = 3;

const SCANLINE_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.25) 2px, rgba(0,0,0,0.25) 4px)",
};

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

function FrequencyBar({ active }: { active: boolean }) {
  return (
    <div className="flex h-[350px] w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 bg-black/80 py-4">
      {Array.from({ length: 12 }).map((_, i) => (
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

function AgentWindow({
  title,
  subtitle,
  content,
  isLoading,
  placeholder,
  theme,
  showScanline = false,
}: {
  title: string;
  subtitle: string;
  content: string;
  isLoading: boolean;
  placeholder: string;
  theme: "dev" | "biz";
  showScanline?: boolean;
}) {
  const isDev = theme === "dev";
  const borderCls = isDev
    ? "border-emerald-500/30 bg-[#061006]"
    : "border-amber-500/30 bg-[#0c0a08]";
  const headerBorderCls = isDev ? "border-emerald-500/60" : "border-amber-500/50";
  const titleTextCls = isDev ? "text-emerald-400/90" : "text-amber-300/95";
  const subtitleTextCls = isDev ? "text-emerald-600" : "text-amber-400/85";
  const contentBorderCls = isDev ? "border-emerald-500/20" : "border-amber-500/20";
  const contentTextCls = isDev ? "text-emerald-400" : "text-amber-100";
  const avatarCls = isDev ? "border-emerald-500/60 bg-emerald-950/80" : "border-amber-500/50 bg-amber-950/60";

  const titleTypographyCls = isDev
    ? "font-[var(--font-vt323)] text-xs md:text-sm tracking-[0.38em]"
    : "font-sans text-sm md:text-base font-semibold tracking-tight";

  const subtitleTypographyCls = isDev
    ? "font-[var(--font-vt323)] text-[0.68rem] tracking-[0.26em] uppercase"
    : "font-sans text-[0.7rem] md:text-xs uppercase tracking-[0.22em]";

  const contentTypographyCls = isDev
    ? "font-mono text-sm leading-relaxed"
    : "font-sans text-[0.9rem] leading-relaxed";

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest content when messages stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [content, isLoading]);

  const devHexSnippets = [
    "0x9F3A",
    "0xC0DE",
    "0xBEEF",
    "0xA11C",
    "0xF00D",
    "0xDEAD",
    "0xFEED",
  ] as const;

  return (
    <div className={cn("flex h-[300px] flex-col p-4 md:h-[350px]", borderCls)}>
      <div className="mb-3 flex shrink-0 items-center gap-3">
        <div className={cn("h-14 w-14 flex-shrink-0 rounded border-2 md:h-16 md:w-16", avatarCls)} />
        <div>
          <p
            className={cn(
              "uppercase",
              titleTypographyCls,
              titleTextCls
            )}
          >
            {title}
          </p>
          <p className={cn(subtitleTypographyCls, subtitleTextCls)}>{subtitle}</p>
          {isLoading &&
            (isDev ? (
              <motion.div
                className="mt-1 flex flex-wrap gap-2"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                {devHexSnippets.map((hex, idx) => (
                  <motion.span
                    key={hex + idx}
                    className="font-mono text-[0.65rem] tracking-[0.22em] text-emerald-400/80"
                    initial={{ opacity: 0.15 }}
                    animate={{ opacity: [0.15, 1, 0.2] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: idx * 0.12,
                    }}
                  >
                    {hex}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="mt-1 flex items-center gap-1 text-[0.75rem]"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                <span className="font-sans text-amber-200/90">
                  Analyzing market
                </span>
                <span className="font-sans text-amber-300/90">
                  <motion.span
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </span>
              </motion.div>
            ))}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto rounded border bg-black/30 p-3"
      >
        {showScanline && (
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
            style={SCANLINE_STYLE}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative whitespace-pre-wrap",
            contentTypographyCls,
            contentBorderCls,
            contentTextCls
          )}
        >
          {content || placeholder}
          {isDev && (isLoading || content) && (
            <span className="animate-pulse">_</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIDuelLayout() {
  const [input, setInput] = useState("");
  const [devResponse, setDevResponse] = useState("");
  const [bizResponse, setBizResponse] = useState("");
  const [interactionCount, setInteractionCount] = useState(0);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const content = getAssistantTextContent(messages);
    if (!content) return;
    const parts = content.split(SPLITTER);
    setDevResponse(parts[0]?.trim() ?? "");
    setBizResponse(parts[1]?.trim() ?? "");
  }, [messages]);

  useEffect(() => {
    if (!isLoading) return;
    const content = getAssistantTextContent(messages);
    if (content.length > 0) return;
  }, [messages, isLoading]);

  const handleCustomSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const value = input.trim();
      if (!value || isLoading || interactionCount >= MAX_INTERACTIONS) return;
      setDevResponse("");
      setBizResponse("");
      const nextStep = interactionCount + 1;
      try {
        await sendMessage(
          {
            role: "user",
            content: value,
            parts: [{ type: "text", text: value }],
          } as Parameters<typeof sendMessage>[0],
          { body: { step: nextStep } }
        );
        setInteractionCount(nextStep);
      } catch {
        // on error don't increment
      }
      setInput("");
    },
    [input, isLoading, interactionCount, sendMessage]
  );

  const connectionError = !!error;
  const limitReached = interactionCount >= MAX_INTERACTIONS;
  const [mobileTab, setMobileTab] = useState<"dev" | "biz">("dev");

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] font-[var(--font-vt323)] text-lg"
      )}
      style={{ fontFamily: "var(--font-vt323), monospace" }}
    >
      {/* Global CRT scanlines (subtle atmosphere) */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.05]"
        style={SCANLINE_STYLE}
        aria-hidden
      />

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
          className="absolute left-1/2 top-20 z-[110] -translate-x-1/2 rounded border border-red-500/80 bg-black/95 px-6 py-3 font-[var(--font-vt323)] text-xl tracking-widest text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          CONNECTION ERROR
        </motion.div>
      )}

      {/* Compact console: centered module (agents + input in one device) */}
      <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md">
            {/* Mobile: Tabs + fixed-height agent + input in flow (no sticky) */}
            <div className="flex flex-col md:hidden">
              <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "dev" | "biz")} className="flex flex-col">
                <TabsList className="relative z-10 mx-4 mt-4 grid h-12 w-[calc(100%-2rem)] grid-cols-2 rounded-lg border-2 border-white/20 bg-zinc-900/95 p-1.5 shadow-lg backdrop-blur-md">
                  <TabsTrigger
                    value="dev"
                    className={cn(
                      "relative z-10 min-h-10 border border-transparent bg-transparent transition-colors",
                      "data-[state=inactive]:!text-zinc-500 data-[state=inactive]:hover:!text-zinc-400",
                      "data-[state=active]:!text-emerald-200 data-[state=active]:shadow-none data-[state=active]:ring-0"
                    )}
                  >
                    {mobileTab === "dev" && (
                      <motion.div
                        layoutId="activeTab"
                        aria-hidden
                        className="absolute inset-[2px] z-0 rounded-full border border-white/20 bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">DEV_CHANNEL</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="biz"
                    className={cn(
                      "relative z-10 min-h-10 border border-transparent bg-transparent transition-colors",
                      "data-[state=inactive]:!text-zinc-500 data-[state=inactive]:hover:!text-zinc-400",
                      "data-[state=active]:!text-amber-300 data-[state=active]:shadow-none data-[state=active]:ring-0"
                    )}
                  >
                    {mobileTab === "biz" && (
                      <motion.div
                        layoutId="activeTab"
                        aria-hidden
                        className="absolute inset-[2px] z-0 rounded-full border border-white/20 bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">BIZ_CHANNEL</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dev" className="mt-0 focus-visible:outline-none">
                  <AgentWindow
                    title="DEV"
                    subtitle="CODEC CHANNEL"
                    content={devResponse}
                    isLoading={isLoading}
                    placeholder="> Czekam na input..."
                    theme="dev"
                    showScanline
                  />
                </TabsContent>
                <TabsContent value="biz" className="mt-0 focus-visible:outline-none">
                  <AgentWindow
                    title="BIZ"
                    subtitle="CODEC CHANNEL"
                    content={bizResponse}
                    isLoading={isLoading}
                    placeholder="Podsumowania i rekomendacje biznesowe pojawią się tutaj."
                    theme="biz"
                  />
                </TabsContent>
              </Tabs>
              {!limitReached && (
                <div className="border-t border-white/10 px-4 py-4">
                  <form
                    onSubmit={handleCustomSubmit}
                    className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 shadow-[0_0_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-200 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/25"
                  >
                    <span className="select-none text-lg text-emerald-400" aria-hidden>&#62;</span>
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Wpisz czego poszukujesz?"
                      disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent font-[var(--font-vt323)] text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70"
                      aria-label="Wpisz czego poszukujesz"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-10 border border-emerald-500/60 bg-emerald-950/90 px-5 font-[var(--font-vt323)] text-sm tracking-widest text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 disabled:opacity-50 disabled:shadow-none"
                    >
                      {isLoading ? "TRANSMITUJĘ..." : "WYŚLIJ"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Desktop: two agent windows (fixed height) + input underneath */}
            <div className="hidden flex-col md:flex">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
                <Card className="m-2 flex flex-col border-emerald-500/30 bg-[#061006]/95">
                  <CardHeader className="shrink-0 pb-2" />
                  <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                    <div className="relative flex h-[350px] flex-col">
                      <div
                        className="pointer-events-none absolute inset-0 z-10 opacity-[0.08]"
                        style={SCANLINE_STYLE}
                        aria-hidden
                      />
                      <AgentWindow
                        title="DEV"
                        subtitle="CODEC CHANNEL"
                        content={devResponse}
                        isLoading={isLoading}
                        placeholder="> Czekam na input..."
                        theme="dev"
                      />
                    </div>
                  </CardContent>
                </Card>
                <FrequencyBar active={isLoading} />
                <Card className="m-2 flex flex-col border-amber-500/30 bg-[#0c0a08]/95">
                  <CardHeader className="shrink-0 pb-2" />
                  <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                    <div className="relative flex h-[350px] flex-col">
                      <AgentWindow
                        title="BIZ"
                        subtitle="CODEC CHANNEL"
                        content={bizResponse}
                        isLoading={isLoading}
                        placeholder="Podsumowania i rekomendacje biznesowe pojawią się tutaj."
                        theme="biz"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {!limitReached && (
                <div className="border-t border-white/10 px-4 py-4">
                  <form
                    onSubmit={handleCustomSubmit}
                    className="mx-auto flex max-w-[600px] items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 shadow-[0_0_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-200 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:shadow-[0_0_28px_rgba(16,185,129,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] focus-within:backdrop-blur-lg md:px-4 md:py-3"
                  >
                    <span className="select-none text-lg text-emerald-400 md:text-xl" aria-hidden>&#62;</span>
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Wpisz czego poszukujesz?"
                      disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent font-[var(--font-vt323)] text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70 md:text-lg"
                      aria-label="Wpisz czego poszukujesz"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-10 border border-emerald-500/60 bg-emerald-950/90 px-5 font-[var(--font-vt323)] text-sm tracking-widest text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none md:px-6 md:text-base"
                    >
                      {isLoading ? "TRANSMITUJĘ..." : "WYŚLIJ"}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Limit reached: CTA inside console */}
            {limitReached && (
              <div className="border-t border-white/10 px-4 py-8">
                <p className="text-center font-[var(--font-vt323)] text-xl tracking-wider text-amber-200/90">
                  LIMIT DANYCH WYCZERPANY. ZOBACZ PEŁNĄ OFERTĘ
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/projekty">
                    <Button variant="outline" className="border-emerald-500/70 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/60">
                      PROJEKTY
                    </Button>
                  </Link>
                  <Link href="/sklep">
                    <Button variant="outline" className="border-amber-500/50 bg-amber-950/50 text-amber-200/90 hover:bg-amber-900/40">
                      SKLEP
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
