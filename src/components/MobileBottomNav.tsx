"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconGrid,
  IconHome,
  IconPhone,
} from "@/components/Icons";
import { allOccasionSlugs } from "@/lib/occasions";

type Props = {
  cartCount: number;
  phoneHref: string;
  phoneLabel: string;
};

const OCCASION_SLUGS = new Set(allOccasionSlugs());

function isCatalogPath(pathname: string) {
  if (
    pathname.startsWith("/katalog") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/kategoriya")
  ) {
    return true;
  }
  const first = pathname.split("/")[1] ?? "";
  return OCCASION_SLUGS.has(first);
}

export function MobileBottomNav({
  cartCount,
  phoneHref,
  phoneLabel,
}: Props) {
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const catalogActive = isCatalogPath(pathname);
  const cartActive = pathname.startsWith("/cart") || pathname.startsWith("/checkout");

  return (
    <nav className="mobile-bottom-nav" aria-label="Бърза навигация">
      <Link
        href="/"
        className={`mobile-bottom-link${homeActive ? " is-active" : ""}`}
        aria-current={homeActive ? "page" : undefined}
      >
        <IconHome size={22} aria-hidden />
        <span>Начало</span>
      </Link>

      <Link
        href="/katalog"
        className={`mobile-bottom-link${catalogActive ? " is-active" : ""}`}
        aria-current={catalogActive ? "page" : undefined}
      >
        <IconGrid size={22} aria-hidden />
        <span>Каталог</span>
      </Link>

      <Link
        href="/cart"
        className={`mobile-bottom-link${cartActive ? " is-active" : ""}`}
        aria-current={cartActive ? "page" : undefined}
      >
        <span className="mobile-bottom-icon-wrap">
          <IconCart size={22} aria-hidden />
          {cartCount > 0 ? (
            <span className="mobile-bottom-badge">{cartCount}</span>
          ) : null}
        </span>
        <span>Количка</span>
      </Link>

      <a
        href={phoneHref}
        className="mobile-bottom-link"
        aria-label={`Обади се на ${phoneLabel}`}
      >
        <IconPhone size={22} aria-hidden />
        <span>Телефон</span>
      </a>
    </nav>
  );
}
