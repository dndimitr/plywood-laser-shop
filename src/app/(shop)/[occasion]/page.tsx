import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { JsonLd } from "@/components/JsonLd";
import { prisma } from "@/lib/db";
import {
  allOccasionSlugs,
  OCCASION_RESERVED_PATHS,
  OCCASIONS,
  occasionBySlug,
  occasionPath,
  type OccasionDef,
} from "@/lib/occasions";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  faqJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ occasion: string }> };

export function generateStaticParams() {
  return allOccasionSlugs().map((occasion) => ({ occasion }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { occasion: slug } = await params;
  if (OCCASION_RESERVED_PATHS.has(slug)) return { title: "Страница" };
  const occasion = occasionBySlug(slug);
  if (!occasion) return { title: "Повод" };
  return buildPageMetadata({
    title: occasion.title,
    description: occasion.description,
    path: occasionPath(occasion.slug),
  });
}

function itemListJsonLd(
  occasion: OccasionDef,
  products: Array<{ name: string; slug: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: occasion.headline,
    description: occasion.description,
    url: absoluteUrl(occasionPath(occasion.slug)),
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

export default async function OccasionPage({ params }: Props) {
  const { occasion: slug } = await params;
  if (OCCASION_RESERVED_PATHS.has(slug)) notFound();
  const occasion = occasionBySlug(slug);
  if (!occasion) notFound();

  const products = await prisma.product.findMany({
    where: { active: true, category: occasion.categoryId },
    orderBy: { name: "asc" },
  });

  const others = OCCASIONS.filter((o) => o.slug !== occasion.slug);

  return (
    <div className="occasion-page">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Поводи", path: "/#katalog" },
            { name: occasion.navLabel, path: occasionPath(occasion.slug) },
          ]),
          faqJsonLd(occasion.faqs),
          itemListJsonLd(
            occasion,
            products.map((p) => ({ name: p.name, slug: p.slug })),
          ),
        ]}
      />

      <section className="occasion-hero">
        <div className="container">
          <nav className="product-breadcrumb" aria-label="Навигация">
            <Link href="/">Начало</Link>
            <span aria-hidden>/</span>
            <Link href="/#katalog">Каталог</Link>
            <span aria-hidden>/</span>
            <span>{occasion.navLabel}</span>
          </nav>
          <h1 className="page-title">{occasion.headline}</h1>
          <p className="section-lead occasion-intro">{occasion.intro}</p>
          <ul className="occasion-bullets">
            {occasion.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <div className="cta-row" style={{ marginTop: "1.25rem" }}>
            <a href="#kolekciya" className="btn btn-primary">
              Виж колекцията
            </a>
            <Link href="/custom" className="btn btn-ghost">
              Поръчай по файл
            </Link>
          </div>
        </div>
      </section>

      <section id="kolekciya" className="section container occasion-catalog">
        <h2>Колекция „{occasion.navLabel}“</h2>
        <p className="section-lead">
          {products.length}{" "}
          {products.length === 1
            ? "модел"
            : products.length < 5
              ? "модела"
              : "модела"}{" "}
          с опция за персонализация — изберете и добавете име, дата или послание.
        </p>
        {products.length === 0 ? (
          <p className="muted">Скоро ще добавим модели в тази колекция.</p>
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

      <section className="section section-alt">
        <div className="container">
          <h2>Често задавани въпроси</h2>
          <div className="faq">
            {occasion.faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>Други поводи</h2>
        <p className="section-lead">
          Разгледайте още колекции за празници и лични поводи.
        </p>
        <div className="occasion-chips">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={occasionPath(o.slug)}
              className="occasion-chip"
            >
              {o.navLabel}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
