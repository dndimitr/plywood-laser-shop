import type { QtyDiscount } from "@/lib/shop-config";

export type ThicknessCoefficients = Record<string, number>;
export type ComplexityMultipliers = Record<string, number>;

export type CustomPricingInput = {
  widthCm: number;
  heightCm: number;
  thicknessMm: number;
  complexity: string;
  pricePerCm2: number;
  thicknessCoefficients: ThicknessCoefficients;
  complexityMultipliers: ComplexityMultipliers;
  minPrice: number;
  quantity?: number;
  quantityDiscounts?: QtyDiscount[];
  rush?: boolean;
  rushMultiplier?: number;
  doubleSided?: boolean;
};

export function calculateTemplatePrice(
  basePrice: number,
  priceModifier: number,
  quantity = 1,
  extras?: {
    quantityDiscounts?: QtyDiscount[];
    rush?: boolean;
    rushMultiplier?: number;
    doubleSided?: boolean;
  },
) {
  let unit = basePrice + priceModifier;
  if (extras?.doubleSided) unit *= 1.35;
  let total = unit * quantity;
  total = applyQuantityDiscount(total, quantity, extras?.quantityDiscounts);
  if (extras?.rush) total *= extras.rushMultiplier ?? 1.5;
  return roundMoney(total);
}

export function calculateCustomPrice(input: CustomPricingInput) {
  const area = Math.max(input.widthCm, 0) * Math.max(input.heightCm, 0);
  const thicknessKey = String(input.thicknessMm);
  const thicknessCoef =
    input.thicknessCoefficients[thicknessKey] ??
    input.thicknessCoefficients["default"] ??
    1;
  const complexityCoef =
    input.complexityMultipliers[input.complexity] ??
    input.complexityMultipliers["medium"] ??
    1;

  let unit = area * input.pricePerCm2 * thicknessCoef * complexityCoef;
  unit = Math.max(unit, input.minPrice);
  if (input.doubleSided) unit *= 1.35;

  const qty = input.quantity ?? 1;
  let total = unit * qty;
  total = applyQuantityDiscount(total, qty, input.quantityDiscounts);
  if (input.rush) total *= input.rushMultiplier ?? 1.5;
  return roundMoney(total);
}

export function unitPriceFromTotal(total: number, quantity: number) {
  if (quantity <= 0) return roundMoney(total);
  return roundMoney(total / quantity);
}

function applyQuantityDiscount(
  amount: number,
  quantity: number,
  discounts?: QtyDiscount[],
) {
  if (!discounts?.length) return amount;
  const sorted = [...discounts].sort((a, b) => b.minQty - a.minQty);
  const hit = sorted.find((d) => quantity >= d.minQty);
  if (!hit) return amount;
  return amount * (1 - hit.percentOff / 100);
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatBgn(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
  }).format(num);
}
