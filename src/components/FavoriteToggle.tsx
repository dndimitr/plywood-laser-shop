"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@/components/Icons";
import {
  FAVORITES_EVENT,
  isFavorite,
  toggleFavorite,
  type FavoriteProduct,
} from "@/lib/favorites";

type Props = FavoriteProduct & {
  className?: string;
};

export function FavoriteToggle({
  slug,
  name,
  imageUrl,
  basePrice,
  className,
}: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function sync() {
      setActive(isFavorite(slug));
    }
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  return (
    <button
      type="button"
      className={`favorite-toggle${active ? " is-active" : ""}${className ? ` ${className}` : ""}`}
      aria-pressed={active}
      aria-label={active ? "Премахни от любими" : "Добави в любими"}
      onClick={() => {
        const next = toggleFavorite({ slug, name, imageUrl, basePrice });
        setActive(next);
      }}
    >
      <IconHeart size={20} filled={active} aria-hidden />
      <span>{active ? "В любими" : "Любими"}</span>
    </button>
  );
}
