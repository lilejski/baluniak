import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";

/**
 * Renders an article body.
 *
 * Two things matter here beyond looks. Headings get stable ids so the table of
 * contents and any deep link into the article work, and internal links render
 * through next/link so moving between articles stays a client-side navigation
 * rather than a full reload — which is what makes internal linking pleasant to
 * actually use.
 */

function slugifyHeading(children: React.ReactNode): string {
  const text = Array.isArray(children) ? children.join("") : String(children ?? "");
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2
              id={slugifyHeading(children)}
              className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight text-zinc-100 text-balance sm:text-3xl"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugifyHeading(children)}
              className="mt-8 scroll-mt-24 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mt-5 text-[0.95rem] leading-relaxed text-zinc-300 sm:text-base">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mt-5 space-y-2.5 text-[0.95rem] leading-relaxed text-zinc-300 sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-5 list-decimal space-y-2.5 pl-5 text-[0.95rem] leading-relaxed text-zinc-300 marker:text-emerald-500/70 sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:rounded-full before:bg-emerald-500/70 [ol>&]:pl-0 [ol>&]:before:hidden">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 border-emerald-500/60 py-1 pl-5 text-[0.95rem] italic leading-relaxed text-zinc-300 sm:text-base">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-300">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="mt-6 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm leading-relaxed text-zinc-200">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-10 border-zinc-800" />,
          a: ({ href, children }: ComponentPropsWithoutRef<"a">) => {
            const target = href ?? "#";
            const isInternal = target.startsWith("/") || target.startsWith("#");
            const className =
              "font-medium text-emerald-400 underline decoration-emerald-500/40 underline-offset-4 transition-colors hover:text-emerald-300 hover:decoration-emerald-400";

            if (isInternal) {
              return (
                <Link href={target} className={className}>
                  {children}
                </Link>
              );
            }
            return (
              <a href={target} target="_blank" rel="noopener noreferrer" className={className}>
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-left font-medium text-zinc-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-zinc-800/60 px-4 py-2.5 text-zinc-300">{children}</td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
