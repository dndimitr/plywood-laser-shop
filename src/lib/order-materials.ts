import { materialLabel } from "@/lib/labels";

export type MaterialNeed = {
  thicknessMm: number;
  material: string;
  label: string;
  pieces: number;
  sheets: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function materialsFromOrderItems(
  items: Array<{
    quantity: number;
    sheetCount?: number | null;
    personalization: unknown;
    product?: unknown;
  }>,
): MaterialNeed[] {
  const map = new Map<string, MaterialNeed>();

  for (const item of items) {
    const personalization = asRecord(item.personalization);
    const product = asRecord(item.product);
    const options = Array.isArray(product?.options) ? product.options : [];
    const option = asRecord(options[0]);
    const thicknessMm = Number(
      personalization?.thicknessMm ?? option?.thicknessMm ?? 4,
    );
    const material =
      typeof personalization?.material === "string"
        ? personalization.material
        : typeof option?.material === "string"
          ? option.material
          : "birch-plywood";
    const pieces = item.quantity;
    const sheets =
      item.sheetCount && item.sheetCount > 0
        ? item.sheetCount
        : Math.max(1, pieces);
    const key = `${material}:${thicknessMm}`;
    const current = map.get(key);
    const label = `${materialLabel[material] ?? material} ${thicknessMm} мм`;
    if (current) {
      current.pieces += pieces;
      current.sheets += sheets;
    } else {
      map.set(key, { thicknessMm, material, label, pieces, sheets });
    }
  }

  return [...map.values()].sort((a, b) => a.thicknessMm - b.thicknessMm);
}
