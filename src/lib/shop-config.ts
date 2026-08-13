/** Shop business config — env-overridable where noted */

export type CategoryId =
  | "wedding"
  | "birthday"
  | "newborn"
  | "christmas"
  | "gifts"
  | "decor"
  | "panels"
  | "ornaments"
  | "kitchen"
  | "nursery"
  | "signs"
  | "venues"
  | "corporate"
  | "keychains"
  | "jewelry"
  | "pets"
  | "other";

export type CategoryDef = {
  id: CategoryId;
  label: string;
  labelEn: string;
};

/**
 * Display order for catalog sections and lists.
 * Grouped: occasions → home → business → accessories → other.
 */
export const CATEGORIES: readonly CategoryDef[] = [
  // Поводи и подаръци
  { id: "wedding", label: "Сватба", labelEn: "Wedding" },
  { id: "birthday", label: "Рождени дни", labelEn: "Birthdays" },
  { id: "newborn", label: "Новородени", labelEn: "Newborn" },
  { id: "christmas", label: "Коледа", labelEn: "Christmas" },
  { id: "gifts", label: "Подаръци", labelEn: "Gifts" },
  // Дом и интериор
  { id: "decor", label: "Декор", labelEn: "Decor" },
  { id: "panels", label: "Стенни панели", labelEn: "Wall panels" },
  { id: "ornaments", label: "Орнаменти", labelEn: "Ornaments" },
  { id: "kitchen", label: "Кухня", labelEn: "Kitchen" },
  { id: "nursery", label: "Детска", labelEn: "Nursery" },
  // Бизнес
  { id: "signs", label: "Табели", labelEn: "Signs" },
  { id: "venues", label: "Заведения", labelEn: "Venues" },
  { id: "corporate", label: "Корпоративни", labelEn: "Corporate" },
  // Аксесоари
  { id: "keychains", label: "Ключодържатели", labelEn: "Keychains" },
  { id: "jewelry", label: "Бижута", labelEn: "Jewelry" },
  { id: "pets", label: "Домашни любимци", labelEn: "Pets" },
  // Fallback
  { id: "other", label: "Други", labelEn: "Other" },
] as const;

export type CategoryGroup = {
  id: string;
  label: string;
  labelEn: string;
  categoryIds: CategoryId[];
};

/** Logical groups for menus, drawer, and catalog filters */
export const CATEGORY_GROUPS: readonly CategoryGroup[] = [
  {
    id: "occasions",
    label: "Поводи и подаръци",
    labelEn: "Occasions & gifts",
    categoryIds: ["wedding", "birthday", "newborn", "christmas", "gifts"],
  },
  {
    id: "home",
    label: "Дом и интериор",
    labelEn: "Home & interior",
    categoryIds: ["decor", "panels", "ornaments", "kitchen", "nursery"],
  },
  {
    id: "business",
    label: "Бизнес и табели",
    labelEn: "Business & signs",
    categoryIds: ["signs", "venues", "corporate"],
  },
  {
    id: "accessories",
    label: "Аксесоари",
    labelEn: "Accessories",
    categoryIds: ["keychains", "jewelry", "pets"],
  },
] as const;

/** Compact top bar — most browsed / clear entry points */
export const FEATURED_CATEGORY_IDS: readonly CategoryId[] = [
  "gifts",
  "wedding",
  "birthday",
  "newborn",
  "christmas",
  "decor",
  "panels",
  "signs",
  "keychains",
  "venues",
] as const;

export function categoryById(id: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function featuredCategories(): CategoryDef[] {
  return FEATURED_CATEGORY_IDS.map(
    (id) => CATEGORIES.find((c) => c.id === id)!,
  ).filter(Boolean);
}

export function navCategoryGroups(): {
  group: CategoryGroup;
  categories: CategoryDef[];
}[] {
  return CATEGORY_GROUPS.map((group) => ({
    group,
    categories: group.categoryIds
      .map((id) => CATEGORIES.find((c) => c.id === id)!)
      .filter(Boolean),
  }));
}

export const MATERIALS = [
  { id: "birch-plywood", label: "Брезов шперплат", labelEn: "Birch plywood" },
  { id: "poplar-plywood", label: "Тополов шперплат", labelEn: "Poplar plywood" },
  { id: "oak-veneer", label: "Дъбов фурнир", labelEn: "Oak veneer" },
] as const;

export const FINISHES = [
  { id: "raw", label: "Без покритие", labelEn: "Raw" },
  { id: "oil", label: "Масло", labelEn: "Oil" },
  { id: "lacquer", label: "Лак", labelEn: "Lacquer" },
] as const;

export const COURIERS = [
  { id: "ECONT", label: "Еконт", fee: 6.9 },
  { id: "SPEEDY", label: "Speedy", fee: 7.5 },
  { id: "PICKUP", label: "Лично получаване", fee: 0 },
] as const;

export function getBankDetails() {
  return {
    beneficiary: process.env.BANK_BENEFICIARY ?? "ЛазерШперплат ЕООД",
    iban: process.env.BANK_IBAN ?? "BG00XXXX00000000000000",
    bic: process.env.BANK_BIC ?? "XXXXBGSF",
    bankName: process.env.BANK_NAME ?? "Примерна банка",
    reasonPrefix: process.env.BANK_REASON_PREFIX ?? "Поръчка",
  };
}

export function shippingFeeFor(courier: string) {
  const found = COURIERS.find((c) => c.id === courier);
  return found?.fee ?? 6.9;
}

/** Public contact phone for mobile bottom bar / tel: links */
export function getShopPhone() {
  return process.env.NEXT_PUBLIC_SHOP_PHONE ?? "0888123456";
}

export function getShopPhoneHref() {
  const digits = getShopPhone().replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

export type QtyDiscount = { minQty: number; percentOff: number };
