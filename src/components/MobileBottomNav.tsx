"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  IconCart,
  IconHeart,
  IconHome,
  IconPhone,
} from "@/components/Icons";
import {
  FAVORITES_EVENT,
  readFavorites,
} from "@/lib/favorites";

type Props = {
  cartCount: number;
  phoneHref: string;
  phoneLabel: string;
};

export function MobileBottomNav({
  cartCount,
  phoneHref,
  phoneLabel,
}: Props) {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    function sync() {
      setFavCount(readFavorites().length);
    }
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  const homeActive = pathname === "/";
  const favActive = pathname.startsWith("/favorites");
  const cartActive = pathname.startsWith("/cart");

  return (
    <nav className="mobile-bottom-nav" aria-label="Бърза навигация">
      <Link
        href="/"
        className={`mobile-bottom-link${homeActive ? " is-active" : ""}`}
      >
        <IconHome size={22} aria-hidden />
        <span>Начало</span>
      </Link>

      <Link
        href="/favorites"
        className={`mobile-bottom-link${favActive ? " is-active" : ""}`}
      >
        <span className="mobile-bottom-icon-wrap">
          <IconHeart size={22} aria-hidden filled={favActive} />
          {favCount > 0 ? (
            <span className="mobile-bottom-badge">{favCount}</span>
          ) : null}
        </span>
        <span>Любими</span>
      </Link>

      <Link
        href="/cart"
        className={`mobile-bottom-link${cartActive ? " is-active" : ""}`}
      >
        <span className="mobile-bottom-icon-wrap">
          <IconCart size={22} aria-hidden />
          {cartCount > 0 ? (
            <span className="mobile-bottom-badge">{cartCount}</span>
          ) : null}
        </span>
        <span>Количка</span>
      </Link>

      <a href={phoneHref} className="mobile-bottom-link" aria-label={`Обади се на ${phoneLabel}`}>
        <IconPhone size={22} aria-hidden />
        <span>Телефон</span>
      </a>
    </nav>
  );
}
