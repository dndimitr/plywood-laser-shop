import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { OCCASIONS, occasionPath } from "@/lib/occasions";
import { CATEGORIES } from "@/lib/shop-config";
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
      url: absoluteUrl("/custom"),
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

  const occasionCategoryIds = new Set(OCCASIONS.map((o) => o.categoryId));
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => c.id !== "other" && !occasionCategoryIds.has(c.id),
  ).map((c) => ({
    url: absoluteUrl(`/?cat=${c.id}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

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
    ...productEntries,
  ];
}
