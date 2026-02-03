"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

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
    // Fallback jeśli AI wypluje zwykły tekst
  }
  return null;
}

export default function AIDuelLayout() {
  const [input, setInput] = useState("");
  const [devResponse, setDevResponse] = useState("");
  const [bizResponse, setBizResponse] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const rawContent = useMemo(
    () => getAssistantTextContent(messages),
    [messages]
  );
  const parsed = useMemo(() => parseDuelJson(rawContent), [rawContent]);

  // Po zakończeniu streamu parsujemy JSON i ustawiamy dev/biz
  useEffect(() => {
    if (parsed) {
      setDevResponse(parsed.dev);
      setBizResponse(parsed.biz);
    }
  }, [parsed]);

  // Efekt "pisania" w czasie rzeczywistym – podczas ładowania
  useEffect(() => {
    if (isLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant") {
        setDevResponse("Analyzing architecture...");
        setBizResponse("Calculating ROI...");
      }
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#020617] font-mono text-white">
      {/* GŁÓWNA SCENA - DWA PANELE */}
      <div className="relative z-10 flex flex-1 flex-col md:flex-row">
        {/* LEWY PANEL - DEV (Terminal Style) */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 border-r border-gray-800/50 bg-[#0a0a0a] p-6"
        >
          <div className="mb-4 flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500">
              developer_persona
            </span>
          </div>

          <div className="space-y-4 font-mono text-sm text-green-400 md:text-base">
            <div>
              <span className="text-blue-400">user@baluniak</span>
              <span className="text-white">:</span>
              <span className="text-blue-300">~</span>
              <span className="text-white">$ init_protocol</span>
            </div>

            {/* Tutaj wyświetlamy odpowiedź DEVA */}
            <div className="typing-effect min-h-[100px] whitespace-pre-wrap">
              {devResponse || "> Waiting for input..."}
              {isLoading && <span className="animate-pulse">_</span>}
            </div>
          </div>
        </motion.div>

        {/* PRAWY PANEL - BIZNES (Glassmorphism) */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 bg-gradient-to-br from-gray-900 to-[#020617] p-6"
        >
          <div className="mb-6 border-b border-gray-700 pb-2">
            <h2 className="font-sans text-xl font-bold text-white">
              Business Persona
            </h2>
            <p className="font-sans text-xs text-gray-400">
              Strategic View • ROI Focus
            </p>
          </div>

          {/* Tutaj wyświetlamy odpowiedź BIZNESU */}
          <div className="min-h-[150px] rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="font-sans leading-relaxed text-gray-200">
              {bizResponse ||
                "Summaries and recommendations will appear here in clear, non-technical language."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* INPUT AREA - TO CZEGO BRAKOWAŁO */}
      <div className="relative z-20 border-t border-gray-800 bg-[#050505] p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-4xl gap-4"
        >
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-green-500">
              {">"}
            </span>
            <input
              className="w-full rounded-lg border border-gray-700 bg-[#0f1115] py-4 pl-10 pr-4 text-white transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Wpisz pomysł na aplikację (np. Tinder dla psów)..."
              disabled={isLoading}
              aria-label="Wpisz pomysł na aplikację"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? "ANALYZING..." : "EXECUTE"}
          </button>
        </form>
      </div>
    </div>
  );
}
