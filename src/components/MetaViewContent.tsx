"use client";

import { useEffect, useRef } from "react";
import {
  hasMarketingConsent,
  newClientEventId,
  sendCapiBrowserPublic,
} from "@/lib/tracking-client";

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

/** Meta Pixel + CAPI ViewContent on product pages (after consent). */
export function MetaViewContent({
  contentId,
  contentName,
  value,
  currency = "EUR",
  enabled = true,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (!enabled || sent.current) return;

    async function fire() {
      if (sent.current) return;
      if (!hasMarketingConsent()) return;
      if (typeof window.fbq !== "function") return;

      const eventId = newClientEventId("vc");
      window.fbq(
        "track",
        "ViewContent",
        {
          content_ids: [contentId],
          content_name: contentName,
          content_type: "product",
          value,
          currency,
        },
        { eventID: eventId },
      );
      void sendCapiBrowserPublic("ViewContent", {
        eventId,
        value,
        currency,
        contentIds: [contentId],
        contentName,
      });
      sent.current = true;
    }

    void fire();
    const t = window.setInterval(() => void fire(), 800);
    const stop = window.setTimeout(() => window.clearInterval(t), 12000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [contentId, contentName, value, currency, enabled]);

  return null;
}
