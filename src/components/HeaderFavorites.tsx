"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconHeart } from "@/components/Icons";
import { FAVORITES_EVENT, readFavorites } from "@/lib/favorites";

export function HeaderFavorites() {
  const [count, setCount] = useState(0);

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
  }, []);

  return (
    <Link
      href="/favorites"
      className="nav-favorites desktop-only-fav"
      aria-label={
        count > 0 ? `Любими, ${count} артикула` : "Любими"
      }
    >
      <IconHeart size={18} aria-hidden />
      <span className="nav-cart-label">Любими</span>
      {count > 0 ? <span className="cart-badge">{count}</span> : null}
    </Link>
  );
}
