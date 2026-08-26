import { prisma } from "@/lib/db";
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
import { absoluteUrl } from "@/lib/seo";

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

function formatLastmod(d: Date): string {
  // Google prefers W3C date; date-only is widely accepted and stable
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

async function productEntries(now: Date): Promise<SitemapEntry[]> {
  try {
    const products = await Promise.race([
      prisma.product.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
    if (!products) return [];
    return products.map((p) => ({
      loc: absoluteUrl(`/products/${p.slug}`),
      lastmod: formatLastmod(p.updatedAt ? new Date(p.updatedAt) : now),
      changefreq: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    return [];
  }
}

/** Build sitemap entries for Google (studiobreza.eu absolute URLs). */
export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const now = new Date();
  const lastmod = formatLastmod(now);

  const staticEntries: SitemapEntry[] = [
    { loc: absoluteUrl("/"), lastmod, changefreq: "daily", priority: 1 },
    {
      loc: absoluteUrl("/katalog"),
      lastmod,
      changefreq: "daily",
      priority: 0.95,
    },
    {
      loc: absoluteUrl("/custom"),
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: absoluteUrl(blogIndexPath()),
      lastmod,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: absoluteUrl("/legal/terms"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: absoluteUrl("/legal/privacy"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: absoluteUrl("/legal/returns"),
      lastmod,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  const occasionEntries: SitemapEntry[] = OCCASIONS.map((o) => ({
    loc: absoluteUrl(occasionPath(o.slug)),
    lastmod,
    changefreq: "weekly",
    priority: 0.9,
  }));

  const categoryEntries: SitemapEntry[] = allCategoryLandingSlugs().map(
    (slug) => ({
      loc: absoluteUrl(categoryLandingPath(slug)),
      lastmod,
      changefreq: "weekly",
      priority: 0.8,
    }),
  );

  const guideEntries: SitemapEntry[] = giftGuidesNewestFirst().map((g) => ({
    loc: absoluteUrl(giftGuidePath(g.slug)),
    lastmod: formatLastmod(new Date(g.publishedAt)),
    changefreq: "monthly",
    priority: 0.8,
  }));

  const products = await productEntries(now);

  // Deduplicate by loc
  const seen = new Set<string>();
  const all = [
    ...staticEntries,
    ...occasionEntries,
    ...categoryEntries,
    ...guideEntries,
    ...products,
  ];
  return all.filter((e) => {
    if (!e.loc || seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });
}

export function entriesToSitemapXml(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [
        "  <url>",
        `    <loc>${xmlEscape(e.loc)}</loc>`,
        e.lastmod ? `    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : "",
        e.changefreq
          ? `    <changefreq>${xmlEscape(e.changefreq)}</changefreq>`
          : "",
        e.priority != null
          ? `    <priority>${e.priority.toFixed(1)}</priority>`
          : "",
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
