import { prisma } from "@/lib/db";
import { catalogProductWhere } from "@/lib/catalog-where";
import {
  allCategoryLandingSlugs,
  categoryLandingPath,
} from "@/lib/category-landings";
import {
  blogIndexPath,
  giftGuidePath,
  giftGuidesNewestFirst,
} from "@/lib/gift-guides";
import { OCCASIONS, occasionPath } from "@/lib/occasions";
import { CANONICAL_SITE_URL } from "@/lib/seo";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

/** Stay under Vercel Hobby's 10s function limit (cold Neon + query). */
const PRODUCT_QUERY_MS = 3_500;

function formatLastmod(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Always the live shop host — GSC rejects localhost / vercel.app locs. */
function locFor(path: string): string {
  const base = CANONICAL_SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return encodeURI(`${base}${suffix}`);
}

export function staticSitemapEntries(now = new Date()): SitemapEntry[] {
  const lastmod = formatLastmod(now);

  const staticEntries: SitemapEntry[] = [
    { loc: locFor("/"), lastmod, changefreq: "daily", priority: 1 },
    {
      loc: locFor("/katalog"),
      lastmod,
      changefreq: "daily",
      priority: 0.95,
    },
    {
      loc: locFor("/custom"),
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: locFor(blogIndexPath()),
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: locFor("/legal/terms"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: locFor("/legal/privacy"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: locFor("/legal/returns"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  const occasionEntries: SitemapEntry[] = OCCASIONS.map((o) => ({
    loc: locFor(occasionPath(o.slug)),
    lastmod,
    changefreq: "weekly" as const,
    priority: 0.9,
  }));

  const categoryEntries: SitemapEntry[] = allCategoryLandingSlugs().map(
    (slug) => ({
      loc: locFor(categoryLandingPath(slug)),
      lastmod,
      changefreq: "weekly" as const,
      priority: 0.8,
    }),
  );

  const guideEntries: SitemapEntry[] = giftGuidesNewestFirst().map((g) => ({
    loc: locFor(giftGuidePath(g.slug)),
    lastmod: formatLastmod(new Date(g.publishedAt)),
    changefreq: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticEntries,
    ...occasionEntries,
    ...categoryEntries,
    ...guideEntries,
  ];
}

async function productEntries(now: Date): Promise<SitemapEntry[]> {
  try {
    const products = await Promise.race([
      prisma.product.findMany({
        where: { ...catalogProductWhere },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), PRODUCT_QUERY_MS),
      ),
    ]);
    if (!products) {
      console.warn(
        `[sitemap] product query timed out after ${PRODUCT_QUERY_MS}ms`,
      );
      return [];
    }
    return products.map((p) => ({
      loc: locFor(`/products/${p.slug}`),
      lastmod: formatLastmod(p.updatedAt ? new Date(p.updatedAt) : now),
      changefreq: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] product query failed", err);
    return [];
  }
}

function dedupe(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (!e.loc || seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });
}

/** Build sitemap entries for Google (studiobreza.eu absolute URLs). */
export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  try {
    const products = await productEntries(now);
    return dedupe([...staticSitemapEntries(now), ...products]);
  } catch (err) {
    console.error("[sitemap] build failed, serving static URLs only", err);
    return dedupe(staticSitemapEntries(now));
  }
}

export function entriesToSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [
        "  <url>",
        `    <loc>${xmlEscape(e.loc)}</loc>`,
        e.lastmod ? `    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : "",
        "  </url>",
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

/** Google also accepts a plain-text sitemap (one URL per line). */
export function entriesToSitemapTxt(entries: SitemapEntry[]): string {
  return `${entries.map((e) => e.loc).join("\n")}\n`;
}
