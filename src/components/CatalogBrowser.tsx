"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/shop-config";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number | string;
  imageUrl: string | null;
};

function labelFor(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function CatalogBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("cat") ?? "all");

  useEffect(() => {
    setCategory(params.get("cat") ?? "all");
    setQ(params.get("q") ?? "");
  }, [params]);

  const searched = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    );
  }, [products, q]);

  const groups = useMemo(() => {
    const byId = new Map<string, Product[]>();
    for (const p of searched) {
      const key = p.category || "other";
      if (!byId.has(key)) byId.set(key, []);
      byId.get(key)!.push(p);
    }

    const ordered: { id: string; label: string; products: Product[] }[] =
      CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        products: byId.get(c.id) ?? [],
      })).filter((g) => g.products.length > 0);

    // Any unknown category ids
    for (const [id, list] of byId) {
      if (!CATEGORIES.some((c) => c.id === id) && list.length) {
        ordered.push({ id, label: labelFor(id), products: list });
      }
    }

    if (category !== "all") {
      return ordered.filter((g) => g.id === category);
    }
    return ordered;
  }, [searched, category]);

  const availableCats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return CATEGORIES.filter((c) => (counts.get(c.id) ?? 0) > 0).map((c) => ({
      ...c,
      count: counts.get(c.id) ?? 0,
    }));
  }, [products]);

  function syncUrl(nextQ: string, nextCat: string) {
    const sp = new URLSearchParams();
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    if (nextCat !== "all") sp.set("cat", nextCat);
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}#katalog` : "/#katalog", { scroll: false });
  }

  function selectCategory(nextCat: string) {
    setCategory(nextCat);
    syncUrl(q, nextCat);
  }

  const totalShown = groups.reduce((n, g) => n + g.products.length, 0);

  return (
    <div>
      <div className="catalog-toolbar">
        <label className="field" style={{ marginBottom: 0, flex: 1 }}>
          <span>Търсене</span>
          <input
            value={q}
            placeholder="Име или описание…"
            onChange={(e) => {
              setQ(e.target.value);
              syncUrl(e.target.value, category);
            }}
          />
        </label>
      </div>

      <nav className="catalog-cat-nav" aria-label="Категории в каталога">
        <button
          type="button"
          className={category === "all" ? "cat-chip is-active" : "cat-chip"}
          onClick={() => selectCategory("all")}
        >
          Всички
          <span className="cat-chip-count">{products.length}</span>
        </button>
        {availableCats.map((c) => (
          <button
            type="button"
            key={c.id}
            className={category === c.id ? "cat-chip is-active" : "cat-chip"}
            onClick={() => selectCategory(c.id)}
          >
            {c.label}
            <span className="cat-chip-count">{c.count}</span>
          </button>
        ))}
      </nav>

      {totalShown === 0 ? (
        <p className="muted">Няма модели по избраните филтри.</p>
      ) : (
        <div className="catalog-groups">
          {groups.map((group) => (
            <section
              key={group.id}
              id={`cat-${group.id}`}
              className="catalog-group"
              aria-labelledby={`cat-title-${group.id}`}
            >
              <div className="catalog-group-head">
                <h3 id={`cat-title-${group.id}`}>{group.label}</h3>
                <span className="muted">
                  {group.products.length}{" "}
                  {group.products.length === 1 ? "модел" : "модела"}
                </span>
              </div>
              <div className="product-grid">
                {group.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      name: product.name,
                      slug: product.slug,
                      description: product.description,
                      basePrice: Number(product.basePrice),
                      imageUrl: product.imageUrl,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
