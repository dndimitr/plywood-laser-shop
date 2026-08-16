import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/db";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  DEFAULT_DESCRIPTION,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { cat, q } = await searchParams;
  if (q?.trim()) {
    return buildPageMetadata({
      title: `Търсене: ${q.trim()}`,
      description: `Резултати от каталога за „${q.trim()}“.`,
      path: `/katalog?q=${encodeURIComponent(q.trim())}`,
      noIndex: true,
    });
  }
  if (cat?.trim()) {
    return buildPageMetadata({
      title: `Каталог — филтър`,
      description: DEFAULT_DESCRIPTION,
      path: `/katalog?cat=${encodeURIComponent(cat.trim())}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: "Каталог",
    description:
      "Пълен каталог с персонализирани подаръци и украси от шперплат — сватба, детска, Монтесори, дом и бизнес. Доставка в България.",
    path: "/katalog",
  });
}

export default async function KatalogPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="catalog-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Начало", path: "/" },
          { name: "Каталог", path: "/katalog" },
        ])}
      />
      <section className="section container" style={{ paddingBottom: "1rem" }}>
        <nav className="product-breadcrumb" aria-label="Навигация">
          <Link href="/">Начало</Link>
          <span aria-hidden>/</span>
          <span>Каталог</span>
        </nav>
        <h1 className="page-title">Каталог</h1>
        <p className="section-lead">
          Готови модели по поводи, детска и Монтесори, дом, бизнес и аксесоари.
          Филтрирайте или търсете по име.
        </p>
      </section>

      <section
        id="katalog"
        className="section"
        style={{ paddingTop: 0, scrollMarginTop: "var(--header-h)" }}
      >
        <div className="container">
          <Suspense fallback={<p className="muted">Зареждане…</p>}>
            <CatalogBrowser
              products={products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description,
                category: p.category ?? "other",
                basePrice: Number(p.basePrice),
                imageUrl: p.imageUrl,
              }))}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
