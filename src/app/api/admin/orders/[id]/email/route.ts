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
      items: { include: { uploadedDesign: true } },
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
      items: order.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        fileName: item.uploadedDesign?.originalName ?? null,
        fileUrl: item.uploadedDesign?.url ?? null,
      })),
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
