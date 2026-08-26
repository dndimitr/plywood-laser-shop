"use client";

import { useEffect, useRef } from "react";
import { trackInitiateCheckout } from "@/lib/tracking-client";

type Props = {
  value: number;
  contentIds: string[];
  numItems: number;
  gaId?: string | null;
};

/** Fires Meta + GA4 InitiateCheckout once per checkout page view (after consent). */
export function InitiateCheckoutTracker({
  value,
  contentIds,
  numItems,
  gaId,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    // Allow empty contentIds (custom-only cart) — never block checkout tracking
    if (sent.current || value <= 0) return;
    let cancelled = false;

    async function fire() {
      if (sent.current || cancelled) return;
      const key = `sb_ic_${contentIds.join("_").slice(0, 40)}_${Math.round(value * 100)}`;
      try {
        if (sessionStorage.getItem(key)) {
          sent.current = true;
          return;
        }
      } catch {
        /* continue */
      }
      await trackInitiateCheckout({
        value,
        contentIds,
        numItems,
        gaId,
      });
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      sent.current = true;
    }

    fire();
    const t = window.setInterval(fire, 900);
    const stop = window.setTimeout(() => window.clearInterval(t), 15000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [value, contentIds, numItems, gaId]);

  return null;
}
