"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_STORAGE_KEY,
  hasMarketingScripts,
  type ConsentChoice,
} from "@/lib/seo";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function applyConsent(choice: ConsentChoice) {
  const granted = choice === "accepted";
  const gtag = window.gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", {
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: granted ? "cookie_consent_accepted" : "cookie_consent_rejected",
  });
}

/**
 * GDPR-friendly cookie banner. Marketing tags load with Consent Mode defaults
 * denied; accepting updates consent for Analytics / Ads.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasMarketingScripts()) return;
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentChoice | null;
      if (stored === "accepted" || stored === "rejected") {
        applyConsent(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  function choose(choice: ConsentChoice) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    applyConsent(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-live="polite">
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p id="cookie-consent-title" className="cookie-consent-title">
            Бисквитки и измерване
          </p>
          <p className="cookie-consent-text">
            Използваме бисквитки за работа на магазина и — с ваше съгласие — за
            Google Analytics и Google Ads, за да подобрим сайта и рекламите.
            Можете да откажете маркетинговите бисквитки. Вижте{" "}
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
