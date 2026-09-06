"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Briefcase, Send, FileText, ArrowRight, BarChart2, Cloud, Cpu, ExternalLink, LayoutGrid, Layout } from "lucide-react";
import { WelcomeCards } from "@/components/WelcomeCards";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const SPLITTER_REGEX = /\n?\s*\|\|\|\s*\n?/;
const MAX_INTERACTIONS = 15;
const RATE_LIMIT_MS = 2000;

/**
 * Parse split-stream response: "[DEV]: ... ||| [BIZ]: ..." (inline OR multiline)
 * The new prompt format puts ||| on its own line, so we handle both variants.
 * Left column gets content after [DEV]:, right column after [BIZ]:.
 * During streaming (before ||| appears), only DEV panel shows content.
 * Fallback: if separator is missing, show full text only in DEV panel.
 */
function parseSplitStreamContent(raw: string): { dev: string; biz: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { dev: "", biz: "" };
  const parts = trimmed.split(SPLITTER_REGEX);
  const first = (parts[0]?.trim() ?? "").replace(/^\[DEV\]:\s*/i, "").trim();
  const second = (parts[1]?.trim() ?? "").replace(/^\[BIZ\]:\s*/i, "").trim();
  if (parts.length >= 2 && second) {
    return { dev: first, biz: second };
  }
  // Still streaming DEV part — show in DEV panel only
  return { dev: first || trimmed, biz: "" };
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

/**
 * Lightweight inline Markdown renderer.
 * Supports: [text](url) links and newlines. No deps needed.
 */
function renderMarkdown(text: string, isDev: boolean): React.ReactNode[] {
  const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
  const result: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = LINK_RE.exec(text)) !== null) {
    const before = text.slice(last, match.index);
    if (before) {
      before.split("\n").forEach((line, i, arr) => {
        result.push(line);
        if (i < arr.length - 1) result.push(<br key={`br-${key++}`} />);
      });
    }
    result.push(
      <a
        key={`link-${key++}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-semibold underline underline-offset-2 transition-colors ${isDev
          ? "text-amber-300 hover:text-amber-200"
          : "text-amber-400 hover:text-amber-300"
          }`}
      >
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }

  const tail = text.slice(last);
  if (tail) {
    tail.split("\n").forEach((line, i, arr) => {
      result.push(line);
      if (i < arr.length - 1) result.push(<br key={`br-${key++}`} />);
    });
  }

  return result;
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
  const titleTextCls = isDev ? "text-emerald-400/90" : "text-amber-300/95";
  const subtitleTextCls = isDev ? "text-emerald-600" : "text-amber-400/85";
  const contentBorderCls = isDev ? "border-emerald-500/20" : "border-amber-500/20";
  const contentTextCls = isDev ? "text-emerald-400" : "text-amber-100";
  const avatarCls = isDev ? "border-emerald-500/60 bg-emerald-950/80" : "border-amber-500/50 bg-amber-950/60";

  const titleTypographyCls = "font-sans text-[0.65rem] md:text-base font-semibold tracking-tight";
  const subtitleTypographyCls = "font-sans text-[0.55rem] md:text-xs uppercase tracking-[0.2em] text-zinc-500";
  const contentTypographyCls = "font-sans text-[0.7rem] md:text-[0.9rem] leading-relaxed";

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
    <div className={cn("flex h-[28dvh] min-h-[180px] max-h-[250px] md:h-[350px] md:max-h-none flex-col p-2.5 md:p-4 rounded-xl", borderCls, glowCls)}>
      <div className="mb-2 md:mb-3 flex shrink-0 flex-row items-center gap-2.5 md:gap-3">
        {/* Avatar with icon */}
        <div className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border-2 md:h-16 md:w-16",
          "h-10 w-10 sm:h-14 sm:w-14",
          avatarCls
        )}>
          {isDev
            ? <Code2 className="size-4 sm:size-6 md:size-7 text-emerald-400" aria-hidden />
            : <Briefcase className="size-4 sm:size-6 md:size-7 text-amber-400" aria-hidden />}
        </div>
        <div className="min-w-0">
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
              {renderMarkdown(content || placeholder, theme === "dev")}
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
  const [confirmPrompt, setConfirmPrompt] = useState<string | null>(null);
  const [briefConfirmOpen, setBriefConfirmOpen] = useState(false);
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
  const showGenerateBriefButton = interactionCount >= 1 && !briefSent;

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

  if (!mounted) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0a0d] font-sans text-base">
        <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6">
          <div className="w-full max-w-5xl">
            <div className="overflow-hidden rounded-xl bg-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06] backdrop-blur-md">
              <div className="px-4 py-4 sm:px-5 sm:py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-700/50 sm:mb-4" aria-hidden />
                <div className="grid gap-3 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.02] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.05]" aria-hidden />
                  ))}
                </div>
              </div>
              <div className="flex flex-col p-4 md:flex-row md:gap-4">
                <div className="h-[300px] flex-1 animate-pulse rounded-lg bg-zinc-800/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.06] md:h-[350px]" aria-hidden />
                <div className="hidden h-[350px] w-12 flex-shrink-0 md:block" aria-hidden />
                <div className="h-[300px] flex-1 animate-pulse rounded-lg bg-zinc-800/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] ring-1 ring-white/[0.06] md:h-[350px]" aria-hidden />
              </div>
              <div className="px-4 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                <div className="mx-auto flex max-w-[600px] items-center gap-3 rounded-full bg-zinc-900/50 px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.05]">
                  <div className="h-10 flex-1 animate-pulse rounded-full bg-zinc-700/30" aria-hidden />
                  <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-700/40" aria-hidden />
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
          className="absolute left-1/2 top-20 z-[110] -translate-x-1/2 rounded-xl bg-red-950/90 px-5 py-2.5 text-sm font-medium text-red-200 shadow-lg ring-1 ring-red-500/30"
        >
          {COPY.connectionError}
        </motion.div>
      )}

      {briefToastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed left-1/2 top-24 z-[110] -translate-x-1/2 rounded-xl bg-zinc-900/95 px-5 py-3 text-sm font-medium text-zinc-100 shadow-xl ring-1 ring-white/[0.1]"
          role="status"
          aria-live="polite"
        >
          {COPY.briefSuccessToast}
        </motion.div>
      )}

      {/* Confirmation Modal for Mobile Prompts */}
      {confirmPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-zinc-900/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <p className="mb-3 text-center text-sm font-semibold text-zinc-100">{COPY.pastePromptConfirm}</p>
            <p className="mb-6 rounded-xl bg-black/40 p-3 text-center text-xs text-zinc-400 ring-1 ring-white/[0.05]">
              &quot;{confirmPrompt}&quot;
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl bg-white/[0.03] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.06]" onClick={() => setConfirmPrompt(null)}>
                {COPY.cancelPrompBtn}
              </Button>
              <Button className="flex-1 rounded-xl bg-emerald-600 font-medium text-emerald-50 hover:bg-emerald-500" onClick={() => { handleQuickAction(confirmPrompt); setConfirmPrompt(null); }}>
                {COPY.yesPasteBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile confirmation popup before opening brief email modal */}
      {briefConfirmOpen && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-zinc-900/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <FileText className="mx-auto mb-3 size-10 text-violet-400" aria-hidden />
            <p className="mb-2 text-center text-sm font-semibold text-zinc-100">{COPY.readyBriefTitle}</p>
            <p className="mb-6 text-center text-xs leading-relaxed text-zinc-400">
              {COPY.readyBriefAsk}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl bg-white/[0.03] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.06]" onClick={() => setBriefConfirmOpen(false)}>
                {COPY.notNowBtn}
              </Button>
              <Button className="flex-1 rounded-xl bg-violet-600 font-medium text-white hover:bg-violet-500" onClick={() => { setBriefConfirmOpen(false); setBriefModalOpen(true); }}>
                {COPY.yesSendBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compact console: centered module (agents + input in one device) */}
      <div className="relative z-10 flex min-h-[80vh] flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-xl bg-black/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06] backdrop-blur-md">
            {/* Chatbots paused notice */}
            <div className="bg-amber-400/10 px-4 py-2.5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-300 sm:text-sm">
                {COPY.pauseNotice}
              </p>
            </div>
            {/* Workshop mode banner */}
            <div className="bg-white/[0.02] px-4 py-2.5 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
              <p className="text-xs font-medium text-zinc-300 sm:text-sm">
                {COPY.workshopBanner}
              </p>
            </div>
            {/* Mobile: Two agent windows stacked vertically first, then input below */}
            <div className="flex flex-col md:hidden px-3 pt-4">
              <div className="flex flex-col gap-3">
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
              {/* Mobile Quick prompts (removed from here, moved to sticky input area) */}

              {/* Spacer: miejsce na fixed input (thumb zone), treść nie chowa się pod paskiem */}
              <div
                className={cn(
                  "min-h-[5.5rem] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden",
                  showWelcomeCards && "min-h-[8.5rem]"
                )}
                aria-hidden
              />
            </div>

            {/* Mobile: input przyklejony do dołu z safe-area */}
            {!limitReached && (
              <div
                className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 pt-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md md:hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              >
                <div className="mb-2 flex justify-center">
                  <span className="text-xs font-medium tabular-nums text-zinc-500">
                    {COPY.workshopProgress.replace("{current}", String(interactionCount)).replace("{max}", String(MAX_INTERACTIONS))}
                  </span>
                </div>

                {showWelcomeCards && (
                  <div className="flex w-full gap-2 overflow-x-auto pb-3 scrollbar-hide">
                    {[
                      { id: "website", label: dict.welcomeCards.websiteTitle, prompt: dict.welcomeCards.websitePrompt },
                      { id: "agents", label: dict.welcomeCards.agentsTitle, prompt: dict.welcomeCards.agentsPrompt },
                      { id: "automation", label: dict.welcomeCards.automationTitle, prompt: dict.welcomeCards.automationPrompt },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setConfirmPrompt(item.prompt)}
                        className="flex-shrink-0 whitespace-nowrap rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-300 ring-1 ring-white/[0.1] active:bg-white/[0.1]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleCustomSubmit}
                  className="flex items-center gap-2 rounded-full bg-zinc-900/50 px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-emerald-500/30 transition-all duration-200 focus-within:ring-emerald-500/50 focus-within:bg-zinc-900/80 animate-glow-emerald"
                >
                  <Input
                    ref={inputRefMobile}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoading ? CONSOLE.buttonSubmitting : COPY.workshopInputPlaceholder}
                    disabled={isLoading}
                    className="min-h-12 min-w-0 flex-1 border-0 bg-transparent text-base text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70"
                    aria-label={COPY.inputAriaLabel}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    aria-label={CONSOLE.buttonSubmit}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 shadow-none ring-1 ring-white/[0.06] transition-all hover:bg-white/[0.1] hover:text-zinc-100 hover:shadow-[0_0_20px_-4px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="size-5" aria-hidden />
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
              {/* Quick prompts below agent windows (desktop): user sees bot output first */}
              {showWelcomeCards && (
                <div className="px-4 py-4 sm:px-5 sm:py-5 hidden md:block shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500 sm:mb-4 sm:text-sm">
                    {COPY.quickActionsTitle}
                  </p>
                  <WelcomeCards onSelect={handleQuickAction} disabled={isLoading} />
                </div>
              )}
              {!limitReached && (
                <>
                  <div className="flex justify-center py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                    <span className="text-xs font-medium tabular-nums text-zinc-500">
                      {COPY.workshopProgress.replace("{current}", String(interactionCount)).replace("{max}", String(MAX_INTERACTIONS))}
                    </span>
                  </div>
                  <div className="px-4 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                    <form
                      onSubmit={handleCustomSubmit}
                      className="mx-auto flex max-w-[600px] items-center gap-2 rounded-full bg-zinc-900/50 px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-emerald-500/30 backdrop-blur-md transition-all duration-200 focus-within:ring-emerald-500/50 focus-within:bg-zinc-900/80 md:px-4 md:py-3 animate-glow-emerald"
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
                        aria-label={CONSOLE.buttonSubmit}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 shadow-none ring-1 ring-white/[0.06] transition-all hover:bg-white/[0.1] hover:text-zinc-100 hover:shadow-[0_0_20px_-4px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:shadow-none"
                      >
                        <Send className="size-4" aria-hidden />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Limit reached: CTA inside console */}
            {limitReached && (
              <div className="px-4 py-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                <p className="text-center text-base font-medium text-zinc-300">
                  {CONSOLE.limitMessage}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link href={`/${localeSegment}#projekty`}>
                    <Button
                      variant="outline"
                      className="rounded-xl bg-white/[0.03] text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.08] hover:bg-white/[0.06] hover:text-zinc-100"
                    >
                      {dict.projects.sectionTitle}
                    </Button>
                  </Link>
                  <Link href={`/${localeSegment}/projekty/fotarobota`}>
                    <Button
                      variant="outline"
                      className="rounded-xl bg-white/[0.03] text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.08] hover:bg-white/[0.06] hover:text-zinc-100"
                    >
                      {dict.header.navFotarobota}
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Sticky action bar: Generate Brief — always visible after first message */}
            {showGenerateBriefButton && (
              <div className="sticky bottom-0 left-0 right-0 z-20 bg-black/90 px-4 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md">
                <div className="mx-auto flex max-w-[600px] justify-center">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => {
                      // On narrow screens show the confirm popup; on desktop open email modal directly
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        setBriefConfirmOpen(true);
                      } else {
                        setBriefModalOpen(true);
                      }
                    }}
                    className="min-h-11 rounded-xl bg-zinc-950 font-semibold text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.1] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] hover:ring-white/[0.15]"
                  >
                    <FileText className="mr-2 size-4 shrink-0" aria-hidden />
                    {COPY.generateBriefButton}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brief modal: email + send */}
      {
        briefModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="brief-modal-title"
          >
            <div className="w-full max-w-md rounded-xl bg-zinc-900/95 p-6 shadow-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.08] backdrop-blur-md">
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
                  className="h-11 rounded-lg bg-white/[0.03] text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.08] placeholder:text-zinc-500 focus-visible:ring-white/[0.15]"
                  autoFocus
                  disabled={briefSending}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl bg-white/[0.03] text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.08] hover:bg-white/[0.06] hover:text-zinc-100"
                  onClick={() => setBriefModalOpen(false)}
                  disabled={briefSending}
                >
                  {COPY.briefModalCancel}
                </Button>
                <Button
                  type="button"
                  className="flex-1 rounded-xl bg-white/[0.08] font-medium text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.1] hover:bg-white/[0.12] hover:shadow-[0_0_20px_-4px_rgba(139,92,246,0.35)]"
                  onClick={handleSendBrief}
                  disabled={!briefEmail.trim() || briefSending}
                >
                  {briefSending ? COPY.briefGenerating : COPY.briefModalSubmit}
                </Button>
              </div>
            </div>
          </div>
        )
      }
      {/* Global animations for chatbot UI */}
      <style jsx global>{`
        @keyframes glow-emerald {
          0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.05); border-color: rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.4), inset 0 1px 0 0 rgba(255,255,255,0.05); border-color: rgba(16, 185, 129, 0.6); }
        }
        .animate-glow-emerald {
          animation: glow-emerald 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
