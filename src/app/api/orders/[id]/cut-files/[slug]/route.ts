import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const CUT_DIR = path.join(process.cwd(), "content", "cut-files");

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

/**
 * Сваляне на готов LightBurn SVG само с валиден publicToken
 * и ако продуктът е в поръчката.
 */
export async function GET(request: Request, { params }: Props) {
  const { id, slug } = await params;
  const token = new URL(request.url).searchParams.get("t");

  if (!token) {
    return NextResponse.json({ error: "Липсва токен" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.publicToken !== token) {
    return NextResponse.json({ error: "Няма достъп" }, { status: 403 });
  }

  const items = (
    order as {
      items?: Array<{
        productId?: string | null;
        product?: { slug?: string; cutFileUrl?: string | null } | null;
      }>;
    }
  ).items;

  if (!items?.length) {
    return NextResponse.json({ error: "Поръчката няма артикули" }, { status: 404 });
  }

  const match = items.find(
    (item) =>
      item.product?.slug === slug &&
      typeof item.product.cutFileUrl === "string" &&
      item.product.cutFileUrl.length > 0,
  );

  if (!match?.product?.cutFileUrl) {
    return NextResponse.json(
      { error: "Няма файл за изрязване за този продукт в поръчката" },
      { status: 404 },
    );
  }

  const fileName = path.basename(match.product.cutFileUrl);
  if (
    fileName !== match.product.cutFileUrl ||
    fileName.includes("..") ||
    !fileName.endsWith(".svg")
  ) {
    return NextResponse.json({ error: "Невалиден файл" }, { status: 400 });
  }

  const absolute = path.join(CUT_DIR, fileName);

  try {
    const bytes = await readFile(absolute);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Файлът липсва" }, { status: 404 });
  }
}
