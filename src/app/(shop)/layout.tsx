import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { cartTotals, getCart } from "@/lib/cart";
import { getShopPhone, getShopPhoneHref } from "@/lib/shop-config";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCart();
  const { itemCount } = cartTotals(cart);

  return (
    <>
      <Header />
      <main className="shop-main">{children}</main>
      <Footer />
      <MobileBottomNav
        cartCount={itemCount}
        phoneHref={getShopPhoneHref()}
        phoneLabel={getShopPhone()}
      />
    </>
  );
}
