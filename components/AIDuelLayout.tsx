"use client";

import { useState, useEffect, useCallback } from "react";
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
    <div className="flex min-h-[350px] w-12 flex-shrink-0 flex-col items-center justify-center gap-0.5 bg-black/80 py-4 md:min-h-[400px]">
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
  const textCls = isDev ? "text-emerald-400/90" : "text-amber-400/90";
  const subCls = isDev ? "text-emerald-600" : "text-amber-600/80";
  const contentBorderCls = isDev ? "border-emerald-500/20" : "border-amber-500/20";
  const contentTextCls = isDev ? "text-emerald-300/95" : "text-amber-200/90";
  const avatarCls = isDev ? "border-emerald-500/60 bg-emerald-950/80" : "border-amber-500/50 bg-amber-950/60";

  return (
    <div className={cn("flex min-h-[280px] flex-1 flex-col p-4 md:min-h-[400px]", borderCls)}>
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("h-14 w-14 flex-shrink-0 rounded border-2 md:h-16 md:w-16", avatarCls)} />
        <div>
          <p className={cn("text-lg tracking-widest md:text-xl", textCls)}>{title}</p>
          <p className={cn("text-xs", subCls)}>{subtitle}</p>
        </div>
      </div>
      <div className="relative min-h-[200px] flex-1 overflow-auto rounded border bg-black/30 p-3 md:min-h-[300px]">
        {showScanline && (
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
            style={SCANLINE_STYLE}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative whitespace-pre-wrap font-[var(--font-vt323)] text-sm leading-relaxed",
            contentBorderCls,
            contentTextCls
          )}
        >
          {content || placeholder}
          {(isLoading || content) && <span className="animate-pulse">_</span>}
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
    setDevResponse("Analizuję architekturę...");
    setBizResponse("Liczę ROI...");
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

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] pt-20 font-[var(--font-vt323)] text-lg"
      )}
      style={{ fontFamily: "var(--font-vt323), monospace" }}
    >
      {/* Global CRT scanlines (subtle) */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.04]"
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
          className="absolute left-1/2 top-24 z-50 -translate-x-1/2 rounded border border-red-500/80 bg-black/95 px-6 py-3 font-[var(--font-vt323)] text-xl tracking-widest text-red-400"
        >
          CONNECTION ERROR
        </motion.div>
      )}

      {/* Main content: mobile Tabs vs desktop Grid */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Mobile: Tabs – one agent at a time (data stays when switching tabs) */}
        <div className="flex flex-1 flex-col md:hidden">
          <Tabs defaultValue="dev" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-4 mt-2 grid w-[calc(100%-2rem)] grid-cols-2 rounded-lg border border-white/10 bg-black/50 p-1 backdrop-blur-sm">
              <TabsTrigger
                value="dev"
                className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300 data-[state=active]:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                DEV_CHANNEL
              </TabsTrigger>
              <TabsTrigger
                value="biz"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-200 data-[state=active]:shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              >
                BIZ_CHANNEL
              </TabsTrigger>
            </TabsList>
            <TabsContent value="dev" className="mt-0 flex-1 overflow-auto focus-visible:outline-none">
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
            <TabsContent value="biz" className="mt-0 flex-1 overflow-auto focus-visible:outline-none">
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
        </div>

        {/* Desktop: Split view with Cards */}
        <div className="hidden flex-1 flex-col md:flex">
          <div className="flex min-h-0 flex-1 gap-0">
            <div className="grid min-h-0 min-w-0 grid-cols-1 grid-rows-1 md:flex-1 md:grid-cols-[1fr_auto_1fr]">
              <Card className="m-2 flex min-h-0 min-w-0 flex-col border-emerald-500/30 bg-[#061006]/95">
                <CardHeader className="pb-2" />
                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <div className="relative flex min-h-0 flex-1 flex-col">
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
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
              <Card className="m-2 flex min-h-0 min-w-0 flex-col border-amber-500/30 bg-[#0c0a08]/95">
                <CardHeader className="pb-2" />
                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <AgentWindow
                    title="BIZ"
                    subtitle="CODEC CHANNEL"
                    content={bizResponse}
                    isLoading={isLoading}
                    placeholder="Podsumowania i rekomendacje biznesowe pojawią się tutaj."
                    theme="biz"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Input area: separate, command-center style */}
      {limitReached ? (
        <div className="border-t border-white/10 bg-black/50 py-12 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <p className="text-center font-[var(--font-vt323)] text-xl tracking-wider text-amber-200/90">
              LIMIT DANYCH WYCZERPANY. ZOBACZ PEŁNĄ OFERTĘ
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
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
        </div>
      ) : (
        <div className="sticky bottom-0 border-t border-white/10 bg-black/50 px-4 py-4 backdrop-blur-md md:py-6">
          <form
            onSubmit={handleCustomSubmit}
            className="mx-auto flex max-w-[600px] items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-2 py-2 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 md:px-3"
          >
            <span className="text-emerald-500" aria-hidden>&#62;</span>
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Wpisz czego poszukujesz?"
              disabled={isLoading}
              className="min-w-0 flex-1 border-0 bg-transparent font-[var(--font-vt323)] text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0"
              aria-label="Wpisz czego poszukujesz"
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="shrink-0 border border-emerald-500/70 bg-emerald-950/80 font-[var(--font-vt323)] tracking-widest text-emerald-300 hover:bg-emerald-900/60"
            >
              {isLoading ? "TRANSMITUJĘ..." : "WYŚLIJ"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
