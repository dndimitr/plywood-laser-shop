import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  // Hostname only (no scheme) — required if Host is set; Google ignores Host
  // but an invalid Host: https://… line can confuse other validators.
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/favorites",
          "/order/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    ...(host ? { host } : {}),
  };
}
