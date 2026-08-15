"use client";

import { useEffect, useRef } from "react";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/seo-client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type Props = {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
  enabled?: boolean;
};

/** Meta Pixel ViewContent on product pages (after consent). */
export function MetaViewContent({
  contentId,
  contentName,
  value,
  currency = "BGN",
  enabled = true,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (!enabled || sent.current) return;

    function fire() {
      if (sent.current) return;
      let consent: ConsentChoice | null = null;
      try {
        consent = localStorage.getItem(
          CONSENT_STORAGE_KEY,
        ) as ConsentChoice | null;
      } catch {
        return;
      }
      if (consent !== "accepted") return;
      if (typeof window.fbq !== "function") return;

      window.fbq("track", "ViewContent", {
        content_ids: [contentId],
        content_name: contentName,
        content_type: "product",
        value,
        currency,
      });
      sent.current = true;
    }

    fire();
    const t = window.setInterval(fire, 800);
    const stop = window.setTimeout(() => window.clearInterval(t), 12000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [contentId, contentName, value, currency, enabled]);

  return null;
}
