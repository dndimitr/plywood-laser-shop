/** Browser tracking helpers — Meta Pixel + GA4 + UTM (client-only). */

import { CONSENT_STORAGE_KEY, type ConsentChoice } from "@/lib/seo-client";
import { roundMoney } from "@/lib/currency";

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
  persistFbcCookie(next.fbclid);
  return next;
}

function persistFbcCookie(fbclid?: string) {
  if (typeof document === "undefined" || !fbclid) return;
  if (readCookie("_fbc")) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `_fbc=${encodeURIComponent(`fb.1.${Date.now()}.${fbclid}`)}; path=/; max-age=${90 * 24 * 3600}; SameSite=Lax${secure}`;
}

/** Meta parameter builder — recovers fbc from URL, referrer, and in-app browsers. */
export async function collectMetaClickIds(): Promise<{
  fbc?: string;
  fbp?: string;
}> {
  if (typeof window === "undefined") return {};
  captureUtmFromLocation();
  const utm = readUtm();
  const url =
    utm.fbclid && !window.location.search.includes("fbclid")
      ? `${window.location.origin}${window.location.pathname}?fbclid=${encodeURIComponent(utm.fbclid)}`
      : window.location.href;
  try {
    const builder = await import("meta-capi-param-builder-clientjs");
    await builder.processAndCollectAllParams(url);
    const fbc = builder.getFbc() || undefined;
    const fbp = builder.getFbp() || undefined;
    if (!fbc) persistFbcCookie(utm.fbclid);
    return {
      fbc: fbc || readCookie("_fbc") || fbcFromFbclid(utm.fbclid),
      fbp: fbp || readCookie("_fbp"),
    };
  } catch {
    persistFbcCookie(utm.fbclid);
    return metaClickIds();
  }
}

export const META_CONSENT_EVENT = "sb-marketing-consent";
const META_EID_KEY = "sb_meta_eid_v1";
const META_AM_KEY = "sb_meta_am_v1";

export type MetaAdvancedMatching = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
};

