import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/db";
import {
  allCategoryLandingSlugs,
  categoryLandingBySlug,
  categoryLandingPath,
  CATEGORY_LANDINGS,
  type CategoryLanding,
} from "@/lib/category-landings";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allCategoryLandingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const landing = categoryLandingBySlug(slug);
  if (!landing) return { title: "Категория" };
  return buildPageMetadata({
    title: landing.title,
    description: landing.description,
    path: categoryLandingPath(landing.slug),
  });
}

function collectionJsonLd(
  landing: CategoryLanding,
  products: Array<{ name: string; slug: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: landing.headline,
    description: landing.description,
    url: absoluteUrl(categoryLandingPath(landing.slug)),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/products/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export default async function CategoryLandingPage({ params }: Props) {
  const { slug } = await params;
  const landing = categoryLandingBySlug(slug);
  if (!landing) notFound();

  const products = await prisma.product.findMany({
    where: { active: true, category: landing.categoryId },
    orderBy: { name: "asc" },
  });

  const others = CATEGORY_LANDINGS.filter((c) => c.slug !== landing.slug);

  return (
    <div className="occasion-page">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Каталог", path: "/katalog" },
            { name: landing.navLabel, path: categoryLandingPath(landing.slug) },
          ]),
          collectionJsonLd(
            landing,
            products.map((p) => ({ name: p.name, slug: p.slug })),
          ),
        ]}
      />

      <section className="occasion-hero">
        <div className="container">
          <nav className="product-breadcrumb" aria-label="Навигация">
            <Link href="/">Начало</Link>
            <span aria-hidden>/</span>
            <Link href="/katalog">Каталог</Link>
            <span aria-hidden>/</span>
            <span>{landing.navLabel}</span>
          </nav>
          <h1 className="page-title">{landing.headline}</h1>
          <p className="section-lead occasion-intro">{landing.intro}</p>
          <ul className="occasion-bullets">
            {landing.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="cta-row" style={{ marginTop: "1.25rem" }}>
            <a href="#kolekciya" className="btn btn-primary">
              Виж продуктите
            </a>
            <Link href="/custom" className="btn btn-ghost">
              Поръчай по файл
            </Link>
          </div>
        </div>
      </section>

      <section id="kolekciya" className="section container occasion-catalog">
        <h2>Категория „{landing.navLabel}“</h2>
        <p className="section-lead">
          {products.length}{" "}
          {products.length === 1
            ? "модел"
            : products.length < 5
              ? "модела"
              : "модела"}{" "}
          с опция за персонализация — добавете име, дата или послание.
        </p>
        {products.length === 0 ? (
          <p className="muted">Скоро ще добавим модели в тази категория.</p>
        ) : (
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
        )}
      </section>

      <section className="section container">
        <h2>Други категории</h2>
        <div className="occasion-chips">
          {others.map((c) => (
            <Link
              key={c.slug}
              href={categoryLandingPath(c.slug)}
              className="occasion-chip"
            >
              {c.navLabel}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
