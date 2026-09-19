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

const bodyText = "text-[1.0625rem] leading-[1.75] text-fg-prose";

export function PostBody({ markdown }: { markdown: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2
              id={slugifyHeading(children)}
              className="text-h2 mt-14 scroll-mt-24"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              id={slugifyHeading(children)}
              className="text-h3 mt-10 scroll-mt-24"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`mt-5 ${bodyText}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`mt-5 space-y-2.5 ${bodyText}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`mt-5 list-decimal space-y-2.5 pl-5 marker:text-fg-subtle ${bodyText}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="relative pl-5 before:absolute before:left-0 before:top-[0.72em] before:size-1.5 before:rounded-full before:bg-accent [ol>&]:pl-0 [ol>&]:before:hidden">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-fg">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-6 border-l-2 border-accent pl-5 italic [&_p]:text-fg-muted">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[0.875em] text-fg [pre_&]:bg-transparent [pre_&]:p-0">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="card mt-6 overflow-x-auto p-4 font-mono text-sm leading-relaxed text-fg">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-12 border-border" />,
          a: ({ href, children }: ComponentPropsWithoutRef<"a">) => {
            const target = href ?? "#";
            const isInternal = target.startsWith("/") || target.startsWith("#");
            const className = "link-inline font-medium";

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
            <div className="mt-6 overflow-x-auto rounded-md border border-border">
              <table className="w-full border-collapse text-[0.9375rem]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-surface px-4 py-2.5 text-left font-semibold text-fg">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border px-4 py-2.5 text-fg-prose">{children}</td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
