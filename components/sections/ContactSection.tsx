"use client";

import { useState, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Calendar, Check, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { CalEmbed } from "@/components/CalEmbed";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

const PROJECT_TYPE_VALUES = ["program", "strona-internetowa", "konsultacja-ai", "audyt", "inne"] as const;
type ProjectType = (typeof PROJECT_TYPE_VALUES)[number];

/** Only the labels the select needs — the rest of the block is not all strings. */
type ProjectTypeLabels = Record<
    | "projectTypeMvp80"
    | "projectTypeStronaInternetowa"
    | "projectTypeKonsultacjaAi"
    | "projectTypeAudyt"
    | "projectTypeInne",
    string
>;

function getProjectTypeOptions(w: ProjectTypeLabels): { value: ProjectType; label: string }[] {
    return [
        { value: "program", label: w.projectTypeMvp80 },
        { value: "strona-internetowa", label: w.projectTypeStronaInternetowa },
        { value: "konsultacja-ai", label: w.projectTypeKonsultacjaAi },
        { value: "audyt", label: w.projectTypeAudyt },
        { value: "inne", label: w.projectTypeInne },
    ];
}

export function ContactSection() {
    const { dict, lang, localeSegment } = useLanguage();
    const [submitted, setSubmitted] = useState(false);
    // The calendar is the rarer path, so it costs nothing until someone asks
    // for it — which also keeps the third-party frame off the home page for
    // everyone who just fills in the form.
    const [calendarOpen, setCalendarOpen] = useState(false);
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
            // The confirmation invites them to book a time, so the calendar
            // had better be open by the time they get there.
            setCalendarOpen(true);
            requestAnimationFrame(() => {
                calRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        } else {
            alert(json.error ?? w.sendError ?? "Błąd wysyłania.");
        }
    };

    return (
        <section id="contact" className="border-t border-border bg-bg section-y">
            <div className="container-page">
                <SectionHeading title={w.pageTitle} lead={w.pageSubtitle} />

                <div className="mx-auto mt-10 w-full max-w-2xl">
                    {/*
                      The builder comes first on purpose: it is the only path
                      that takes an enquiry end to end without me, at any hour.
                      The form and the calendar are the fallbacks for people
                      who would rather not click through questions.
                    */}
                    <div className="card border-accent/40 p-6 md:p-8">
                        <p className="eyebrow">{w.kreatorEyebrow}</p>
                        <h3 className="text-h3 mt-2">{w.kreatorTitle}</h3>
                        <p className="mt-3 text-base leading-relaxed text-fg-muted">{w.kreatorLead}</p>
                        <ul className="mt-5 space-y-2.5">
                            {w.kreatorPoints.map((point) => (
                                <li key={point} className="flex items-start gap-2.5 text-[0.9375rem] text-fg-muted">
                                    <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                                    {point}
                                </li>
                            ))}
                        </ul>
                        <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
                            <Link
                                href={`/${localeSegment}/kreator`}
                                onClick={() => track("kreator_cta", { place: "contact" })}
                            >
                                {w.kreatorButton}
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                        </Button>
                    </div>

                    <div className="my-8 flex items-center gap-4">
                        <span className="h-px flex-1 bg-border" aria-hidden />
                        <span className="text-sm text-fg-subtle">{w.orWriteInstead}</span>
                        <span className="h-px flex-1 bg-border" aria-hidden />
                    </div>

                    <div className="min-w-0">
                        <div className="card overflow-hidden">
                            <div className="border-b border-border px-5 py-4 md:px-7">
                                <p className="text-base font-semibold text-fg">
                                    {w.formTitle}
                                </p>
                            </div>
                            <div className="p-5 md:p-7">
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
                                                className="mb-4 flex size-16 items-center justify-center rounded-full border border-border-strong"
                                            >
                                                <CheckCircle className="size-8 text-accent" strokeWidth={1.5} />
                                            </motion.div>
                                            <p className="text-h4">{w.successTitle}</p>
                                            <p className="mt-1 text-[0.9375rem] text-fg-muted">{w.successHint}</p>
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
                                                <label htmlFor="name" className="field-label">{w.labelName}</label>
                                                <input
                                                    id="name"
                                                    {...register("name")}
                                                    className={cn("field", errors.name && "border-rose-500/60")}
                                                    placeholder={fp.namePlaceholder}
                                                />
                                                {errors.name && <p className="mt-1.5 text-sm text-rose-400">{errors.name.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="field-label">{w.labelEmail}</label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    {...register("email")}
                                                    className={cn("field", errors.email && "border-rose-500/60")}
                                                    placeholder={fp.emailPlaceholder}
                                                />
                                                {errors.email && <p className="mt-1.5 text-sm text-rose-400">{errors.email.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="projectType" className="field-label">{w.labelHowCanIHelp}</label>
                                                <select
                                                    id="projectType"
                                                    {...register("projectType")}
                                                    className={cn("field", errors.projectType && "border-rose-500/60")}
                                                >
                                                    <option value="">{w.selectPlaceholder}</option>
                                                    {projectTypeOptions.map(({ value, label }) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                                {errors.projectType && <p className="mt-1.5 text-sm text-rose-400">{errors.projectType.message}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="message" className="field-label">{w.labelMessage}</label>
                                                <textarea
                                                    id="message"
                                                    {...register("message")}
                                                    rows={3}
                                                    className={cn("field min-h-[120px] resize-none", errors.message && "border-rose-500/60")}
                                                    placeholder={fp.messagePlaceholder}
                                                />
                                                {errors.message && <p className="mt-1.5 text-sm text-rose-400">{errors.message.message}</p>}
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isSubmitting}
                                                size="lg"
                                                className="w-full"
                                            >
                                                {isSubmitting ? w.submitting : w.submitButton}
                                            </Button>

                                            <p className="text-center text-sm text-fg-subtle">
                                                {w.guarantee}
                                            </p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div ref={calRef} className="mt-6 min-w-0">
                        {calendarOpen ? (
                            <div className="card relative overflow-visible">
                                <div className="flex items-center gap-2.5 border-b border-border px-5 py-4 md:px-7">
                                    <Calendar className="size-5 text-accent" strokeWidth={1.5} aria-hidden />
                                    <span className="text-base font-semibold text-fg">{w.calendarTitle}</span>
                                </div>
                                <div className="relative min-h-[700px] w-full">
                                    <CalEmbed
                                        fallbackMessage={w.calendarLoadError}
                                        fallbackEmail={dict.footer.email}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="card flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:justify-between sm:p-6 sm:text-left">
                                <p className="text-base text-fg-muted">{w.calendarToggleLead}</p>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        setCalendarOpen(true);
                                        track("calendar_open", { form: "contact" });
                                    }}
                                >
                                    <Calendar className="size-4" strokeWidth={1.5} aria-hidden />
                                    {w.calendarToggleButton}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
