import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productFormSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const options = parsed.data.options ?? [];
  const product = await prisma.product.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      shortTitle: parsed.data.shortTitle?.trim() || null,
      description: parsed.data.description,
      category: parsed.data.category,
      basePrice: parsed.data.basePrice,
      imageUrl: parsed.data.imageUrl || null,
      galleryUrls: parsed.data.galleryUrls ?? [],
      active: parsed.data.active,
      availability: parsed.data.availability,
      options: {
        deleteMany: {},
        create: options.map((o) => ({
          label: o.label,
          sizeLabel: o.sizeLabel,
          thicknessMm: o.thicknessMm,
          laserType: o.laserType,
          material: o.material,
          finish: o.finish,
          doubleSided: o.doubleSided,
          priceModifier: o.priceModifier,
        })),
      },
    },
    include: { options: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
