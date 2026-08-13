import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

  return (
    <div className="admin-panel">
      <h1>Редакция: {product.name}</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          basePrice: Number(product.basePrice),
          imageUrl: product.imageUrl,
          active: product.active,
          options: product.options.map((o) => ({
            label: o.label,
            sizeLabel: o.sizeLabel,
            thicknessMm: o.thicknessMm,
            laserType: o.laserType,
            priceModifier: Number(o.priceModifier),
          })),
        }}
      />
    </div>
  );
}
