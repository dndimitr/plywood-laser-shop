/** Shop business config — env-overridable where noted */

export type CategoryId =
  | "wedding"
  | "birthday"
  | "newborn"
  | "baptism"
  | "anniversary"
  | "valentines"
  | "christmas"
  | "halloween"
  | "school"
  | "newyear"
  | "spring"
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
  | "auto"
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
  { id: "baptism", label: "Кръщене", labelEn: "Baptism" },
  { id: "anniversary", label: "Годишнини", labelEn: "Anniversaries" },
  { id: "valentines", label: "Свети Валентин", labelEn: "Valentine's" },
  { id: "christmas", label: "Коледа", labelEn: "Christmas" },
  { id: "halloween", label: "Хелоуин", labelEn: "Halloween" },
  { id: "school", label: "Училище", labelEn: "School" },
  { id: "newyear", label: "Нова година", labelEn: "New Year" },
  { id: "spring", label: "Баба Марта и 8 март", labelEn: "Spring occasions" },
  { id: "gifts", label: "Подаръци", labelEn: "Gifts" },
  // Дом и интериор
  { id: "decor", label: "Декор", labelEn: "Decor" },
  { id: "panels", label: "Стенни панели", labelEn: "Wall panels" },
  { id: "ornaments", label: "Орнаменти", labelEn: "Ornaments" },
  { id: "kitchen", label: "Кухня", labelEn: "Kitchen" },
  { id: "nursery", label: "Детска", labelEn: "Kids & Montessori" },
  // Бизнес
  { id: "signs", label: "Табели", labelEn: "Signs" },
  { id: "venues", label: "Заведения", labelEn: "Venues" },
  { id: "corporate", label: "Корпоративни", labelEn: "Corporate" },
  // Аксесоари
  { id: "keychains", label: "Ключодържатели", labelEn: "Keychains" },
  { id: "jewelry", label: "Бижута", labelEn: "Jewelry" },
  { id: "pets", label: "Домашни любимци", labelEn: "Pets" },
  { id: "auto", label: "Авто маниаци", labelEn: "Car enthusiasts" },
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
    categoryIds: [
      "wedding",
      "birthday",
      "newborn",
      "baptism",
      "nursery",
      "anniversary",
      "valentines",
      "christmas",
      "halloween",
      "school",
      "newyear",
      "spring",
      "gifts",
    ],
  },
  {
    id: "home",
    label: "Дом и интериор",
    labelEn: "Home & interior",
    categoryIds: ["decor", "panels", "ornaments", "kitchen"],
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
    categoryIds: ["keychains", "jewelry", "pets", "auto"],
  },
] as const;

/** Compact top bar — most browsed / clear entry points */
export const FEATURED_CATEGORY_IDS: readonly CategoryId[] = [
  "wedding",
  "birthday",
  "nursery",
  "newborn",
  "baptism",
  "anniversary",
  "valentines",
  "christmas",
  "school",
  "newyear",
  "spring",
  "gifts",
  "halloween",
  "decor",
  "keychains",
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

/** Default courier labels; live fees come from `shipping-settings` (EUR). */
export const COURIERS = [
  { id: "ECONT", label: "Еконт", fee: 3.53 },
  { id: "SPEEDY", label: "Speedy", fee: 3.83 },
  { id: "PICKUP", label: "Лично получаване", fee: 0 },
] as const;

/** Free courier shipping when order subtotal reaches this EUR amount */
export const FREE_SHIPPING_MIN_EUR = 50;

export function getBankDetails() {
  return {
    beneficiary: process.env.BANK_BENEFICIARY ?? "ЛазерШперплат ЕООД",
    iban: process.env.BANK_IBAN ?? "BG00XXXX00000000000000",
    bic: process.env.BANK_BIC ?? "XXXXBGSF",
    bankName: process.env.BANK_NAME ?? "Примерна банка",
    reasonPrefix: process.env.BANK_REASON_PREFIX ?? "Поръчка",
  };
}

/** Public shop address (footer / contact) */
export function getShopAddress() {
  return (
    process.env.NEXT_PUBLIC_SHOP_ADDRESS ??
    "гр. Варна, жк. Възраждане 4, № 76"
  );
}

/** Public contact phone for mobile bottom bar / tel: links */
export function getShopPhone() {
  return process.env.NEXT_PUBLIC_SHOP_PHONE ?? "+359 883 44 33 61";
}

export function getShopPhoneHref() {
  let digits = getShopPhone().replace(/[^\d+]/g, "");
  if (/^0\d+/.test(digits)) {
    digits = `+359${digits.slice(1)}`;
  } else if (/^359\d+/.test(digits)) {
    digits = `+${digits}`;
  }
  return `tel:${digits}`;
}

/** Production lead times shown in UI (business days after design confirmation) */
export const PRODUCTION_LEAD = {
  standardLabel: "2–5 раб. дни",
  standardShort: "2–5 раб. дни",
  rushLabel: "1–2 раб. дни",
  rushShort: "1–2 раб. дни",
  rushSurchargePercent: 50,
} as const;

export function productionLeadHelp(rush: boolean) {
  if (rush) {
    return `Ускорена изработка: ${PRODUCTION_LEAD.rushLabel} след потвърждение (+${PRODUCTION_LEAD.rushSurchargePercent}%). Стандартно е ${PRODUCTION_LEAD.standardLabel}.`;
  }
  return `Стандартна изработка: ${PRODUCTION_LEAD.standardLabel} след потвърждение на поръчката/макета. Ускорено: ${PRODUCTION_LEAD.rushLabel} (+${PRODUCTION_LEAD.rushSurchargePercent}%).`;
}

/** Max laser bed size (cm) — single-piece cuts */
export const MACHINE_BED_MAX_CM = 40;

/** Max quantity per line in cart / configurators */
export const MAX_LINE_QTY = 50;

export type QtyDiscount = { minQty: number; percentOff: number };
