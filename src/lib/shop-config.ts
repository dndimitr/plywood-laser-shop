/** Shop business config — env-overridable where noted */

export const CATEGORIES = [
  { id: "keychains", label: "Ключодържатели", labelEn: "Keychains" },
  { id: "signs", label: "Табели", labelEn: "Signs" },
  { id: "decor", label: "Декор", labelEn: "Decor" },
  { id: "panels", label: "Стенни панели", labelEn: "Wall panels" },
  { id: "wedding", label: "Сватба", labelEn: "Wedding" },
  { id: "venues", label: "Заведения", labelEn: "Venues" },
  { id: "christmas", label: "Коледа", labelEn: "Christmas" },
  { id: "birthday", label: "Рождени дни", labelEn: "Birthdays" },
  { id: "newborn", label: "Новородени", labelEn: "Newborn" },
  { id: "nursery", label: "Детска", labelEn: "Nursery" },
  { id: "ornaments", label: "Орнаменти", labelEn: "Ornaments" },
  { id: "kitchen", label: "Кухня", labelEn: "Kitchen" },
  { id: "jewelry", label: "Бижута", labelEn: "Jewelry" },
  { id: "pets", label: "Домашни любимци", labelEn: "Pets" },
  { id: "corporate", label: "Корпоративни", labelEn: "Corporate" },
  { id: "gifts", label: "Подаръци", labelEn: "Gifts" },
  { id: "other", label: "Други", labelEn: "Other" },
] as const;

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

export type QtyDiscount = { minQty: number; percentOff: number };
