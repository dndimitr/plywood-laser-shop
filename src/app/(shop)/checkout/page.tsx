import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { cartTotals, getCart } from "@/lib/cart";
import { getCourierOptions } from "@/lib/shipping-settings";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Поръчка",
  description: "Завършете поръчката — доставка, плащане и данни за контакт.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const cart = await getCart();
  const { subtotal } = cartTotals(cart);
  const couriers = getCourierOptions();

  if (cart.items.length === 0) {
    return (
      <div className="container empty-state">
        <h1 className="page-title">Количката е празна</h1>
        <p className="muted">Добавете модел или файл, преди да продължите към доставка.</p>
        <Link href="/#katalog" className="btn btn-primary">
          Към каталога
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <CheckoutForm subtotal={subtotal} couriers={couriers} />
    </div>
  );
}
