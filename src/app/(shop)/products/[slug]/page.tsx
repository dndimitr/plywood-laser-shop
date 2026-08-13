import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductConfigurator } from "@/components/ProductConfigurator";
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

  return (
    <div className="container product-detail">
      <TrackProductView slug={product.slug} name={product.name} />
      <div className="product-detail-grid">
        <div>
          <div className="detail-media">
            {gallery[0] ? (
              <Image
                src={gallery[0]}
                alt={product.name}
                fill
                sizes="(max-width:860px) 100vw, 55vw"
                className="object-cover"
                style={{ objectFit: "cover" }}
                unoptimized={gallery[0].endsWith(".svg")}
              />
            ) : null}
          </div>
          {gallery.length > 1 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {gallery.slice(1, 4).map((url) => (
                <div
                  key={url}
                  style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    border: "1px solid var(--line)",
                  }}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="120px"
                    style={{ objectFit: "cover" }}
                    unoptimized={url.endsWith(".svg")}
                  />
                </div>
              ))}
            </div>
          ) : null}
          <h1 className="page-title" style={{ marginTop: "1.25rem" }}>
            {product.name}
          </h1>
          <p className="muted">{product.description}</p>
          <p className="price">от {formatBgn(Number(product.basePrice))}</p>
          <RecentlyViewed />
        </div>
        <ProductConfigurator
          productId={product.id}
          productName={product.name}
          basePrice={Number(product.basePrice)}
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
    </div>
  );
}
