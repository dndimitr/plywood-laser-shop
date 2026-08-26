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
  imageUrl?: string | null;
  personalization: CartItemPersonalization;
};

export type Cart = {
  items: CartItem[];
};

export const CART_COOKIE = "pls_cart";

export function emptyCart(): Cart {
  return { items: [] };
}

function productionCookieDomain(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return undefined;
  try {
    const host = new URL(raw).hostname.replace(/^www\./i, "");
    if (!host || host === "localhost" || host.endsWith(".vercel.app")) {
      return undefined;
    }
    return host;
  } catch {
    return undefined;
  }
}

export function cartCookieOptions(maxAge = 60 * 60 * 24 * 14) {
  const domain = productionCookieDomain();
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    secure: process.env.VERCEL === "1",
    ...(domain ? { domain } : {}),
  };
}

function parseCartCookie(raw: string): Cart {
  const candidates = [raw];
  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    /* ignore malformed percent-encoding from older cookies */
  }
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Cart;
      if (parsed?.items && Array.isArray(parsed.items)) return parsed;
    } catch {
      /* try next encoding */
    }
  }
  return emptyCart();
}

export async function getCart(): Promise<Cart> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return emptyCart();
  return parseCartCookie(raw);
}

export function serializeCart(cart: Cart) {
  return JSON.stringify(cart);
}

export function cartTotals(cart: Cart) {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal: Math.round(subtotal * 100) / 100, itemCount };
}
