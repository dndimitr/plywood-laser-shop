import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
    sitemap: [
      `${CANONICAL_SITE_URL}/sitemap.xml`,
      `${CANONICAL_SITE_URL}/sitemap.txt`,
    ],
  };
}
