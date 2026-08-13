"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBgn } from "@/lib/pricing";
import {
  FAVORITES_EVENT,
  readFavorites,
  toggleFavorite,
  type FavoriteProduct,
} from "@/lib/favorites";

export function FavoritesView() {
  const [list, setList] = useState<FavoriteProduct[]>([]);

  useEffect(() => {
    function sync() {
      setList(readFavorites());
    }
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!list.length) {
    return (
      <div className="empty-state">
        <h1 className="page-title">Любими</h1>
        <p className="muted">
          Все още нямате запазени продукти. Отворете модел и натиснете „Любими“.
        </p>
        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <Link href="/#katalog" className="btn btn-primary">
            Към каталога
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1 className="page-title">Любими</h1>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        {list.length} {list.length === 1 ? "продукт" : "продукта"}
      </p>
      <div className="product-grid">
        {list.map((item) => (
          <article key={item.slug} className="product-card favorites-card">
            <Link href={`/products/${item.slug}`} className="favorites-card-link">
              <div className="product-card-media">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width:639px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                    unoptimized={item.imageUrl.endsWith(".svg")}
                  />
                ) : (
                  <div className="product-card-placeholder" aria-hidden />
                )}
              </div>
              <div className="product-card-body">
                <h3>{item.name}</h3>
                {typeof item.basePrice === "number" ? (
                  <span className="price">от {formatBgn(item.basePrice)}</span>
                ) : null}
              </div>
            </Link>
            <button
              type="button"
              className="btn btn-ghost favorites-remove"
              onClick={() => toggleFavorite(item)}
            >
              Премахни
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
