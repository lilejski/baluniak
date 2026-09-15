"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalEmbed } from "@/components/CalEmbed";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

const PROJECT_TYPE_VALUES = ["program", "strona-internetowa", "konsultacja-ai", "audyt", "inne"] as const;
type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

function getProjectTypeOptions(w: Record<string, string>): { value: ProjectType; label: string }[] {
    return [
        { value: "program", label: w.projectTypeMvp80 },
        { value: "strona-internetowa", label: w.projectTypeStronaInternetowa },
        { value: "konsultacja-ai", label: w.projectTypeKonsultacjaAi },
        { value: "audyt", label: w.projectTypeAudyt },
        { value: "inne", label: w.projectTypeInne },
    ];
}

export function ContactSection() {
    const { dict, lang } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    const calRef = useRef<HTMLDivElement>(null);
    const fp = dict.formPlaceholders;
    const w = dict.wspolpraca;

    const fastTrackSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(1, w.errorName),
                email: z.string().email(w.errorEmail),
                projectType: z.enum(PROJECT_TYPE_VALUES, { message: w.errorProjectType }),
                message: z.string().min(1, w.errorMessage),
            }),
        [w.errorName, w.errorEmail, w.errorProjectType, w.errorMessage]
    );

    type FastTrackFormData = z.infer<typeof fastTrackSchema>;
    const projectTypeOptions = useMemo(() => getProjectTypeOptions(w), [w]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FastTrackFormData>({
        resolver: zodResolver(fastTrackSchema),
        defaultValues: { projectType: undefined },
    });

    const onSubmit = async (data: FastTrackFormData) => {
        const subjectLabel = projectTypeOptions.find((o) => o.value === data.projectType)?.label ?? data.projectType ?? "";
        const res = await fetch("/api/send-contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: data.name.trim(),
                email: data.email.trim(),
                subject: subjectLabel,
                message: data.message.trim(),
            }),
        });
        const json = (await res.json()) as { success?: boolean; error?: string };
        if (res.ok && json.success) {
            setSubmitted(true);
            track("generate_lead", { form: "contact", project_type: data.projectType });
            reset({ name: "", email: "", projectType: undefined, message: "" });
            calRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            alert(json.error ?? w.sendError ?? "Błąd wysyłania.");
        }
    };

    return (
        <section id="contact" className="bg-zinc-950/20 py-24 sm:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <header className="mb-16 text-center">
                    <h2 className="text-3xl font-light tracking-tight text-zinc-100 sm:text-4xl">
                        {w.pageTitle}
                    </h2>
                    <p className="mt-4 text-zinc-400 sm:text-lg">
                        {w.pageSubtitle}
                    </p>
                </header>

                <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
                    <div className="order-2 lg:order-1">
                        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-xl">
                            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                                <span className="size-2 rounded-full bg-emerald-500/80" />
                                <span className="size-2 rounded-full bg-zinc-600" />
                                <span className="size-2 rounded-full bg-zinc-600" />
                                <span className="ml-2 text-xs font-medium text-zinc-500">
                                    {w.formTitle}
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
                                            <p className="text-lg font-medium text-zinc-100">{w.successTitle}</p>
                                            <p className="mt-1 text-sm text-zinc-500">{w.successHint}</p>
                                        </motion.div>
                                    ) : (
                                        <motion.form
                                            key={`form-${lang}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={(e) => { void handleSubmit(onSubmit)(e); }}
                                            className="space-y-5"
                                        >
                                            <div>
                                                <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">{w.labelName}</label>
                                                <input
                                                    id="name"
                                                    {...register("name")}
                                                    className={cn(
                                                        "w-full rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                                                        errors.name ? "border-rose-500/50" : "border-zinc-700"
                                                    )}
                                                    placeholder={fp.namePlaceholder}
                                                />
                                                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">{w.labelEmail}</label>
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
                                                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="projectType" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">{w.labelHowCanIHelp}</label>
                                                <select
                                                    id="projectType"
                                                    {...register("projectType")}
                                                    className={cn(
                                                        "w-full rounded-lg border bg-zinc-800/80 px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50",
                                                        errors.projectType ? "border-rose-500/50" : "border-zinc-700"
                                                    )}
                                                >
                                                    <option value="">{w.selectPlaceholder}</option>
                                                    {projectTypeOptions.map(({ value, label }) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                                {errors.projectType && <p className="mt-1 text-xs text-rose-400">{errors.projectType.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="message" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">{w.labelMessage}</label>
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
                                                {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message.message}</p>}
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                size="lg"
                                                className="min-h-12 w-full bg-emerald-600 font-semibold hover:bg-emerald-500"
                                            >
                                                <Send className="mr-2 size-5 shrink-0" />
                                                {isSubmitting ? w.submitting : w.submitButton}
                                            </Button>

                                            <p className="text-center text-xs text-zinc-500">
                                                {w.guarantee}
                                            </p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div ref={calRef} className="order-1 lg:order-2 min-w-0 flex-1">
                        <div className="relative overflow-visible rounded-xl border border-zinc-800 bg-zinc-900/50 shadow-[0_0_60px_rgba(16,185,129,0.08)]">
                            <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
                                <Calendar className="size-4 text-emerald-500" />
                                <span className="text-sm font-medium text-zinc-300">{w.calendarTitle}</span>
                            </div>
                            <div className="relative min-h-[700px] w-full">
                                <CalEmbed
                                    fallbackMessage={w.calendarLoadError}
                                    fallbackEmail={dict.footer.email}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
