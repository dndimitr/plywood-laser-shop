import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FacebookShareButton } from "@/components/FacebookShareButton";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { JsonLd } from "@/components/JsonLd";
import { MetaViewContent } from "@/components/MetaViewContent";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import {
  RecentlyViewed,
  TrackProductView,
} from "@/components/RecentlyViewed";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import { finishLabel, materialLabel } from "@/lib/labels";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  productJsonLd,
  truncateMeta,
} from "@/lib/seo";
import { getMarketingSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return buildPageMetadata({
      title: "Продуктът не е намерен",
      path: `/products/${slug}`,
      noIndex: true,
    });
  }
  const description = truncateMeta(product.description);
  return {
    ...buildPageMetadata({
      title: product.name,
      description,
      path: `/products/${product.slug}`,
      image: product.imageUrl,
      type: "website",
    }),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { options: { orderBy: { priceModifier: "asc" } } },
  });

  if (!product) notFound();

  const gallery: string[] =
    (product.galleryUrls as string[] | undefined)?.length
      ? (product.galleryUrls as string[])
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const basePrice = Number(product.basePrice);
  const marketing = getMarketingSettings();
  const productUrl = absoluteUrl(`/products/${product.slug}`);

  return (
    <div className="product-detail">
      <JsonLd
        data={[
          productJsonLd({
            name: product.name,
            description: product.description,
            slug: product.slug,
            imageUrl: product.imageUrl ?? gallery[0] ?? null,
            price: basePrice,
            category: product.category,
          }),
          breadcrumbJsonLd([
            { name: "Начало", path: "/" },
            { name: "Каталог", path: "/#katalog" },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
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
      />

      <div className="container">
        <nav className="product-breadcrumb" aria-label="Навигация">
          <Link href="/#katalog">Каталог</Link>
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
              <p className="product-detail-desc">{product.description}</p>
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

        <RecentlyViewed excludeSlug={product.slug} />
      </div>
    </div>
  );
}
