"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/seo-client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function applyConsent(choice: ConsentChoice) {
  const granted = choice === "accepted";
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  }
  if (typeof window.fbq === "function") {
    window.fbq("consent", granted ? "grant" : "revoke");
    // Single PageView after grant — with eventID for Pixel ↔ CAPI dedup
    if (granted) {
      const eventId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? `pv_${crypto.randomUUID().replace(/-/g, "")}`
          : `pv_${Date.now()}`;
      window.fbq("track", "PageView", {}, { eventID: eventId });
      void fetch("/api/meta/capi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "PageView",
          eventId,
          eventSourceUrl: window.location.href.split("#")[0],
          consent: true,
          fbp: document.cookie
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith("_fbp="))
            ?.slice(5),
        }),
        keepalive: true,
      }).catch(() => {});
    }
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: granted ? "cookie_consent_accepted" : "cookie_consent_rejected",
  });
}

type Props = {
  /** When false, banner is hidden (no marketing IDs configured). */
  enabled?: boolean;
};

/**
 * GDPR-friendly cookie banner. Marketing tags load with Consent Mode defaults
 * denied; accepting updates consent for Analytics / Ads / Meta Pixel.
 */
export function CookieConsent({ enabled = true }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    try {
      const stored = localStorage.getItem(
        CONSENT_STORAGE_KEY,
      ) as ConsentChoice | null;
      if (stored === "accepted" || stored === "rejected") {
        applyConsent(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [enabled]);

  function choose(choice: ConsentChoice) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    applyConsent(choice);
    setVisible(false);
  }

  if (!enabled || !visible) return null;

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
    >
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p id="cookie-consent-title" className="cookie-consent-title">
            Бисквитки и измерване
          </p>
          <p className="cookie-consent-text">
            Използваме бисквитки за работа на магазина и — с ваше съгласие — за
            Google Analytics, Google Ads и Meta Pixel, за да подобрим сайта и
            рекламите. Можете да откажете маркетинговите бисквитки. Вижте{" "}
            <Link href="/legal/privacy">политиката за поверителност</Link>.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => choose("rejected")}
          >
            Само необходими
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => choose("accepted")}
          >
            Приемам
          </button>
        </div>
      </div>
    </div>
  );
}
