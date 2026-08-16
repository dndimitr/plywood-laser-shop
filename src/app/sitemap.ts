import type { MetadataRoute } from "next";
import {
  allCategoryLandingSlugs,
  categoryLandingPath,
} from "@/lib/category-landings";
import { prisma } from "@/lib/db";
import {
  blogIndexPath,
  giftGuidePath,
  giftGuidesNewestFirst,
} from "@/lib/gift-guides";
import { OCCASIONS, occasionPath } from "@/lib/occasions";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/katalog"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/custom"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl(blogIndexPath()),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/legal/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/legal/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/legal/returns"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const occasionEntries: MetadataRoute.Sitemap = OCCASIONS.map((o) => ({
    url: absoluteUrl(occasionPath(o.slug)),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryEntries: MetadataRoute.Sitemap = allCategoryLandingSlugs().map(
    (slug) => ({
      url: absoluteUrl(categoryLandingPath(slug)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const guideEntries: MetadataRoute.Sitemap = giftGuidesNewestFirst().map(
    (g) => ({
      url: absoluteUrl(giftGuidePath(g.slug)),
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    productEntries = products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    /* DB unavailable at build — static + categories still emitted */
  }

  return [
    ...staticEntries,
    ...occasionEntries,
    ...categoryEntries,
    ...guideEntries,
    ...productEntries,
  ];
}
