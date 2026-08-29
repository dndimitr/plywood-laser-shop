"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  META_CONSENT_EVENT,
  hasMarketingConsent,
  trackPageView,
} from "@/lib/tracking-client";

/**
 * Pixel + CAPI PageView on every route (with shared event_id).
 * CookieConsent only grants Pixel consent — this owns PageView so SPA
 * navigations still send fbc-backed events.
 */
export function MetaPageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    async function fire(force = false) {
      if (!hasMarketingConsent()) return;
      if (!force && lastPath.current === pathname) return;
      lastPath.current = pathname;
      await trackPageView();
    }

    void fire();

    function onConsent() {
      lastPath.current = null;
      void fire(true);
    }

    window.addEventListener(META_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(META_CONSENT_EVENT, onConsent);
  }, [pathname]);

  return null;
}
