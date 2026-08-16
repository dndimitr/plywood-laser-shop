import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { cartTotals, getCart } from "@/lib/cart";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Количка",
  description: "Преглед на продуктите в количката преди поръчка.",
  path: "/cart",
  noIndex: true,
});

export default async function CartPage() {
  const cart = await getCart();
  const { subtotal } = cartTotals(cart);

  return (
    <div className="container">
      <CartView initialCart={cart} subtotal={subtotal} />
    </div>
  );
}
