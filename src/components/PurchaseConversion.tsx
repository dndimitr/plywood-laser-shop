"use client";

import { useEffect, useRef } from "react";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/seo-client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

type Props = {
  orderId: string;
  value: number;
  currency?: string;
  gaMeasurementId?: string | null;
  adsConversionSendTo?: string | null;
  metaPixelId?: string | null;
};

/**
 * Fires GA4 purchase, Google Ads conversion, and Meta Purchase once per order
 * when consent is granted.
 */
export function PurchaseConversion({
  orderId,
  value,
  currency = "EUR",
  gaMeasurementId,
  adsConversionSendTo,
  metaPixelId,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

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

      const key = `lsp_purchase_tracked_${orderId}`;
      try {
        if (sessionStorage.getItem(key)) {
          sent.current = true;
          return;
        }
      } catch {
        /* continue */
      }

      let fired = false;

      if (gaMeasurementId && typeof window.gtag === "function") {
        window.gtag("event", "purchase", {
          transaction_id: orderId,
          value,
          currency,
          send_to: gaMeasurementId,
        });
        fired = true;
      }

      if (adsConversionSendTo && typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: adsConversionSendTo,
          value,
          currency,
          transaction_id: orderId,
        });
        fired = true;
      }

      if (metaPixelId && typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          value,
          currency,
          content_ids: [orderId],
          content_type: "product",
        });
        fired = true;
      }

      if (!fired && !gaMeasurementId && !adsConversionSendTo && !metaPixelId) {
        sent.current = true;
        return;
      }
      if (!fired) return;

      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      sent.current = true;
    }

    fire();
    const onStorage = () => fire();
    window.addEventListener("storage", onStorage);
    const t = window.setInterval(fire, 800);
    const stop = window.setTimeout(() => window.clearInterval(t), 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [
    orderId,
    value,
    currency,
    gaMeasurementId,
    adsConversionSendTo,
    metaPixelId,
  ]);

  return null;
}
