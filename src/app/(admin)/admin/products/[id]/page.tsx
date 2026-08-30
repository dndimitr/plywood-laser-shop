import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { absoluteUrl, facebookShareUrl } from "@/lib/seo";
import { getMarketingSettings } from "@/lib/shop-settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!product) notFound();

  const galleryUrls = Array.isArray(product.galleryUrls)
    ? (product.galleryUrls as string[])
    : [];

  const marketing = getMarketingSettings();
  const storeUrl = absoluteUrl(`/products/${product.slug}`);
  const shareHref = facebookShareUrl(storeUrl);

  return (
    <div className="admin-panel">
      <h1>Редакция: {product.name}</h1>
      <p className="muted" style={{ marginBottom: "1rem" }}>
        <Link href={storeUrl} target="_blank">
          Виж в магазина
        </Link>
        {" · "}
        <a href={shareHref} target="_blank" rel="noopener noreferrer">
          Сподели във Facebook като пост
        </a>
        {marketing.facebookPageUrl ? (
          <>
            {" · "}
            <a
              href={marketing.facebookPageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook страница
            </a>
          </>
        ) : null}
      </p>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortTitle: product.shortTitle ?? "",
          description: product.description,
          category: product.category ?? "other",
          basePrice: Number(product.basePrice),
          imageUrl: product.imageUrl,
          galleryUrls,
          active: product.active,
          availability: product.availability,
          options: product.options.map((o) => ({
            label: o.label,
            sizeLabel: o.sizeLabel,
            thicknessMm: o.thicknessMm,
            laserType: o.laserType,
            material: o.material ?? "birch-plywood",
            finish: o.finish ?? "raw",
            doubleSided: Boolean(o.doubleSided),
            priceModifier: Number(o.priceModifier),
          })),
        }}
      />
    </div>
  );
}
