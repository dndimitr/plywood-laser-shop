import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { ProductGallery } from "@/components/ProductGallery";
import {
  RecentlyViewed,
  TrackProductView,
} from "@/components/RecentlyViewed";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import { finishLabel, materialLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Продукт" };
  return {
    title: product.name,
    description: product.description,
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

  return (
    <div className="product-detail">
      <TrackProductView
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl ?? gallery[0] ?? null}
        basePrice={basePrice}
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
            </header>
          </div>

          <ProductConfigurator
            productId={product.id}
            productName={product.name}
            basePrice={basePrice}
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
