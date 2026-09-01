import { unstable_cache } from "next/cache";
import { FEATURED_KIT_SLUGS } from "@/data/catalog-kits";
import { catalogProductWhere } from "@/lib/catalog-where";
import { prisma } from "@/lib/db";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  basePrice: true,
  imageUrl: true,
} as const;

async function loadHomeCatalog() {
  const [
    featuredPool,
    nurseryProducts,
    weddingProducts,
    kitPool,
    reviews,
    catalogMeta,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { ...catalogProductWhere },
      select: productSelect,
      orderBy: { updatedAt: "desc" },
      take: 48,
    }),
    prisma.product.findMany({
      where: { ...catalogProductWhere, category: "nursery" },
      select: productSelect,
      orderBy: { name: "asc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { ...catalogProductWhere, category: "wedding" },
      select: productSelect,
      orderBy: { name: "asc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: {
        ...catalogProductWhere,
        slug: { in: [...FEATURED_KIT_SLUGS] },
      },
      select: productSelect,
    }),
    prisma.review.findMany({
      where: { published: true },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.findMany({
      where: { ...catalogProductWhere },
      select: { category: true, imageUrl: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return {
    featuredPool,
    nurseryProducts,
    weddingProducts,
    kitPool,
    reviews,
    catalogMeta,
  };
}

/** ISR + Data Cache: homepage HTML is no longer a Neon round-trip on every mobile hit. */
export const getHomeCatalog = unstable_cache(loadHomeCatalog, ["home-catalog"], {
  revalidate: 120,
});
