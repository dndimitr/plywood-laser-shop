"use client";

import { useEffect } from "react";
import {
  applyUtmToGa4,
  captureUtmFromLocation,
  hasMarketingConsent,
} from "@/lib/tracking-client";

/**
 * Captures UTM / gclid / fbclid on first land and pushes campaign to GA4
 * after consent — for Meta Ads ↔ GA4 cross-check.
 */
export function UtmCapture() {
  useEffect(() => {
    const utm = captureUtmFromLocation();
    if (!hasMarketingConsent()) return;
    applyUtmToGa4(utm);
    const t = window.setInterval(() => {
      if (hasMarketingConsent()) applyUtmToGa4(utm);
    }, 1000);
    const stop = window.setTimeout(() => window.clearInterval(t), 12000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, []);

  return null;
}
