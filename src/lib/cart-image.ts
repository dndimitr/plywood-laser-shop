import type { CartItem } from "@/lib/cart";

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i;

export function cartItemImage(item: CartItem): string | null {
  if (item.imageUrl) return item.imageUrl;
  if (item.designUrl && IMAGE_EXT.test(item.designUrl)) return item.designUrl;
  return null;
}
