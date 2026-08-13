import Link from "next/link";
import { IconCart } from "@/components/Icons";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { cartTotals, getCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/shop-config";

export async function Header() {
  const cart = await getCart();
  const { itemCount } = cartTotals(cart);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="ЛазерШперплат — начало">
          ЛазерШперплат
        </Link>
        <nav className="nav" aria-label="Основна навигация">
          <div className="nav-dropdown">
            <Link href="/#katalog" className="nav-dropdown-trigger">
              Каталог
              <span className="nav-caret" aria-hidden>
                ▾
              </span>
            </Link>
            <div className="nav-dropdown-panel" role="menu">
              <Link href="/#katalog" role="menuitem">
                Всички категории
              </Link>
              <div className="nav-dropdown-divider" />
              {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
                <Link
                  key={c.id}
                  href={`/?cat=${c.id}#katalog`}
                  role="menuitem"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/#kak-raboti">Как работи</Link>
          <Link href="/custom">По файл</Link>
          <Link href="/account">Поръчки</Link>
          <LocaleSwitch />
          <Link
            href="/cart"
            className="nav-cart"
            aria-label={`Количка, ${itemCount} артикула`}
          >
            <IconCart size={18} aria-hidden />
            Количка
            {itemCount > 0 ? (
              <span className="cart-badge">{itemCount}</span>
            ) : null}
          </Link>
        </nav>
      </div>
      <div className="category-bar" aria-label="Категории">
        <div className="container category-bar-inner">
          <Link href="/#katalog" className="category-bar-link">
            Всички
          </Link>
          {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
            <Link
              key={c.id}
              href={`/?cat=${c.id}#katalog`}
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
