import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { ScrollToTop } from "@/components/ScrollToTop";
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
      <a href="#main-content" className="skip-link">
        Към съдържанието
      </a>
      <Header />
      <main id="main-content" className="shop-main">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <MobileBottomNav
        cartCount={itemCount}
        phoneHref={getShopPhoneHref()}
        phoneLabel={getShopPhone()}
      />
    </>
  );
}
