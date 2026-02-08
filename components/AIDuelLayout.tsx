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
import { Code2, Briefcase } from "lucide-react";
import { WelcomeCards } from "@/components/WelcomeCards";
import { cn } from "@/lib/utils";

const SPLITTER = " ||| ";
const MAX_INTERACTIONS = 3;

/** Teksty (copywriting) – Premium AI Tool, edytuj tutaj */
const COPY = {
  tabDev: "Agent Deweloperski",
  tabBiz: "Agent Biznesowy",
  placeholderDev: "Oczekuję na polecenie.",
  placeholderBiz: "Podsumowania i rekomendacje pojawią się tutaj.",
  emptyStateTitle: "Brak odpowiedzi",
  quickActionsTitle: "Szybkie akcje",
  inputPlaceholder: "Wpisz polecenie lub wybierz szablon…",
  inputAriaLabel: "Pole wprowadzania polecenia",
  submitLabel: "Wyślij",
  submitLoadingLabel: "Generuję…",
  limitReachedMessage: "Limit wyczerpany. Zobacz pełną ofertę.",
  connectionError: "Problem z połączeniem",
  queriesCounterLabel: "Zapytania",
} as const;

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

/** Czy asystent odpowiedział tylko "potrzebuję więcej danych" itp. – nie pokazujemy tego przy pustej historii */
function isNeedMoreDataResponse(content: string): boolean {
  const normalized = content.trim().toLowerCase();
  return (
    /potrzebuję?\s*więcej\s*danych/i.test(normalized) ||
    /więcej\s*danych\s*(wejściowych)?/i.test(normalized) ||
    /daj\s*(mi\s*)?więcej|need\s*more\s*(data|input)/i.test(normalized)
  );
}

