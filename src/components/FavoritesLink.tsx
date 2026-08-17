"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IconHeart } from "@/components/Icons";
import { FAVORITES_EVENT, readFavorites } from "@/lib/favorites";

export function FavoritesLink() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const active = pathname.startsWith("/favorites");

  useEffect(() => {
    function sync() {
      setCount(readFavorites().length);
    }
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

  return (
    <Link
      href="/favorites"
      className={`nav-icon-btn${active ? " is-active" : ""}`}
      aria-label={count > 0 ? `Любими, ${count}` : "Любими"}
      aria-current={active ? "page" : undefined}
    >
      <IconHeart size={18} aria-hidden filled={active} />
      {count > 0 ? <span className="cart-badge">{count}</span> : null}
    </Link>
  );
}
