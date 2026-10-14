import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { uploadedDesign: true, product: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const result = await sendOrderEmails({
      id: order.id,
      publicToken: order.publicToken,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      totalAmount: Number(order.totalAmount),
      shippingFee: Number(order.shippingFee),
      paymentMethod: order.paymentMethod,
      courier: order.courier,
      rush: order.rush,
      items: order.items.map((item) => {
        const design = item.uploadedDesign;
        const designPreview =
          design?.url &&
          (design.mimeType?.startsWith("image/") ||
            /\.(png|jpe?g|gif|webp|svg)$/i.test(design.originalName ?? ""))
            ? design.url
            : null;
        return {
          title: item.title,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          imageUrl: item.product?.imageUrl ?? designPreview,
          productUrl: item.product?.slug
            ? `/products/${item.product.slug}`
            : null,
          fileName: design?.originalName ?? null,
          fileUrl: design?.url ?? null,
        };
      }),
    });

    if (result.skipped) {
      return NextResponse.json(
        {
          error:
            "Имейлите не са конфигурирани. Добавете RESEND_API_KEY в средата.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[email] resend failed", err);
    return NextResponse.json(
      { error: "Неуспешно изпращане на имейл" },
      { status: 500 },
    );
  }
}
