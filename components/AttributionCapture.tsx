"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/**
 * Records where the visitor came from, once, on their first page.
 *
 * Rendered in the locale layout so it runs whichever page they land on —
 * an article shared in a group is just as likely an entry point as the home
 * page, and the whole point is to catch the real one.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
