import { cookies } from "next/headers";

export type CartItemPersonalization = {
  engravingText?: string;
  sizeLabel?: string;
  thicknessMm?: number;
  laserType?: string;
  widthCm?: number;
  heightCm?: number;
  complexity?: string;
  notes?: string;
  optionId?: string;
  optionLabel?: string;
  material?: string;
  finish?: string;
  doubleSided?: boolean;
  rush?: boolean;
};

export type CartItem = {
  id: string;
  type: "TEMPLATE" | "CUSTOM";
  productId?: string;
  productSlug?: string;
  uploadedDesignId?: string;
  designUrl?: string;
  title: string;
  quantity: number;
  unitPrice: number;
  personalization: CartItemPersonalization;
};

export type Cart = {
  items: CartItem[];
};

export const CART_COOKIE = "pls_cart";

export function emptyCart(): Cart {
  return { items: [] };
}

export async function getCart(): Promise<Cart> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Cart;
    if (!parsed?.items || !Array.isArray(parsed.items)) return emptyCart();
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function serializeCart(cart: Cart) {
  return encodeURIComponent(JSON.stringify(cart));
}

export function cartTotals(cart: Cart) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal: Math.round(subtotal * 100) / 100, itemCount };
}
