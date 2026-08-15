"use client";

import { useEffect, useRef } from "react";
import {
  CONSENT_STORAGE_KEY,
  getAdsConversionSendTo,
  getAnalyticsConfig,
  type ConsentChoice,
} from "@/lib/seo";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type Props = {
  orderId: string;
  value: number;
  currency?: string;
};

/**
 * Fires GA4 purchase + Google Ads conversion once per order when consent is granted.
 */
export function PurchaseConversion({
  orderId,
  value,
  currency = "BGN",
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

    function fire() {
      if (sent.current) return;
      let consent: ConsentChoice | null = null;
      try {
        consent = localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentChoice | null;
      } catch {
        return;
      }
      if (consent !== "accepted") return;
      if (typeof window.gtag !== "function") return;

      const key = `lsp_purchase_tracked_${orderId}`;
      try {
        if (sessionStorage.getItem(key)) {
          sent.current = true;
          return;
        }
      } catch {
        /* continue */
      }

      const { gaMeasurementId } = getAnalyticsConfig();
      const sendTo = getAdsConversionSendTo();

      if (gaMeasurementId) {
        window.gtag("event", "purchase", {
          transaction_id: orderId,
          value,
          currency,
          send_to: gaMeasurementId,
        });
      }

      if (sendTo) {
        window.gtag("event", "conversion", {
          send_to: sendTo,
          value,
          currency,
          transaction_id: orderId,
        });
      }

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
    // Re-check shortly after consent banner accept on same tab
    const t = window.setInterval(fire, 800);
    const stop = window.setTimeout(() => window.clearInterval(t), 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [orderId, value, currency]);

  return null;
}
