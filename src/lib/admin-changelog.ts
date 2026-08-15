/**
 * Admin-facing changelog of storefront releases (Bulgarian).
 * Newest entries first. Shown on /admin dashboard.
 */

export type AdminChangelogEntry = {
  /** ISO date YYYY-MM-DD */
  date: string;
  title: string;
  items: string[];
};

/** Mirrors catalog-products.ts — keep in sync for admin dashboard labels. */
export const ADMIN_CATALOG_PRICE_NOTES = {
  discountPercent: 35,
  lowPriceBumpPercent: 30,
  lowPriceMaxEur: 20,
} as const;

export const ADMIN_CHANGELOG: readonly AdminChangelogEntry[] = [
  {
    date: "2026-08-15",
    title: "Каталог, цени и Facebook споделяне",
    items: [
      "Нова категория „Персонализирани“ с 20 целогодишни продукта (табели, координати, звездна карта, QR песен, любимци и др.) — вижте /kategoriya/personalizirani",
      `Цените на продукти до ${ADMIN_CATALOG_PRICE_NOTES.lowPriceMaxEur} € са вдигнати с ${ADMIN_CATALOG_PRICE_NOTES.lowPriceBumpPercent}% (след −${ADMIN_CATALOG_PRICE_NOTES.discountPercent}% каталожна корекция); къстъм минимумите са подравнени`,
      "Бутонът „Сподели във Facebook“ на продукта вече подава линка към продукта (Web Share + „Копирай линка“)",
      "Поправен е изгледът на „Начин на плащане“ в чекаута на мобилен",
    ],
  },
] as const;

export function latestAdminChangelog(limit = 3): AdminChangelogEntry[] {
  return ADMIN_CHANGELOG.slice(0, limit);
}
