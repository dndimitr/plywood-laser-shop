import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { IconCart } from "@/components/Icons";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { MobileNav } from "@/components/MobileNav";
import { TopInfoBar } from "@/components/TopInfoBar";
import { cartTotals, getCart } from "@/lib/cart";
import { categoryHref } from "@/lib/occasions";
import {
  featuredCategories,
  navCategoryGroups,
} from "@/lib/shop-config";
import { SITE_NAME } from "@/lib/seo";

export async function Header() {
  const cart = await getCart();
  const { itemCount } = cartTotals(cart);
  const featured = featuredCategories();
  const groups = navCategoryGroups();

  return (
    <header className="site-header">
      <TopInfoBar />
      <div className="container header-inner">
        <Link href="/" className="brand brand--logo" aria-label={`${SITE_NAME} — начало`}>
          <BrandLogo variant="header" priority />
        </Link>

        <nav className="nav desktop-nav" aria-label="Основна навигация">
          <div className="nav-dropdown">
            <Link href="/#katalog" className="nav-dropdown-trigger">
              Каталог
              <span className="nav-caret" aria-hidden>
                ▾
              </span>
            </Link>
            <div className="nav-dropdown-panel nav-dropdown-panel-wide" role="menu">
              <Link href="/#katalog" role="menuitem" className="nav-dropdown-all">
                Всички категории
              </Link>
              <div className="nav-mega">
                {groups.map(({ group, categories }) => (
                  <div key={group.id} className="nav-mega-col">
                    <p className="nav-mega-label">{group.label}</p>
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        href={categoryHref(c.id)}
                        role="menuitem"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Link href="/#kak-raboti">Как работи</Link>
          <Link href={categoryHref("nursery")}>Детска</Link>
          <Link href="/blog">Блог</Link>
          <Link href="/custom">По файл</Link>
          <Link href="/account">Поръчки</Link>
          <LocaleSwitch />
        </nav>

        <div className="header-actions">
          <Link
            href="/cart"
            className="nav-cart"
            aria-label={`Количка, ${itemCount} артикула`}
          >
            <IconCart size={18} aria-hidden />
            <span className="nav-cart-label">Количка</span>
            {itemCount > 0 ? (
              <span className="cart-badge">{itemCount}</span>
            ) : null}
          </Link>
          <MobileNav cartCount={itemCount} />
        </div>
      </div>

      <div className="category-bar" aria-label="Популярни категории">
        <div className="container category-bar-inner">
          <Link href="/#katalog" className="category-bar-link">
            Всички
          </Link>
          {featured.map((c) => (
            <Link
              key={c.id}
              href={categoryHref(c.id)}
              className="category-bar-link"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
