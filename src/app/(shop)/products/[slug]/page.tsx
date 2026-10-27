import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FacebookShareButton } from "@/components/FacebookShareButton";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { JsonLd } from "@/components/JsonLd";
import { MetaViewContent } from "@/components/MetaViewContent";
import { ProductCard } from "@/components/ProductCard";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import {
  RecentlyViewed,
  TrackProductView,
} from "@/components/RecentlyViewed";
import { prisma } from "@/lib/db";
import { catalogProductWhere } from "@/lib/catalog-where";
import { formatBgn } from "@/lib/pricing";
import { finishLabel, materialLabel } from "@/lib/labels";
import { buildProductSeo } from "@/lib/product-seo";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  productJsonLd,
} from "@/lib/seo";
import { KIT_ENGRAVING_HINTS, KIT_RELATED } from "@/data/catalog-kits";
import { getMarketingSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, ...catalogProductWhere },
  });
  if (!product) {
    return buildPageMetadata({
      title: "Продуктът не е намерен",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }
  const seo = buildProductSeo({
    name: product.name,
    description: product.description,
    slug: product.slug,
    category: product.category,
  });
  return buildPageMetadata({
    title: seo.title,
    description: seo.metaDescription,
    path: `/products/${product.slug}`,
    image: product.imageUrl,
    type: "product",
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, ...catalogProductWhere },
    include: { options: { orderBy: { priceModifier: "asc" } } },
  });

  if (!product) notFound();

  const gallery: string[] =
    (product.galleryUrls as string[] | undefined)?.length
      ? (product.galleryUrls as string[])
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const [related, publishedReviews] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...catalogProductWhere,
        category: product.category,
        slug: { not: product.slug },
      },
      orderBy: { name: "asc" },
      take: 8,
    }),
    prisma.review.findMany({
      where: { published: true },
      take: 200,
    }),
  ]);

  const basePrice = Number(product.basePrice);
  const marketing = getMarketingSettings();
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const seo = buildProductSeo({
    name: product.name,
    description: product.description,
    slug: product.slug,
    category: product.category,
  });

  const crumbs: Array<{ name: string; path: string }> = [
    { name: "Начало", path: "/" },
    { name: "Каталог", path: "/katalog" },
  ];
  if (seo.categoryLabel && seo.categoryHref) {
    crumbs.push({ name: seo.categoryLabel, path: seo.categoryHref });
  }
  crumbs.push({ name: product.name, path: `/products/${product.slug}` });

  const ratingCount = publishedReviews.length;
  const ratingValue =
    ratingCount > 0
      ? Math.round(
          (publishedReviews.reduce((s, r) => s + Number(r.rating || 0), 0) /
            ratingCount) *
            10,
        ) / 10
      : null;

  return (
    <div className="product-detail">
      <JsonLd
        data={[
          productJsonLd({
            name: product.name,
            description: seo.schemaDescription,
            slug: product.slug,
            imageUrl: product.imageUrl ?? gallery[0] ?? null,
            galleryUrls: gallery,
            price: basePrice,
            category: product.category,
            aggregateRating:
              ratingCount > 0 && ratingValue != null
                ? { ratingValue, reviewCount: ratingCount }
                : null,
          }),
          breadcrumbJsonLd(crumbs),
        ]}
      />
      <TrackProductView
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl ?? gallery[0] ?? null}
        basePrice={basePrice}
      />
      <MetaViewContent
        contentId={product.slug}
        contentName={product.name}
        value={basePrice}
        enabled={Boolean(marketing.metaPixelId)}
        productUrl={productUrl}
      />

      <div className="container">
        <nav className="product-breadcrumb" aria-label="Навигация">
          <Link href="/">Начало</Link>
          <span aria-hidden>/</span>
          <Link href="/katalog">Каталог</Link>
          {seo.categoryLabel && seo.categoryHref ? (
            <>
              <span aria-hidden>/</span>
              <Link href={seo.categoryHref}>{seo.categoryLabel}</Link>
            </>
          ) : null}
          <span aria-hidden>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <div className="product-detail-main">
            <ProductGallery images={gallery} alt={product.name} />

            <header className="product-detail-header">
              <h1 className="page-title">{product.name}</h1>
              <div className="product-detail-meta">
                <p className="price product-detail-price">
                  от {formatBgn(basePrice)}
                </p>
                <FavoriteToggle
                  slug={product.slug}
                  name={product.name}
                  imageUrl={product.imageUrl ?? gallery[0] ?? null}
                  basePrice={basePrice}
                />
              </div>
              <div className="product-detail-desc">
                {seo.bodyParagraphs.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
                {KIT_RELATED[product.slug] ? (
                  <p>
                    <Link href={KIT_RELATED[product.slug]!.href}>
                      {KIT_RELATED[product.slug]!.label}
                    </Link>
                  </p>
                ) : null}
              </div>
              {marketing.facebookShareEnabled ? (
                <FacebookShareButton
                  url={productUrl}
                  title={product.name}
                  pageUrl={marketing.facebookPageUrl || null}
                />
              ) : null}
            </header>
          </div>

          <ProductConfigurator
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            basePrice={basePrice}
            gaMeasurementId={marketing.gaMeasurementId || null}
            engravingPlaceholder={
              KIT_ENGRAVING_HINTS[product.slug] ??
              "Име, инициали, кратко послание…"
            }
            options={product.options.map((o) => ({
              id: o.id,
              label: o.label,
              sizeLabel: o.sizeLabel,
              thicknessMm: o.thicknessMm,
              laserType: o.laserType,
              priceModifier: Number(o.priceModifier),
              material: o.material,
              finish: o.finish,
              doubleSided: Boolean(o.doubleSided),
              materialLabel: materialLabel[o.material] ?? o.material,
              finishLabel: finishLabel[o.finish] ?? o.finish,
            }))}
          />
        </div>

        {related.length > 0 ? (
          <section className="section" aria-labelledby="related-heading">
            <h2 id="related-heading" className="catalog-section-title">
              Подобни модели
            </h2>
            <p className="section-lead">
              Още от същата колекция — с опция за гравиране на име или послание.
            </p>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    basePrice: Number(p.basePrice),
                    imageUrl: p.imageUrl,
                  }}
                />
              ))}
            </div>
            {seo.categoryHref ? (
              <p style={{ marginTop: "1rem" }}>
                <Link href={seo.categoryHref} className="btn btn-ghost">
                  Всички в „{seo.categoryLabel}“
                </Link>
              </p>
            ) : null}
          </section>
        ) : null}

        <RecentlyViewed excludeSlug={product.slug} />
      </div>
    </div>
  );
}
