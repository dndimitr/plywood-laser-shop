/** Official fixed BGN→EUR rate (БНБ / еврозона) */
export const BGN_PER_EUR = 1.95583;

export const SHOP_CURRENCY = "EUR" as const;

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Convert a legacy BGN amount to EUR and round to cents. */
export function bgnToEur(bgn: number) {
  return roundMoney(bgn / BGN_PER_EUR);
}

/** Format shop money in euro (bg-BG). */
export function formatMoney(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: SHOP_CURRENCY,
  }).format(Number.isFinite(num) ? num : 0);
}
