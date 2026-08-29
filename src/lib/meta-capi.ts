import { createHash, randomUUID } from "crypto";
import { roundMoney } from "@/lib/currency";
import {
  getMarketingSettings,
  type MarketingSettings,
} from "@/lib/shop-settings";

export type MetaCapiEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type MetaCapiUserData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null;
  externalId?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type MetaCapiCustomData = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  order_id?: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hashNormalized(value: string): string {
  return sha256(value);
}

function lettersOnly(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^\p{L}]/gu, "");
}

function alnumOnly(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function splitPersonName(full: string | null | undefined): {
  first?: string;
  last?: string;
} {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

/** Normalize + hash PII for Meta Advanced Matching. */
export function hashMetaPii(
  kind: "email" | "phone" | "name" | "city" | "zip" | "country" | "external_id",
  raw: string | null | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  if (kind === "email") {
    return hashNormalized(raw.trim().toLowerCase());
  }
  if (kind === "phone") {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return undefined;
    let phone = digits;
    if (phone.startsWith("00")) phone = phone.slice(2);
    if (phone.startsWith("0") && phone.length === 10) {
      phone = `359${phone.slice(1)}`;
    }
    return hashNormalized(phone);
  }
  if (kind === "name") {
    const n = lettersOnly(raw);
    return n ? hashNormalized(n) : undefined;
  }
  if (kind === "city") {
    const n = alnumOnly(raw);
    return n ? hashNormalized(n) : undefined;
  }
  if (kind === "zip") {
    const n = raw.replace(/\D/g, "");
    return n ? hashNormalized(n) : undefined;
  }
  if (kind === "country") {
    return hashNormalized(raw.trim().toLowerCase());
  }
  return hashNormalized(raw.trim());
}

export function newMetaEventId(prefix = "evt"): string {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function purchaseEventId(orderId: string): string {
  return `purchase_${orderId}`;
}

function resolveCapiCredentials(m = getMarketingSettings()): {
  pixelId: string;
  accessToken: string;
  testEventCode: string;
} | null {
  const pixelId = m.metaPixelId.trim();
  const accessToken =
    m.metaCapiAccessToken.trim() ||
    process.env.META_CAPI_ACCESS_TOKEN?.trim() ||
    "";
  if (!pixelId || !accessToken) return null;
  return {
    pixelId,
    accessToken,
    testEventCode:
      m.metaCapiTestEventCode.trim() ||
      process.env.META_CAPI_TEST_EVENT_CODE?.trim() ||
      "",
  };
}

export function isMetaCapiConfigured(m?: MarketingSettings): boolean {
  return Boolean(resolveCapiCredentials(m));
}

const META_GRAPH_VERSION = "v25.0";

export type MetaDatasetQualityMatchKey = {
  identifier: string;
  coveragePercentage?: number;
  potentialAcrIncreasePercentage?: number;
  potentialAcrIncreaseDescription?: string;
};

export type MetaDatasetQualityEvent = {
  eventName: string;
  compositeScore?: number;
  matchKeys: MetaDatasetQualityMatchKey[];
  eventCoveragePercentage?: number;
  eventCoverageGoalPercentage?: number;
  dataFreshness?: string;
};

export type MetaDatasetQualityResult = {
  ok: boolean;
  skipped?: boolean;
  status?: number;
  error?: string;
  pixelId?: string;
  events: MetaDatasetQualityEvent[];
};

/**
 * Dataset Quality API (EMQ, coverage, freshness) for Events Manager tokens
 * that include Dataset Quality permission.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api
 */
export async function fetchMetaDatasetQuality(
  m?: MarketingSettings,
): Promise<MetaDatasetQualityResult> {
  const creds = resolveCapiCredentials(m);
  if (!creds) return { ok: true, skipped: true, events: [] };

  const fields = [
    "web{",
    "event_name,",
    "event_match_quality{",
    "composite_score,",
    "match_key_feedback{",
    "identifier,",
    "coverage{percentage},",
    "potential_aly_acr_increase{percentage,description}",
    "}",
    "},",
    "event_coverage{percentage,goal_percentage,description},",
    "data_freshness{upload_frequency,description}",
    "}",
  ].join("");

  const url = new URL(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/dataset_quality`,
  );
  url.searchParams.set("dataset_id", creds.pixelId);
  url.searchParams.set("access_token", creds.accessToken);
  url.searchParams.set("fields", fields);

  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      console.error("[meta-dq]", res.status, text.slice(0, 400));
      return {
        ok: false,
        status: res.status,
        error: text.slice(0, 300),
        pixelId: creds.pixelId,
        events: [],
      };
    }

    let json: {
      web?: Array<{
        event_name?: string;
        event_match_quality?: {
          composite_score?: number;
          match_key_feedback?: Array<{
            identifier?: string;
            coverage?: { percentage?: number };
            potential_aly_acr_increase?: {
              percentage?: number;
              description?: string;
            };
          }>;
        };
        event_coverage?: {
          percentage?: number;
          goal_percentage?: number;
          description?: string;
        };
        data_freshness?: {
          upload_frequency?: string;
          description?: string;
        };
      }>;
    };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      return {
        ok: false,
        status: res.status,
        error: "Invalid JSON from Dataset Quality API",
        pixelId: creds.pixelId,
        events: [],
      };
    }

    const events: MetaDatasetQualityEvent[] = (json.web ?? []).map((row) => {
      const emq = row.event_match_quality;
      return {
        eventName: row.event_name ?? "Unknown",
        compositeScore:
          typeof emq?.composite_score === "number"
            ? emq.composite_score
            : undefined,
        matchKeys: (emq?.match_key_feedback ?? []).map((mk) => ({
          identifier: mk.identifier ?? "unknown",
          coveragePercentage: mk.coverage?.percentage,
          potentialAcrIncreasePercentage:
            mk.potential_aly_acr_increase?.percentage,
          potentialAcrIncreaseDescription:
            mk.potential_aly_acr_increase?.description,
        })),
        eventCoveragePercentage: row.event_coverage?.percentage,
        eventCoverageGoalPercentage: row.event_coverage?.goal_percentage,
        dataFreshness: row.data_freshness?.upload_frequency,
      };
    });

    return {
      ok: true,
      status: res.status,
      pixelId: creds.pixelId,
      events,
    };
  } catch (err) {
    console.error("[meta-dq] network", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
      events: [],
    };
  }
}

/**
 * Send event to Meta Conversions API (server-side).
 * Use the same event_id as browser Pixel for deduplication (iOS 14+).
 */
export async function sendMetaCapiEvent(input: {
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string;
  user?: MetaCapiUserData;
  customData?: MetaCapiCustomData;
  /** unix seconds */
  eventTime?: number;
}): Promise<{ ok: boolean; skipped?: boolean; status?: number; error?: string }> {
  const creds = resolveCapiCredentials();
  if (!creds) return { ok: true, skipped: true };

  const user_data: Record<string, string> = {};
  const names = splitPersonName(
    [input.user?.firstName, input.user?.lastName].filter(Boolean).join(" ") ||
      undefined,
  );
  const first = input.user?.firstName || names.first;
  const last = input.user?.lastName || names.last;
  const em = hashMetaPii("email", input.user?.email);
  const ph = hashMetaPii("phone", input.user?.phone);
  const fn = hashMetaPii("name", first);
  const ln = hashMetaPii("name", last);
  const ct = hashMetaPii("city", input.user?.city);
  const zp = hashMetaPii("zip", input.user?.zip);
  const country = hashMetaPii("country", input.user?.country || "bg");
  const externalId = hashMetaPii(
    "external_id",
    input.user?.externalId || input.user?.email || undefined,
  );
  if (em) user_data.em = em;
  if (ph) user_data.ph = ph;
  if (fn) user_data.fn = fn;
  if (ln) user_data.ln = ln;
  if (ct) user_data.ct = ct;
  if (zp) user_data.zp = zp;
  if (country) user_data.country = country;
  if (externalId) user_data.external_id = externalId;
  if (input.user?.clientIp) user_data.client_ip_address = input.user.clientIp;
  if (input.user?.userAgent) user_data.client_user_agent = input.user.userAgent;
  if (input.user?.fbp) user_data.fbp = input.user.fbp;
  if (input.user?.fbc) user_data.fbc = input.user.fbc;

  const custom_data: Record<string, unknown> = {};
  const cd = input.customData;
  if (cd) {
    if (cd.value != null) {
      const amount = Number(cd.value);
      if (Number.isFinite(amount) && amount >= 0) {
        custom_data.value = roundMoney(amount);
      }
    }
    if (cd.contents?.length) {
      custom_data.contents = cd.contents.map((row) => ({
        id: row.id,
        quantity: row.quantity,
        ...(row.item_price != null && Number.isFinite(Number(row.item_price))
          ? { item_price: roundMoney(Number(row.item_price)) }
          : {}),
      }));
    }
    if (cd.currency) custom_data.currency = cd.currency;
    if (cd.content_ids?.length) custom_data.content_ids = cd.content_ids;
    if (cd.content_type) custom_data.content_type = cd.content_type;
    if (cd.content_name) custom_data.content_name = cd.content_name;
    if (cd.num_items != null) custom_data.num_items = cd.num_items;
    if (cd.order_id) custom_data.order_id = cd.order_id;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data,
        custom_data,
      },
    ],
  };
  if (creds.testEventCode) {
    payload.test_event_code = creds.testEventCode;
  }

  try {
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${creds.pixelId}/events?access_token=${encodeURIComponent(creds.accessToken)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[meta-capi]", res.status, text.slice(0, 400));
      return { ok: false, status: res.status, error: text.slice(0, 200) };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    console.error("[meta-capi] network", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "network error",
    };
  }
}

export function clientIpFromRequest(request: Request): string | null {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

export function parseCookie(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}