export function getMetaExternalId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = localStorage.getItem(META_EID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `eid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(META_EID_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function rememberMetaAdvancedMatching(data: MetaAdvancedMatching) {
  if (!hasMarketingConsent()) return;
  try {
    const prev = readMetaAdvancedMatching();
    localStorage.setItem(
      META_AM_KEY,
      JSON.stringify({ ...prev, ...data }),
    );
  } catch {
    /* ignore */
  }
  applyMetaAdvancedMatching();
}

function readMetaAdvancedMatching(): MetaAdvancedMatching {
  try {
    const raw = localStorage.getItem(META_AM_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MetaAdvancedMatching;
  } catch {
    return {};
  }
}

function applyMetaAdvancedMatching() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  if (!pixelId || typeof window.fbq !== "function") return;
  const am = readMetaAdvancedMatching();
  const payload: Record<string, string> = {
    country: "bg",
  };
  const eid = getMetaExternalId();
  if (eid) payload.external_id = eid;
  if (am.email) payload.em = am.email.trim().toLowerCase();
  if (am.phone) payload.ph = am.phone;
  if (am.firstName) payload.fn = am.firstName;
  if (am.lastName) payload.ln = am.lastName;
  if (am.city) payload.ct = am.city;
  if (am.zip) payload.zp = am.zip;
  window.fbq("init", pixelId, payload);
}

function metaClickIds() {
  const utm = readUtm();
  persistFbcCookie(utm.fbclid);
  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc") || fbcFromFbclid(utm.fbclid),
  };
}

function matchingPayload() {
  const am = readMetaAdvancedMatching();
  const clicks = metaClickIds();
  return {
    email: am.email,
    phone: am.phone,
    firstName: am.firstName,
    lastName: am.lastName,
    city: am.city,
    zip: am.zip,
    country: "bg",
    externalId: getMetaExternalId(),
    fbclid: readUtm().fbclid,
    ...clicks,
  };
}

export function getMetaClickIdsForCheckout() {
  const utm = readUtm();
  persistFbcCookie(utm.fbclid);
  return {
    fbc: readCookie("_fbc") || fbcFromFbclid(utm.fbclid) || "",
    fbp: readCookie("_fbp") || "",
    fbclid: utm.fbclid || "",
  };
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
  value?: number;
  currency?: string;
  /** Catalog retailer IDs only (product slugs). Omit for custom-only carts. */
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  orderId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  /** Override page URL sent to CAPI (defaults to window.location.href). */
  eventSourceUrl?: string;
};

async function sendCapiBrowser(
  eventName:
    | "AddToCart"
    | "InitiateCheckout"
    | "Purchase"
    | "ViewContent"
    | "PageView",
  payload: CommercePayload,
) {
  const match = matchingPayload();
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
        currency: payload.currency ?? (payload.value != null ? "EUR" : undefined),
        contentIds: payload.contentIds?.length ? payload.contentIds : undefined,
        contentName: payload.contentName,
        numItems: payload.numItems,
        contents: payload.contents?.length ? payload.contents : undefined,
        orderId: payload.orderId,
        email: payload.email || match.email,
        phone: payload.phone || match.phone,
        firstName: payload.firstName || match.firstName,
        lastName: payload.lastName || match.lastName,
        city: payload.city || match.city,
        zip: payload.zip || match.zip,
        country: match.country,
        externalId: match.externalId,
        fbp: match.fbp,
        fbc: match.fbc,
        fbclid: match.fbclid,
        utm: readUtm(),
        consent: true,
      }),
      keepalive: true,
    });
  } catch {
    /* non-blocking */
  }
}

export async function trackPageView() {
  if (!hasMarketingConsent()) return;
  await collectMetaClickIds();
  applyMetaAdvancedMatching();
  const eventId = newClientEventId("pv");
  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView", {}, { eventID: eventId });
  }
  await new Promise((r) => window.setTimeout(r, 400));
  await collectMetaClickIds();
  await sendCapiBrowser("PageView", {
    eventId,
    eventSourceUrl: window.location.href.split("#")[0],
  });
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
  applyMetaAdvancedMatching();
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
  applyMetaAdvancedMatching();
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
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  gaId?: string | null;
  adsSendTo?: string | null;
}) {
  if (!hasMarketingConsent()) return;
  await collectMetaClickIds();
  applyMetaAdvancedMatching();
  const eventId = `purchase_${input.orderId}`;
  const currency = input.currency ?? "EUR";
  const value = roundMoney(Number(input.value));
  const contentIds = (input.contentIds ?? []).filter(Boolean);
  const contents = (input.contents ?? []).filter((c) => c.id);
  const numItems =
    contents.reduce((s, c) => s + c.quantity, 0) || contentIds.length || 1;

  if (typeof window.fbq === "function") {
    window.fbq(
      "track",
      "Purchase",
      {
        value,
        currency,
        ...(contentIds.length ? { content_ids: contentIds } : {}),
        ...(contents.length ? { contents } : {}),
        content_type: "product",
        num_items: numItems,
        order_id: input.orderId,
      },
      { eventID: eventId },
    );
  }

  if (input.gaId && typeof window.gtag === "function") {
    applyUtmToGa4();
    window.gtag("event", "purchase", {
      transaction_id: input.orderId,
      value,
      currency,
      ...ga4CampaignParams(),
      send_to: input.gaId,
    });
  }

  if (input.adsSendTo && typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: input.adsSendTo,
      value,
      currency,
      transaction_id: input.orderId,
    });
  }

  if (input.email || input.phone || input.firstName) {
    rememberMetaAdvancedMatching({
      email: input.email,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      city: input.city,
      zip: input.zip,
    });
  }

  await sendCapiBrowser("Purchase", {
    eventId,
    value,
    currency,
    contentIds: contentIds.length ? contentIds : undefined,
    contents: contents.length ? contents : undefined,
    numItems,
    orderId: input.orderId,
    email: input.email,
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
    city: input.city,
    zip: input.zip,
  });
}
