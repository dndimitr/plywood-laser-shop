/**
 * Meta Commerce catalog product IDs (= feed `id` / `g:id`) are product slugs.
 * Pixel + CAPI content_ids must use the same values or catalog match rate drops.
 *
 * Never send DB cuids, upload UUIDs, cart line ids, order ids, or titles.
 */

/** True for values that look like cuid / UUID — never valid catalog retailer IDs. */
export function looksLikeNonCatalogId(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v,
    )
  ) {
    return true;
  }
  // Prisma cuid (c + 24 alnum) — product.id / upload ids
  if (/^c[a-z0-9]{24}$/i.test(v)) return true;
  return false;
}

/** Keep only slug-shaped catalog retailer IDs (deduped, order preserved). */
export function toCatalogContentIds(
  candidates: Array<string | null | undefined>,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const id = typeof raw === "string" ? raw.trim() : "";
    if (!id) continue;
    if (looksLikeNonCatalogId(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

type SlugCarrier = {
  productId?: string | null;
  productSlug?: string | null;
  product?: { slug?: string | null } | null;
};

/** Extract catalog content_ids from cart / order line items (slugs only). */
export function catalogContentIdsFromItems(items: SlugCarrier[]): string[] {
  return toCatalogContentIds(
    items.map((item) => item.productSlug ?? item.product?.slug ?? null),
  );
}

/**
 * Resolve missing productSlug from productId (legacy cart cookies), then
 * return catalog content_ids. Does not mutate the cart cookie.
 */
export async function resolveCatalogContentIds(
  items: SlugCarrier[],
  findSlugByProductId: (id: string) => Promise<string | null>,
): Promise<string[]> {
  const resolved: Array<string | null> = [];
  for (const item of items) {
    const existing = item.productSlug ?? item.product?.slug ?? null;
    if (existing) {
      resolved.push(existing);
      continue;
    }
    const productId = item.productId?.trim();
    if (!productId) {
      resolved.push(null);
      continue;
    }
    resolved.push(await findSlugByProductId(productId));
  }
  return toCatalogContentIds(resolved);
}
