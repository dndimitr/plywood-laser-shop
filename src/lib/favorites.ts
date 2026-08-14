"use client";

export const FAVORITES_KEY = "pls_favorites";
export const FAVORITES_EVENT = "pls:favorites";

export type FavoriteProduct = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  basePrice?: number | null;
};

export function readFavorites(): FavoriteProduct[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(list: FavoriteProduct[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

export function isFavorite(slug: string) {
  return readFavorites().some((x) => x.slug === slug);
}

export function toggleFavorite(item: FavoriteProduct) {
  const list = readFavorites();
  const exists = list.some((x) => x.slug === item.slug);
  const next = exists
    ? list.filter((x) => x.slug !== item.slug)
    : [{ ...item }, ...list].slice(0, 40);
  writeFavorites(next);
  return !exists;
}
