/** Browser tracking helpers — Meta Pixel + GA4 + UTM (client-only). */

import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/seo-client";

export const UTM_STORAGE_KEY = "sb_utm_v1";

export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function hasMarketingConsent(): boolean {
  try {
    return (
      (localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentChoice | null) ===
      "accepted"
    );
  } catch {
    return false;
  }
}

export function readUtm(): UtmParams {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmParams;
  } catch {
    return {};
  }
}

export function captureUtmFromLocation(search = ""): UtmParams {
  const params = new URLSearchParams(
    search || (typeof window !== "undefined" ? window.location.search : ""),
  );
  const next: UtmParams = { ...readUtm() };
  const keys: (keyof UtmParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ];
  let changed = false;
  for (const key of keys) {
    const v = params.get(key)?.trim();
    if (v) {
      next[key] = v;
      changed = true;
    }
  }
  if (changed) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/** Apply stored UTM/campaign to GA4 for Ads ↔ GA4 cross-check. */
export function applyUtmToGa4(utm: UtmParams = readUtm()) {
  if (typeof window.gtag !== "function") return;
  if (!utm.utm_source && !utm.utm_medium && !utm.utm_campaign && !utm.gclid) {
    return;
  }
  window.gtag("set", {
    campaign: {
      source: utm.utm_source || undefined,
      medium: utm.utm_medium || undefined,
      name: utm.utm_campaign || undefined,
      content: utm.utm_content || undefined,
      term: utm.utm_term || undefined,
    },
  });
  if (utm.gclid) {
    window.gtag("set", { gclid: utm.gclid });
  }
}

export function newClientEventId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

function fbcFromFbclid(fbclid?: string): string | undefined {
  if (!fbclid) return undefined;
  return `fb.1.${Date.now()}.${fbclid}`;
}

type CommercePayload = {
  eventId: string;
  value: number;
  currency?: string;
  /** Catalog retailer IDs only (product slugs). Omit for custom-only carts. */
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  orderId?: string;
  email?: string;
  phone?: string;
  /** Override page URL sent to CAPI (defaults to window.location.href). */
  eventSourceUrl?: string;
};

async function sendCapiBrowser(
  eventName: "AddToCart" | "InitiateCheckout" | "Purchase" | "ViewContent",
  payload: CommercePayload,
) {
  const utm = readUtm();
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc") || fbcFromFbclid(utm.fbclid);
  const eventSourceUrl =
    payload.eventSourceUrl ||
    (typeof window !== "undefined"
      ? window.location.href.split("#")[0]
      : undefined);
  try {
    await fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName,
        eventId: payload.eventId,
        eventSourceUrl,
        value: payload.value,
        currency: payload.currency ?? "EUR",
        contentIds: payload.contentIds?.length ? payload.contentIds : undefined,
        contentName: payload.contentName,
        numItems: payload.numItems,
        contents: payload.contents?.length ? payload.contents : undefined,
        orderId: payload.orderId,
        email: payload.email,
        phone: payload.phone,
        fbp,
        fbc,
        utm,
        consent: true,
      }),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

/** Public alias for ViewContent / other call sites. */
export const sendCapiBrowserPublic = sendCapiBrowser;

function ga4CampaignParams() {
  const utm = readUtm();
  return {
    campaign_id: utm.utm_campaign,
    campaign: utm.utm_campaign,
    source: utm.utm_source,
    medium: utm.utm_medium,
    term: utm.utm_term,
    content: utm.utm_content,
    ...(utm.gclid ? { gclid: utm.gclid } : {}),
  };
}

export async function trackAddToCart(input: {
  /** Product slug (= Facebook catalog id). Omit for custom uploads. */
  contentId?: string;
  contentName: string;
  value: number;
  currency?: string;
  quantity?: number;
  gaId?: string | null;
}) {
  if (!hasMarketingConsent()) return;
  const eventId = newClientEventId("atc");
  const currency = input.currency ?? "EUR";
  const qty = input.quantity ?? 1;
  const contentId = input.contentId?.trim() || undefined;
  const contentIds = contentId ? [contentId] : undefined;

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "AddToCart",
      {
        ...(contentIds ? { content_ids: contentIds } : {}),
        content_name: input.contentName,
        content_type: "product",
        value: input.value,
        currency,
        ...(contentId
          ? { contents: [{ id: contentId, quantity: qty }] }
          : {}),
        num_items: qty,
      },
      { eventID: eventId },
    );
  }

  if (input.gaId && typeof window.gtag === "function") {
    applyUtmToGa4();
    window.gtag("event", "add_to_cart", {
      currency,
      value: input.value,
      items: [
        {
          item_id: contentId || "custom",
          item_name: input.contentName,
          quantity: qty,
          price: input.value / qty,
        },
      ],
      ...ga4CampaignParams(),
      send_to: input.gaId,
    });
  }

  await sendCapiBrowser("AddToCart", {
    eventId,
    value: input.value,
    currency,
    contentIds,
    contentName: input.contentName,
    numItems: qty,
    contents: contentId
      ? [{ id: contentId, quantity: qty, item_price: input.value / qty }]
      : undefined,
  });
}

export async function trackInitiateCheckout(input: {
  value: number;
  currency?: string;
  contentIds: string[];
  numItems: number;
  gaId?: string | null;
}) {
  if (!hasMarketingConsent()) return;
  const eventId = newClientEventId("ic");
  const currency = input.currency ?? "EUR";
  const contentIds = input.contentIds.filter(Boolean);

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "InitiateCheckout",
      {
        ...(contentIds.length ? { content_ids: contentIds } : {}),
        content_type: "product",
        value: input.value,
        currency,
        num_items: input.numItems,
      },
      { eventID: eventId },
    );
  }

  if (input.gaId && typeof window.gtag === "function") {
    applyUtmToGa4();
    window.gtag("event", "begin_checkout", {
      currency,
      value: input.value,
      items: contentIds.map((id) => ({ item_id: id })),
      ...ga4CampaignParams(),
      send_to: input.gaId,
    });
  }

  await sendCapiBrowser("InitiateCheckout", {
    eventId,
    value: input.value,
    currency,
    contentIds: contentIds.length ? contentIds : undefined,
    numItems: input.numItems,
  });
}

export async function trackPurchaseBrowser(input: {
  orderId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
  email?: string;
  phone?: string;
  gaId?: string | null;
  adsSendTo?: string | null;
}) {
  if (!hasMarketingConsent()) return;
  const eventId = `purchase_${input.orderId}`;
  const currency = input.currency ?? "EUR";
  // Never fall back to orderId — that tanks Meta catalog match rate
  const contentIds = (input.contentIds ?? []).filter(Boolean);

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        value: input.value,
        currency,
        ...(contentIds.length ? { content_ids: contentIds } : {}),
        content_type: "product",
        num_items: contentIds.length || 1,
      },
      { eventID: eventId },
    );
  }

  if (input.gaId && typeof window.gtag === "function") {
    applyUtmToGa4();
    window.gtag("event", "purchase", {
      transaction_id: input.orderId,
      value: input.value,
      currency,
      ...ga4CampaignParams(),
      send_to: input.gaId,
    });
  }

  if (input.adsSendTo && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: input.adsSendTo,
      value: input.value,
      currency,
      transaction_id: input.orderId,
    });
  }

  await sendCapiBrowser("Purchase", {
    eventId,
    value: input.value,
    currency,
    contentIds: contentIds.length ? contentIds : undefined,
    orderId: input.orderId,
    email: input.email,
    phone: input.phone,
  });
}
