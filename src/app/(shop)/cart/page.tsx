import { CartView } from "@/components/CartView";
import { cartTotals, getCart } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const { subtotal } = cartTotals(cart);

  return (
    <div className="container">
      <CartView initialCart={cart} subtotal={subtotal} />
    </div>
  );
}
