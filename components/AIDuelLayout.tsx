"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

const panelVariants = {
  hiddenLeft: { opacity: 0, x: -24 },
  hiddenRight: { opacity: 0, x: 24 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const inputBarVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.35, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

function parseDuelJson(raw: string): { dev_response: string; biz_response: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "dev_response" in parsed &&
      "biz_response" in parsed &&
      typeof (parsed as { dev_response: unknown }).dev_response === "string" &&
      typeof (parsed as { biz_response: unknown }).biz_response === "string"
    ) {
      return {
        dev_response: (parsed as { dev_response: string }).dev_response,
        biz_response: (parsed as { biz_response: string }).biz_response,
      };
    }
  } catch {
    // partial or invalid JSON
  }
  return null;
}

function getAssistantTextContent(messages: { role: string; parts?: Array<{ type: string; text?: string }> }[]): string {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  if (!lastAssistant?.parts) return "";
  return lastAssistant.parts
    .filter((p): p is { type: string; text: string } => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
}

export function AIDuelLayout() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new TextStreamChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const rawContent = useMemo(() => getAssistantTextContent(messages), [messages]);
  const parsed = useMemo(() => parseDuelJson(rawContent), [rawContent]);

  const lastUserMessage = useMemo(() => {
    const user = [...messages].reverse().find((m) => m.role === "user");
    if (!user?.parts) return null;
    const textPart = user.parts.find((p: { type: string }) => p.type === "text");
    return typeof (textPart as { text?: string } | undefined)?.text === "string"
      ? (textPart as { text: string }).text
      : null;
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-zinc-950">
      <div className="flex min-h-0 flex-1">
        {/* Left: Developer Persona – dark terminal */}
        <motion.div
          custom={0.15}
          variants={panelVariants}
          initial="hiddenLeft"
          animate="visible"
          className="flex w-1/2 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950"
        >
          <div className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500/80" />
              <span className="size-3 rounded-full bg-amber-500/80" />
              <span className="size-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-zinc-500">
                developer_persona
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {lastUserMessage && (
              <div className="mb-4 text-zinc-500">
                <span className="text-zinc-500">&gt;</span> {lastUserMessage}
              </div>
            )}
            {isLoading && !parsed && (
              <p className="text-emerald-400/90">
                Thinking...
                <span className="animate-pulse">▌</span>
              </p>
            )}
            {parsed && (
              <div className="prose prose-invert prose-sm max-w-none [&_pre]:bg-zinc-900 [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                <ReactMarkdown>{parsed.dev_response}</ReactMarkdown>
                {isLoading && (
                  <span className="animate-pulse text-emerald-400">▌</span>
                )}
              </div>
            )}
            {!isLoading && !parsed && !lastUserMessage && (
              <div className="space-y-1 text-emerald-400/90">
                <p>
                  <span className="text-zinc-500">&gt;</span> node --version
                </p>
                <p className="text-zinc-400">v20.10.0</p>
                <p>
                  <span className="text-zinc-500">&gt;</span> npm run dev
                </p>
                <p className="text-zinc-400">Ready in 1.2s</p>
                <p>
                  <span className="text-zinc-500">&gt;</span>{" "}
                  <span className="text-amber-300/90">_</span>
                </p>
                <p className="mt-6 text-zinc-500 text-xs">
                  Type an idea above and hit Enter. Technical steps will appear
                  here in Markdown.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Business Persona – light glassmorphism */}
        <motion.div
          custom={0.3}
          variants={panelVariants}
          initial="hiddenRight"
          animate="visible"
          className="flex w-1/2 flex-col overflow-hidden bg-zinc-900/50"
        >
          <div
            className="flex flex-1 flex-col overflow-auto border-l border-white/10 bg-white/5 backdrop-blur-xl"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white/95">Business Persona</h2>
              <p className="mt-0.5 text-sm text-white/60">
                Strategic view · KPIs · Stakeholder language
              </p>
            </div>
            <div className="flex-1 overflow-auto p-5 text-sm text-white/80">
              {isLoading && !parsed && (
                <p className="leading-relaxed">
                  Thinking...
                  <span className="animate-pulse">▌</span>
                </p>
              )}
              {parsed && (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {parsed.biz_response}
                  {isLoading && (
                    <span className="animate-pulse text-white">▌</span>
                  )}
                </div>
              )}
              {!isLoading && !parsed && (
                <>
                  <p className="leading-relaxed">
                    Summaries and recommendations will appear here in clear,
                    non-technical language.
                  </p>
                  <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-white/70 text-xs uppercase tracking-wider">
                      Placeholder
                    </p>
                    <p className="mt-2 text-white/90">
                      Business value and monetization strategy will stream here.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fixed command-line style input */}
      <motion.div
        variants={inputBarVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md"
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl flex-col gap-2"
        >
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error.message}
            </p>
          )}
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-zinc-500">&gt;</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type idea..."
              disabled={isLoading}
              className="flex-1 min-w-0 rounded border-0 bg-transparent px-2 py-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 disabled:opacity-50"
              aria-label="Message input"
            />
          </div>
        </form>

      </motion.div>

      <div className="h-[72px] shrink-0" aria-hidden />
    </div>
  );
}
