import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { options: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const slugBase = `${product.slug}-kopie`;
  let slug = slugBase;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${n}`;
    n += 1;
  }
  const copy = await prisma.product.create({
    data: {
      name: `${product.name} (копие)`,
      slug,
      shortTitle: product.shortTitle,
      description: product.description,
      category: product.category,
      basePrice: product.basePrice,
      imageUrl: product.imageUrl,
      galleryUrls: product.galleryUrls ?? [],
      active: false,
      availability: product.availability,
      options: {
        create: product.options.map((option) => ({
          label: option.label,
          sizeLabel: option.sizeLabel,
          thicknessMm: option.thicknessMm,
          laserType: option.laserType,
          material: option.material,
          finish: option.finish,
          doubleSided: option.doubleSided,
          priceModifier: option.priceModifier,
        })),
      },
    },
  });
  return NextResponse.json(copy);
}