/** Czy w historii jest jakakolwiek treść od użytkownika (niepuste wiadomości) */
function hasUserContent(
  messages: { role: string; parts?: Array<{ type: string; text?: string }> }[]
): boolean {
  return messages.some((m) => {
    if (m.role !== "user" || !m.parts) return false;
    const text = m.parts
      .filter(
        (p): p is { type: string; text: string } =>
          p.type === "text" && typeof p.text === "string"
      )
      .map((p) => p.text)
      .join("");
    return text.trim().length > 0;
  });
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
  description,
  content,
  isLoading,
  placeholder,
  theme,
}: {
  title: string;
  subtitle: string;
  description?: string;
  content: string;
  isLoading: boolean;
  placeholder: string;
  theme: "dev" | "biz";
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

  const titleTypographyCls = "font-sans text-sm md:text-base font-semibold tracking-tight";
  const subtitleTypographyCls = "font-sans text-[0.7rem] md:text-xs uppercase tracking-[0.2em] text-zinc-500";
  const contentTypographyCls = "font-sans text-[0.9rem] leading-relaxed";

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest content when messages stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [content, isLoading]);

  const glowCls = isDev
    ? "shadow-[0_0_24px_rgba(16,185,129,0.12),0_0_0_1px_rgba(16,185,129,0.25)]"
    : "shadow-[0_0_24px_rgba(245,158,11,0.1),0_0_0_1px_rgba(245,158,11,0.2)]";

  return (
    <div className={cn("flex h-[300px] flex-col p-4 md:h-[350px]", borderCls, glowCls)}>
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
          {description && (
            <p className={cn("mt-1 text-[0.7rem] leading-tight opacity-90 md:text-xs", isDev ? "text-emerald-500/80" : "text-amber-400/80")}>
              {description}
            </p>
          )}
          {isLoading && (
            <motion.div
              className="mt-1 flex items-center gap-1 text-[0.75rem]"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <span className={isDev ? "text-emerald-300/90" : "text-amber-200/90"}>
                {isDev ? "Analizuję" : "Analizuję"}
              </span>
              <motion.span
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                …
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto rounded border bg-black/30 p-3"
      >
        <div
          className={cn(
            "relative min-h-[120px] whitespace-pre-wrap",
            contentTypographyCls,
            contentBorderCls,
            contentTextCls
          )}
        >
          {!content && !isLoading ? (
            <div
              className={cn(
                "flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded border border-dashed py-6 text-center",
                isDev ? "border-emerald-500/25 bg-emerald-950/20" : "border-amber-500/25 bg-amber-950/15"
              )}
              aria-hidden
            >
              {isDev ? (
                <Code2 className="size-8 text-emerald-500/60" aria-hidden />
              ) : (
                <Briefcase className="size-8 text-amber-500/60" aria-hidden />
              )}
              <p className={cn("text-xs font-medium uppercase tracking-wider", isDev ? "text-emerald-400/80" : "text-amber-400/80")}>
                {COPY.emptyStateTitle}
              </p>
              <p className={cn("max-w-[220px] text-[0.7rem] leading-relaxed", isDev ? "text-emerald-500/70" : "text-amber-500/70")}>
                {placeholder}
              </p>
            </div>
          ) : (
            <>
              {content || placeholder}
              {isDev && (isLoading || content) && (
                <span className="animate-pulse">_</span>
              )}
            </>
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
    if (!hasUserContent(messages) && isNeedMoreDataResponse(content)) {
      setDevResponse("");
      setBizResponse("");
      return;
    }
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

  const inputRefMobile = useRef<HTMLInputElement>(null);
  const inputRefDesktop = useRef<HTMLInputElement>(null);

  const handleQuickAction = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    setInput(prompt.trim());
    requestAnimationFrame(() => {
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
      (isDesktop ? inputRefDesktop : inputRefMobile).current?.focus();
    });
  }, []);

  const limitReached = interactionCount >= MAX_INTERACTIONS;
  const showWelcomeCards = interactionCount === 0 && !isLoading && !limitReached;

  const connectionError = !!error;
  const [mobileTab, setMobileTab] = useState<"dev" | "biz">("dev");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] font-sans text-base">
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute left-1/2 top-20 z-[110] -translate-x-1/2 rounded-lg border border-red-500/40 bg-red-950/90 px-5 py-2.5 text-sm font-medium text-red-200 shadow-lg"
        >
          {COPY.connectionError}
        </motion.div>
      )}

      {/* Compact console: centered module (agents + input in one device) */}
      <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md">
            {/* Welcome Cards: Quick Actions – tylko gdy brak wiadomości */}
            {showWelcomeCards && (
              <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500 sm:mb-4 sm:text-sm">
                  {COPY.quickActionsTitle}
                </p>
                <WelcomeCards onSelect={handleQuickAction} disabled={isLoading} />
              </div>
            )}
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
                    <span className="relative z-10">{COPY.tabDev}</span>
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
                    <span className="relative z-10">{COPY.tabBiz}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dev" className="mt-0 focus-visible:outline-none">
                  <AgentWindow
                    title="DEV"
                    subtitle="Agent"
                    description="Kod, architektura i best practices"
                    content={devResponse}
                    isLoading={isLoading}
                    placeholder={COPY.placeholderDev}
                    theme="dev"
                  />
                </TabsContent>
                <TabsContent value="biz" className="mt-0 focus-visible:outline-none">
                  <AgentWindow
                    title="BIZ"
                    subtitle="Agent"
                    description="Specjalista od ofert i follow-upów"
                    content={bizResponse}
                    isLoading={isLoading}
                    placeholder={COPY.placeholderBiz}
                    theme="biz"
                  />
                </TabsContent>
              </Tabs>
              {/* Spacer: miejsce na fixed input, żeby treść nie chowała się pod paskiem (safe-area) */}
              <div
                className="min-h-[4.5rem] pb-[env(safe-area-inset-bottom,0px)] md:hidden"
                aria-hidden
              />
            </div>

            {/* Mobile: input przyklejony do dołu z safe-area */}
            {!limitReached && (
              <div
                className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 pt-2 backdrop-blur-md md:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <div className="mb-2 flex justify-center">
                  <span className="text-xs font-medium tabular-nums text-zinc-500">
                    {COPY.queriesCounterLabel} {interactionCount}/{MAX_INTERACTIONS}
                  </span>
                </div>
                <form
                  onSubmit={handleCustomSubmit}
                  className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 shadow-[0_0_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/25"
                >
                  <Input
                    ref={inputRefMobile}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
placeholder={COPY.inputPlaceholder}
                      disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70"
                      aria-label={COPY.inputAriaLabel}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-10 border border-emerald-500/60 bg-emerald-950/90 px-5 text-sm font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 disabled:opacity-50 disabled:shadow-none"
                    >
                      {isLoading ? COPY.submitLoadingLabel : COPY.submitLabel}
                  </Button>
                </form>
              </div>
            )}

            {/* Desktop: two agent windows (fixed height) + input underneath */}
            <div className="hidden flex-col md:flex">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-0">
                <Card className="m-2 flex flex-col border-emerald-500/40 bg-[#061006]/95 shadow-[0_0_28px_rgba(16,185,129,0.08),0_0_0_1px_rgba(16,185,129,0.2)]">
                  <CardHeader className="shrink-0 pb-2" />
                  <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                    <div className="relative flex h-[350px] flex-col">
                      <AgentWindow
                        title="DEV"
                        subtitle="Agent"
                        description="Kod, architektura i best practices"
                        content={devResponse}
                        isLoading={isLoading}
                        placeholder={COPY.placeholderDev}
                        theme="dev"
                      />
                    </div>
                  </CardContent>
                </Card>
                <FrequencyBar active={isLoading} />
                <Card className="m-2 flex flex-col border-amber-500/40 bg-[#0c0a08]/95 shadow-[0_0_28px_rgba(245,158,11,0.06),0_0_0_1px_rgba(245,158,11,0.15)]">
                  <CardHeader className="shrink-0 pb-2" />
                  <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                    <div className="relative flex h-[350px] flex-col">
                      <AgentWindow
                        title="BIZ"
                        subtitle="Agent"
                        description="Specjalista od ofert i follow-upów"
                        content={bizResponse}
                        isLoading={isLoading}
                        placeholder={COPY.placeholderBiz}
                        theme="biz"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {!limitReached && (
                <>
                  <div className="flex justify-center border-t border-white/10 py-2">
                    <span className="text-xs font-medium tabular-nums text-zinc-500">
                      {COPY.queriesCounterLabel} {interactionCount}/{MAX_INTERACTIONS}
                    </span>
                  </div>
                  <div className="border-t border-white/10 px-4 py-4">
                  <form
                    onSubmit={handleCustomSubmit}
                    className="mx-auto flex max-w-[600px] items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 shadow-[0_0_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all duration-200 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/25 focus-within:shadow-[0_0_28px_rgba(16,185,129,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] focus-within:backdrop-blur-lg md:px-4 md:py-3"
                  >
                    <Input
                      ref={inputRefDesktop}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={COPY.inputPlaceholder}
                      disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70 md:text-lg"
                      aria-label={COPY.inputAriaLabel}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-10 border border-emerald-500/60 bg-emerald-950/90 px-5 text-sm font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none md:px-6 md:text-base"
                    >
                      {isLoading ? COPY.submitLoadingLabel : COPY.submitLabel}
                    </Button>
                  </form>
                </div>
                </>
              )}
            </div>

            {/* Limit reached: CTA inside console */}
            {limitReached && (
              <div className="border-t border-white/10 px-4 py-8">
                <p className="text-center text-base font-medium text-zinc-300">
                  {COPY.limitReachedMessage}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/projekty">
                    <Button variant="outline" className="border-emerald-500/70 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/60">
                      Projekty
                    </Button>
                  </Link>
                  <Link href="/sklep">
                    <Button variant="outline" className="border-amber-500/50 bg-amber-950/50 text-amber-200/90 hover:bg-amber-900/40">
                      Sklep
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
