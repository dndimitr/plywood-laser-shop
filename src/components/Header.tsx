import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { FavoritesLink } from "@/components/FavoritesLink";
import { HeaderSearch } from "@/components/HeaderSearch";
import { IconCart } from "@/components/Icons";
import { MobileNav } from "@/components/MobileNav";
import { NavLink } from "@/components/NavLink";
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
            <NavLink href="/katalog" className="nav-dropdown-trigger">
              Каталог
              <span className="nav-caret" aria-hidden>
                ▾
              </span>
            </NavLink>
            <div className="nav-dropdown-panel nav-dropdown-panel-wide" role="menu">
              <Link href="/katalog" role="menuitem" className="nav-dropdown-all">
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
          <NavLink href={categoryHref("nursery")}>Детска</NavLink>
          <NavLink href="/blog">Идеи</NavLink>
          <NavLink href="/custom">Ваш дизайн</NavLink>
          <NavLink href="/account">Поръчки</NavLink>
        </nav>

        <div className="header-actions">
          <HeaderSearch />
          <FavoritesLink />
          <NavLink
            href="/cart"
            className="nav-cart"
            aria-label={`Количка, ${itemCount} артикула`}
          >
            <IconCart size={18} aria-hidden />
            <span className="nav-cart-label">Количка</span>
            {itemCount > 0 ? (
              <span className="cart-badge">{itemCount}</span>
            ) : null}
          </NavLink>
          <MobileNav cartCount={itemCount} />
        </div>
      </div>

      <div className="category-bar" aria-label="Популярни категории">
        <div className="container category-bar-inner">
          <NavLink href="/katalog" exact className="category-bar-link">
            Всички
          </NavLink>
          {featured.map((c) => (
            <NavLink
              key={c.id}
              href={categoryHref(c.id)}
              className="category-bar-link"
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
