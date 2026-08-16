"use client";

import { useEffect, useRef } from "react";
import {
  hasMarketingConsent,
  trackPurchaseBrowser,
} from "@/lib/tracking-client";

type Props = {
  orderId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
  email?: string | null;
  phone?: string | null;
  gaMeasurementId?: string | null;
  adsConversionSendTo?: string | null;
  metaPixelId?: string | null;
};

/**
 * Fires GA4 purchase, Google Ads conversion, and Meta Purchase (Pixel + CAPI)
 * once per order when consent is granted. Uses event_id = purchase_{orderId}
 * for Pixel ↔ CAPI deduplication (iOS 14+).
 */
export function PurchaseConversion({
  orderId,
  value,
  currency = "EUR",
  contentIds,
  email,
  phone,
  gaMeasurementId,
  adsConversionSendTo,
  metaPixelId,
}: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

    async function fire() {
      if (sent.current) return;
      const key = `lsp_purchase_tracked_${orderId}`;
      try {
        if (sessionStorage.getItem(key)) {
          sent.current = true;
          return;
        }
      } catch {
        /* continue */
      }

      const hasTargets = Boolean(
        gaMeasurementId || adsConversionSendTo || metaPixelId,
      );
      if (!hasTargets) {
        sent.current = true;
        return;
      }
      if (!hasMarketingConsent()) return;

      await trackPurchaseBrowser({
        orderId,
        value,
        currency,
        contentIds,
        email: email ?? undefined,
        phone: phone ?? undefined,
        gaId: gaMeasurementId,
        adsSendTo: adsConversionSendTo,
      });

      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      sent.current = true;
    }

    void fire();
    const onStorage = () => void fire();
    window.addEventListener("storage", onStorage);
    const t = window.setInterval(() => void fire(), 800);
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
    contentIds,
    email,
    phone,
    gaMeasurementId,
    adsConversionSendTo,
    metaPixelId,
  ]);

  return null;
}
