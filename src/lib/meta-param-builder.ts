import { ParamBuilder, type CookieSettings } from "capi-param-builder-nodejs";

const ETLD_DOMAINS = ["studiobreza.eu", "localhost"];

function cookieMap(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName) continue;
    try {
      out[rawName] = decodeURIComponent(rest.join("=") || "");
    } catch {
      out[rawName] = rest.join("=") || "";
    }
  }
  return out;
}

export type MetaClickIds = {
  fbc?: string;
  fbp?: string;
  cookiesToSet: CookieSettings[];
};

/**
 * Official Meta parameter builder (server) — recovers fbc from cookies,
 * query, referer, and in-app click IDs. Required for CAPI fbc coverage.
 */
export function metaClickIdsFromRequest(
  request: Request,
  extra?: { fbclid?: string | null; fbc?: string | null; fbp?: string | null },
): MetaClickIds {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    url.host;
  const queries: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queries[key] = value;
  });
  if (extra?.fbclid?.trim() && !queries.fbclid) {
    queries.fbclid = extra.fbclid.trim();
  }

  const cookies = cookieMap(request.headers.get("cookie"));
  if (extra?.fbc?.trim() && !cookies._fbc) cookies._fbc = extra.fbc.trim();
  if (extra?.fbp?.trim() && !cookies._fbp) cookies._fbp = extra.fbp.trim();

  const builder = new ParamBuilder(ETLD_DOMAINS);
  const cookiesToSet = builder.processRequest(
    host,
    queries,
    cookies,
    request.headers.get("referer"),
    request.headers.get("x-forwarded-for"),
    null,
  );

  return {
    fbc: builder.getFbc() || extra?.fbc?.trim() || undefined,
    fbp: builder.getFbp() || extra?.fbp?.trim() || undefined,
    cookiesToSet: cookiesToSet ?? [],
  };
}

export function applyMetaClickCookies(
  response: { cookies: { set: (name: string, value: string, opts: object) => void } },
  cookiesToSet: CookieSettings[],
) {
  for (const cookie of cookiesToSet) {
    if (!cookie?.name || !cookie?.value) continue;
    response.cookies.set(cookie.name, cookie.value, {
      maxAge: cookie.maxAge || 90 * 24 * 3600,
      path: "/",
      sameSite: "lax" as const,
      ...(cookie.domain && cookie.domain !== "localhost"
        ? { domain: cookie.domain.replace(/^\./, "") }
        : {}),
    });
  }
}
