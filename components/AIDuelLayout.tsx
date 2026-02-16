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
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const SPLITTER = " ||| ";
const MAX_INTERACTIONS = 15;
const RATE_LIMIT_MS = 2000;

/**
 * Parse split-stream response: "[DEV]: ... ||| [BIZ]: ..."
 * Left column gets content after [DEV]:, right column after [BIZ]:.
 * Fallback: if separator is missing (e.g. error message), show full text in both columns.
 */
function parseSplitStreamContent(raw: string): { dev: string; biz: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { dev: "", biz: "" };
  const parts = trimmed.split(SPLITTER);
  const first = (parts[0]?.trim() ?? "").replace(/^\[DEV]:\s*/i, "").trim();
  const second = (parts[1]?.trim() ?? "").replace(/^\[BIZ]:\s*/i, "").trim();
  if (parts.length < 2 || (!first && !second)) {
    return { dev: trimmed, biz: trimmed };
  }
  return { dev: first, biz: second };
}

function getAssistantTextContent(
  messages: {
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }[]
): string {
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (!lastAssistant) return "";
  if (typeof lastAssistant.content === "string") return lastAssistant.content;
  if (!lastAssistant.parts?.length) return "";
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
  messages: {
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }[]
): boolean {
  return messages.some((m) => {
    if (m.role !== "user") return false;
    if (typeof (m as { content?: string }).content === "string")
      return (m as { content: string }).content.trim().length > 0;
    if (!m.parts?.length) return false;
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

/** Extract plain text from a message for serialization (chatHistory). */
function getMessageText(
  m: { role: string; parts?: Array<{ type: string; text?: string }>; content?: string }
): string {
  if (typeof (m as { content?: string }).content === "string")
    return (m as { content: string }).content;
  if (!m.parts?.length) return "";
  return m.parts
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
  description,
  content,
  isLoading,
  placeholder,
  theme,
  emptyStateTitle,
  analyzingLabel,
}: {
  title: string;
  subtitle: string;
  description?: string;
  content: string;
  isLoading: boolean;
  placeholder: string;
  theme: "dev" | "biz";
  emptyStateTitle: string;
  analyzingLabel: string;
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
                {analyzingLabel}
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
                {emptyStateTitle}
              </p>
              <p className={cn("max-w-[220px] text-[0.7rem] leading-relaxed", isDev ? "text-emerald-500/70" : "text-amber-500/70")}>
                {placeholder}
              </p>
            </div>
          ) : (
            <>
              {content || placeholder}
              {(isLoading || content) && (
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
  const { dict, lang, mounted, localeSegment } = useLanguage();
  const COPY = dict.agents;
  const CONSOLE = dict.console;

  const [input, setInput] = useState("");
  const [devResponse, setDevResponse] = useState("");
  const [bizResponse, setBizResponse] = useState("");
  const [interactionCount, setInteractionCount] = useState(0);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefEmail, setBriefEmail] = useState("");
  const [briefSending, setBriefSending] = useState(false);
  const [briefSent, setBriefSent] = useState(false);
  const [briefToastVisible, setBriefToastVisible] = useState(false);
  const lastSendTimeRef = useRef<number>(0);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: `/api/chat?lang=${lang}` }),
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
    const { dev, biz } = parseSplitStreamContent(content);
    setDevResponse(dev);
    setBizResponse(biz);
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
      const now = Date.now();
      if (now - lastSendTimeRef.current < RATE_LIMIT_MS) return;
      lastSendTimeRef.current = now;
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
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("[AIDuel] sendMessage error:", err);
        }
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
  const showGenerateBriefButton = interactionCount >= 3 && !briefSent;

  const handleSendBrief = useCallback(async () => {
    const email = briefEmail.trim();
    if (!email) return;
    setBriefSending(true);
    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: getMessageText(m),
      }));
      const res = await fetch("/api/finalize-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatHistory,
          userEmail: email,
          userContactInfo: {},
          language: lang,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setBriefSent(true);
        setBriefModalOpen(false);
        setBriefEmail("");
        setBriefToastVisible(true);
        setTimeout(() => setBriefToastVisible(false), 4000);
      } else {
        alert(data.error ?? COPY.briefModalError);
      }
    } catch {
      alert(COPY.briefModalError);
    } finally {
      setBriefSending(false);
    }
  }, [briefEmail, messages, lang, COPY.briefModalError]);

  const connectionError = !!error;
  const [mobileTab, setMobileTab] = useState<"dev" | "biz">("dev");

  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] font-sans text-base">
        <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6">
          <div className="w-full max-w-5xl">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md">
              <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
                <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-700/50 sm:mb-4" aria-hidden />
                <div className="grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg border border-white/10 bg-zinc-800/30" aria-hidden />
                  ))}
                </div>
              </div>
              <div className="flex flex-col p-4 md:flex-row md:gap-4">
                <div className="h-[300px] flex-1 animate-pulse rounded border border-white/10 bg-zinc-800/20 md:h-[350px]" aria-hidden />
                <div className="hidden h-[350px] w-12 flex-shrink-0 md:block" aria-hidden />
                <div className="h-[300px] flex-1 animate-pulse rounded border border-white/10 bg-zinc-800/20 md:h-[350px]" aria-hidden />
              </div>
              <div className="border-t border-white/10 px-4 py-4">
                <div className="mx-auto flex max-w-[600px] items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5">
                  <div className="h-10 flex-1 animate-pulse rounded bg-zinc-700/30" aria-hidden />
                  <div className="h-10 w-24 animate-pulse rounded bg-zinc-700/40" aria-hidden />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      {briefToastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed left-1/2 top-24 z-[110] -translate-x-1/2 rounded-lg border border-emerald-500/50 bg-emerald-950/95 px-5 py-3 text-sm font-medium text-emerald-100 shadow-lg"
          role="status"
          aria-live="polite"
        >
          {COPY.briefSuccessToast}
        </motion.div>
      )}

      {/* Compact console: centered module (agents + input in one device) */}
      <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-xl backdrop-blur-md">
            {/* Workshop mode banner */}
            <div className="border-b border-white/10 bg-emerald-950/30 px-4 py-2.5 text-center">
              <p className="text-xs font-medium text-emerald-200/95 sm:text-sm">
                {COPY.workshopBanner}
              </p>
            </div>
            {/* Welcome Cards: Quick Actions */}
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
                    title={CONSOLE.perspectiveDev}
                    subtitle={COPY.agentSubtitle}
                    description={COPY.devDescription}
                    content={devResponse}
                    isLoading={isLoading}
                    placeholder={COPY.placeholderDev}
                    theme="dev"
                    emptyStateTitle={COPY.emptyStateTitle}
                    analyzingLabel={COPY.analyzing}
                  />
                </TabsContent>
                <TabsContent value="biz" className="mt-0 focus-visible:outline-none">
                  <AgentWindow
                    title={CONSOLE.perspectiveBiz}
                    subtitle={COPY.agentSubtitle}
                    description={COPY.bizDescription}
                    content={bizResponse}
                    isLoading={isLoading}
                    placeholder={COPY.placeholderBiz}
                    theme="biz"
                    emptyStateTitle={COPY.emptyStateTitle}
                    analyzingLabel={COPY.analyzing}
                  />
                </TabsContent>
              </Tabs>
              {/* Spacer: miejsce na fixed input (thumb zone), treść nie chowa się pod paskiem */}
              <div
                className="min-h-[5.5rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
                aria-hidden
              />
            </div>

            {/* Mobile: input przyklejony do dołu z safe-area */}
            {!limitReached && (
              <div
                className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 pt-3 backdrop-blur-md md:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              >
                <div className="mb-2 flex justify-center">
                  <span className="text-xs font-medium tabular-nums text-zinc-500">
                    {COPY.workshopProgress.replace("{current}", String(interactionCount)).replace("{max}", String(MAX_INTERACTIONS))}
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
                    placeholder={isLoading ? CONSOLE.buttonSubmitting : COPY.workshopInputPlaceholder}
                    disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70"
                      aria-label={COPY.inputAriaLabel}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-12 min-w-12 border border-emerald-500/60 bg-emerald-950/90 px-5 text-sm font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 disabled:opacity-50 disabled:shadow-none"
                    >
                      {isLoading ? CONSOLE.buttonSubmitting : CONSOLE.buttonSubmit}
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
                        title={CONSOLE.perspectiveDev}
                        subtitle={COPY.agentSubtitle}
                        description={COPY.devDescription}
                        content={devResponse}
                        isLoading={isLoading}
                        placeholder={COPY.placeholderDev}
                        theme="dev"
                        emptyStateTitle={COPY.emptyStateTitle}
                        analyzingLabel={COPY.analyzing}
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
                        title={CONSOLE.perspectiveBiz}
                        subtitle={COPY.agentSubtitle}
                        description={COPY.bizDescription}
                        content={bizResponse}
                        isLoading={isLoading}
                        placeholder={COPY.placeholderBiz}
                        theme="biz"
                        emptyStateTitle={COPY.emptyStateTitle}
                        analyzingLabel={COPY.analyzing}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              {!limitReached && (
                <>
                  <div className="flex justify-center border-t border-white/10 py-2">
                    <span className="text-xs font-medium tabular-nums text-zinc-500">
                      {COPY.workshopProgress.replace("{current}", String(interactionCount)).replace("{max}", String(MAX_INTERACTIONS))}
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
                      placeholder={isLoading ? CONSOLE.buttonSubmitting : COPY.workshopInputPlaceholder}
                      disabled={isLoading}
                      className="min-h-10 min-w-0 flex-1 border-0 bg-transparent text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70 md:text-lg"
                      aria-label={COPY.inputAriaLabel}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="shrink-0 min-h-10 border border-emerald-500/60 bg-emerald-950/90 px-5 text-sm font-medium text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none md:px-6 md:text-base"
                    >
                      {isLoading ? CONSOLE.buttonSubmitting : CONSOLE.buttonSubmit}
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
                  {CONSOLE.limitMessage}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link href={`/${localeSegment}#projekty`}>
                    <Button variant="outline" className="border-emerald-500/70 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/60">
                      {dict.projects.sectionTitle}
                    </Button>
                  </Link>
                  <Link href={`/${localeSegment}/projekty/fotarobota`}>
                    <Button variant="outline" className="border-amber-500/50 bg-amber-950/50 text-amber-200/90 hover:bg-amber-900/40">
                      {dict.header.navCaseStudy}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Sticky action bar: Generate Brief (after 3+ messages) */}
            {showGenerateBriefButton && (
              <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md">
                <div className="mx-auto flex max-w-[600px] justify-center">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setBriefModalOpen(true)}
                    className="min-h-11 bg-emerald-600 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:bg-emerald-500"
                  >
                    ✅ {COPY.generateBriefButton}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brief modal: email + send */}
      {briefModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brief-modal-title"
        >
          <div className="w-full max-w-md rounded-xl border border-white/20 bg-zinc-900 p-6 shadow-2xl">
            <h2 id="brief-modal-title" className="text-lg font-semibold text-zinc-100">
              {COPY.briefModalTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {COPY.workshopBanner}
            </p>
            <div className="mt-4">
              <label htmlFor="brief-email" className="mb-1.5 block text-xs font-medium text-zinc-400">
                {COPY.briefModalEmailLabel}
              </label>
              <Input
                id="brief-email"
                type="email"
                value={briefEmail}
                onChange={(e) => setBriefEmail(e.target.value)}
                placeholder={COPY.briefModalEmailPlaceholder}
                className="h-11 border-zinc-700 bg-zinc-800 text-zinc-100"
                autoFocus
                disabled={briefSending}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-zinc-600"
                onClick={() => setBriefModalOpen(false)}
                disabled={briefSending}
              >
                {COPY.briefModalCancel}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
                onClick={handleSendBrief}
                disabled={!briefEmail.trim() || briefSending}
              >
                {briefSending ? COPY.briefGenerating : COPY.briefModalSubmit}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
