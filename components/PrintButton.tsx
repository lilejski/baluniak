"use client";

import { FileDown } from "lucide-react";

/** Opens the browser's print dialog, where "Save as PDF" turns the page into a CV. */
export function PrintButton({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <FileDown className="size-4" aria-hidden />
      {label}
    </button>
  );
}
