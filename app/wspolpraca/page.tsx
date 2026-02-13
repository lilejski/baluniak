"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Zap, Send, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const CAL_COM_LINK = "baluniak/30min";

const fastTrackSchema = z.object({
  name: z.string().min(1, "Podaj imię lub firmę"),
  email: z.string().email("Podaj poprawny email"),
  projectType: z.enum(["mvp80", "konsultacja-ai", "audyt", "inne"], {
    message: "Wybierz rodzaj współpracy",
  }),
  message: z.string().min(1, "Opisz krótko wyzwanie"),
});

type FastTrackFormData = z.infer<typeof fastTrackSchema>;

const PROJECT_TYPE_OPTIONS: { value: FastTrackFormData["projectType"]; label: string }[] = [
  { value: "mvp80", label: "MVP w 80h" },
  { value: "konsultacja-ai", label: "Konsultacja AI" },
  { value: "audyt", label: "Audyt Produktu" },
  { value: "inne", label: "Inne" },
];

export default function WspolpracaPage() {
  const { dict } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const fp = dict.formPlaceholders;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FastTrackFormData>({
    resolver: zodResolver(fastTrackSchema),
    defaultValues: {
      projectType: undefined,
    },
  });

  const onSubmit = async (data: FastTrackFormData) => {
    const res = await fetch("/api/fast-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        projectType: data.projectType,
        message: data.message,
      }),
    });
    if (!res.ok) throw new Error("Send failed");
    setSubmitted(true);
    calRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:px-6 lg:py-16 lg:pb-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Fast-Track: Zacznijmy budować.
          </h1>
          <p className="mt-3 text-zinc-400 sm:text-lg">
            Wybierz termin w kalendarzu lub zostaw krótką wiadomość. Od startu Twojego projektu dzieli Cię 30 sekund.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* LEFT: Fast-Track Contact Form — Terminal / Dashboard feel */}
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <span className="size-2 rounded-full bg-emerald-500/80" />
                <span className="size-2 rounded-full bg-zinc-600" />
                <span className="size-2 rounded-full bg-zinc-600" />
                <span className="ml-2 text-xs font-medium text-zinc-500">
                  Fast-Track Contact
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="mb-4 flex size-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-950/50"
                      >
                        <CheckCircle className="size-8 text-emerald-400" />
                      </motion.div>
                      <p className="text-lg font-medium text-zinc-100">
                        Zgłoszenie wysłane.
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Przejdź do kalendarza poniżej i zarezerwuj termin.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Imię / Firma
                        </label>
                        <input
                          id="name"
                          {...register("name")}
                          className={cn(
                            "w-full rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                            errors.name ? "border-rose-500/50" : "border-zinc-700"
                          )}
                          placeholder={fp.namePlaceholder}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={cn(
                            "w-full rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                            errors.email ? "border-rose-500/50" : "border-zinc-700"
                          )}
                          placeholder={fp.emailPlaceholder}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="projectType" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                          W czym mogę pomóc?
                        </label>
                        <select
                          id="projectType"
                          {...register("projectType")}
                          className={cn(
                            "w-full rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                            errors.projectType ? "border-rose-500/50" : "border-zinc-700"
                          )}
                        >
                          <option value="">— wybierz —</option>
                          {PROJECT_TYPE_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        {errors.projectType && (
                          <p className="mt-1 text-xs text-rose-400">{errors.projectType.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                          Krótki opis wyzwania
                        </label>
                        <textarea
                          id="message"
                          {...register("message")}
                          rows={3}
                          className={cn(
                            "w-full resize-none rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                            errors.message ? "border-rose-500/50" : "border-zinc-700"
                          )}
                          placeholder={fp.messagePlaceholder}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-rose-400">{errors.message.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="min-h-12 w-full bg-emerald-600 font-semibold hover:bg-emerald-500"
                      >
                        <Send className="mr-2 size-5 shrink-0" />
                        {isSubmitting ? "Wysyłanie…" : "Wyślij i przejdź do kalendarza"}
                      </Button>

                      <p className="text-center text-xs text-zinc-500">
                        Gwarantowana odpowiedź w 12h lub darmowa konsultacja.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT: Cal.com Direct Booking */}
          <div ref={calRef} className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                <Calendar className="size-4 text-emerald-500" />
                <span className="text-sm font-medium text-zinc-300">
                  Zarezerwuj termin bezpośrednio
                </span>
              </div>
              <div className="relative min-h-[500px] w-full">
                <iframe
                  title="Cal.com — rezerwacja 30 min"
                  src={`https://cal.com/${CAL_COM_LINK}?theme=dark`}
                  className="h-[600px] w-full border-0"
                  style={{ minHeight: "500px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
