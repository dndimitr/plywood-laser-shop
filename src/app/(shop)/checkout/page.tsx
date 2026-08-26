import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { InitiateCheckoutTracker } from "@/components/InitiateCheckoutTracker";
import { cartTotals, getCart } from "@/lib/cart";
import { prisma } from "@/lib/db";
import { resolveCatalogContentIds } from "@/lib/meta-catalog-ids";
import { getCourierOptions } from "@/lib/shipping-settings";
import { buildPageMetadata } from "@/lib/seo";
import { getMarketingSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Поръчка",
  description: "Завършете поръчката — доставка, плащане и данни за контакт.",
  path: "/checkout",
  noIndex: true,
});

export default async function CheckoutPage() {
  const cart = await getCart();
  const { subtotal, itemCount } = cartTotals(cart);
  const couriers = getCourierOptions();
  const marketing = getMarketingSettings();

  if (cart.items.length === 0) {
    return (
      <div className="container empty-state">
        <h1 className="page-title">Количката е празна</h1>
        <p className="muted">Добавете модел или файл, преди да продължите към доставка.</p>
        <Link href="/katalog" className="btn btn-primary">
          Към каталога
        </Link>
      </div>
    );
  }

  // Catalog id = product slug only (never cuid / upload UUID / cart line id).
  // Resolve slug from productId for legacy cart cookies missing productSlug.
  const contentIds = await resolveCatalogContentIds(cart.items, async (id) => {
    const p = await prisma.product.findFirst({
      where: { id, active: true },
      select: { slug: true },
    });
    return p?.slug ?? null;
  });

  return (
    <div className="container">
      <InitiateCheckoutTracker
        value={subtotal}
        contentIds={contentIds}
        numItems={itemCount}
        gaId={marketing.gaMeasurementId || null}
      />
      <CheckoutForm subtotal={subtotal} couriers={couriers} items={cart.items} />
    </div>
  );
}
