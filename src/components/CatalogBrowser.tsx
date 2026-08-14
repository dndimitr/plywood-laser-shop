"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import {
  CATEGORIES,
  CATEGORY_GROUPS,
  categoryById,
  navCategoryGroups,
} from "@/lib/shop-config";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number | string;
  imageUrl: string | null;
};

type CatWithCount = {
  id: string;
  label: string;
  count: number;
};

function labelFor(id: string) {
  return categoryById(id)?.label ?? id;
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
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
  );
}

export function CatalogBrowser({ products }: { products: Product[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("cat") ?? "all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sheetTitleId = useId();

  useEffect(() => {
    setCategory(params.get("cat") ?? "all");
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  const searched = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query),
    );
  }, [products, q]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [products]);

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

  const filterGroups = useMemo(() => {
    return navCategoryGroups()
      .map(({ group, categories }) => ({
        group,
        categories: categories
          .map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))
          .filter((c) => c.count > 0),
      }))
      .filter((g) => g.categories.length > 0);
  }, [counts]);

  function syncUrl(nextQ: string, nextCat: string) {
    const sp = new URLSearchParams();
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    if (nextCat !== "all") sp.set("cat", nextCat);
    const qs = sp.toString();
    router.replace(qs ? `/?${qs}#katalog` : "/#katalog", { scroll: false });
  }

  function selectCategory(nextCat: string, closeSheet = false) {
    setCategory(nextCat);
    syncUrl(q, nextCat);
    if (closeSheet) setFiltersOpen(false);
  }

  const totalShown = groups.reduce((n, g) => n + g.products.length, 0);
  const activeLabel =
    category === "all" ? null : categoryById(category)?.label ?? category;

  function renderChip(c: CatWithCount | { id: "all"; label: string; count: number }) {
    const isActive = c.id === "all" ? category === "all" : category === c.id;
    return (
      <button
        type="button"
        key={c.id}
        className={isActive ? "cat-chip is-active" : "cat-chip"}
        onClick={() => selectCategory(c.id)}
      >
        {c.label}
        <span className="cat-chip-count">{c.count}</span>
      </button>
    );
  }

  return (
    <div className="catalog-browser">
      {/* Mobile: search + filters button, no horizontal scroll */}
      <div className="catalog-mobile-bar">
        <label className="field catalog-mobile-search">
          <span className="sr-only">Търсене</span>
          <input
            value={q}
            placeholder="Търсене…"
            onChange={(e) => {
              setQ(e.target.value);
              syncUrl(e.target.value, category);
            }}
            aria-label="Търсене в каталога"
          />
        </label>
        <button
          type="button"
          className={`catalog-filter-btn${category !== "all" ? " has-filter" : ""}`}
          aria-expanded={filtersOpen}
          aria-controls="catalog-filter-sheet"
          onClick={() => setFiltersOpen(true)}
        >
          Филтри
          {category !== "all" ? <span className="catalog-filter-dot" /> : null}
        </button>
      </div>

      {activeLabel ? (
        <div className="catalog-active-filter">
          <button
            type="button"
            className="catalog-active-chip"
            onClick={() => selectCategory("all")}
            aria-label={`Премахни филтър ${activeLabel}`}
          >
            <span>
              {activeLabel}
              <span className="muted"> · филтър</span>
            </span>
            <span className="catalog-active-clear" aria-hidden>
              ×
            </span>
          </button>
        </div>
      ) : null}

      {/* Desktop: search + grouped filters */}
      <div className="catalog-desktop-bar">
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
        <nav className="catalog-desktop-filters" aria-label="Категории в каталога">
          <div className="catalog-filter-row">
            {renderChip({ id: "all", label: "Всички", count: products.length })}
          </div>
          {filterGroups.map(({ group, categories }) => (
            <div key={group.id} className="catalog-filter-group">
              <p className="catalog-filter-label">{group.label}</p>
              <div className="catalog-cat-nav">
                {categories.map((c) => renderChip(c))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Filter bottom sheet (mobile) */}
      <div
        className={`filter-sheet-backdrop${filtersOpen ? " is-open" : ""}`}
        aria-hidden={!filtersOpen}
        onClick={() => setFiltersOpen(false)}
      />
      <div
        id="catalog-filter-sheet"
        className={`filter-sheet${filtersOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={sheetTitleId}
        aria-hidden={!filtersOpen}
      >
        <div className="filter-sheet-handle" aria-hidden />
        <div className="filter-sheet-head">
          <h2 id={sheetTitleId}>Категории</h2>
          <button
            type="button"
            className="filter-sheet-close"
            onClick={() => setFiltersOpen(false)}
          >
            Готово
          </button>
        </div>
        <div className="filter-sheet-body">
          <button
            type="button"
            className={
              category === "all"
                ? "filter-sheet-all is-active"
                : "filter-sheet-all"
            }
            onClick={() => selectCategory("all", true)}
          >
            Всички категории
            <span className="cat-chip-count">{products.length}</span>
          </button>
          {filterGroups.map(({ group, categories }) => (
            <div key={group.id} className="filter-sheet-group">
              <p className="catalog-filter-label">{group.label}</p>
              <div className="filter-sheet-chips">
                {categories.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={
                      category === c.id ? "cat-chip is-active" : "cat-chip"
                    }
                    onClick={() => selectCategory(c.id, true)}
                  >
                    {c.label}
                    <span className="cat-chip-count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalShown === 0 ? (
        <p className="muted">Няма модели по избраните филтри.</p>
      ) : (
        <div className="catalog-groups">
          {category === "all"
            ? CATEGORY_GROUPS.map((section) => {
                const sectionGroups = groups.filter((g) =>
                  section.categoryIds.includes(
                    g.id as (typeof section.categoryIds)[number],
                  ),
                );
                if (!sectionGroups.length) return null;
                return (
                  <div key={section.id} className="catalog-section">
                    <h3 className="catalog-section-title">{section.label}</h3>
                    {sectionGroups.map((group) => (
                      <section
                        key={group.id}
                        id={`cat-${group.id}`}
                        className="catalog-group"
                        aria-labelledby={`cat-title-${group.id}`}
                      >
                        <div className="catalog-group-head">
                          <h4 id={`cat-title-${group.id}`}>{group.label}</h4>
                          <span className="muted">
                            {group.products.length}{" "}
                            {group.products.length === 1 ? "модел" : "модела"}
                          </span>
                        </div>
                        <ProductGrid products={group.products} />
                      </section>
                    ))}
                  </div>
                );
              })
            : groups.map((group) => (
                <section
                  key={group.id}
                  id={`cat-${group.id}`}
                  className="catalog-group catalog-group-filtered"
                  aria-labelledby={`cat-title-${group.id}`}
                >
                  <div className="catalog-group-head">
                    <h3 id={`cat-title-${group.id}`}>{group.label}</h3>
                    <span className="muted">
                      {group.products.length}{" "}
                      {group.products.length === 1 ? "модел" : "модела"}
                    </span>
                  </div>
                  <ProductGrid products={group.products} />
                </section>
              ))}

          {category === "all"
            ? groups
                .filter(
                  (g) =>
                    !CATEGORY_GROUPS.some((section) =>
                      section.categoryIds.includes(
                        g.id as (typeof section.categoryIds)[number],
                      ),
                    ),
                )
                .map((group) => (
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
                    <ProductGrid products={group.products} />
                  </section>
                ))
            : null}
        </div>
      )}
    </div>
  );
}
