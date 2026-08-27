import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEcontLabel, EcontApiError, econtTrackingUrl } from "@/lib/econt";
import { logOrderEvent } from "@/lib/order-events";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (order.courier !== "ECONT") {
    return NextResponse.json(
      { error: "Товарителница на Еконт се създава само за поръчки с куриер Еконт." },
      { status: 400 },
    );
  }

  if (order.econtShipmentNumber) {
    return NextResponse.json({
      shipmentNumber: order.econtShipmentNumber,
      pdfUrl: order.econtPdfUrl,
      alreadyCreated: true,
    });
  }

  try {
    const created = await createEcontLabel({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      shippingDetails: order.shippingDetails,
      items: order.items.map((item) => ({
        title: item.title,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        econtShipmentNumber: created.shipmentNumber,
        econtPdfUrl: created.pdfURL,
        trackingUrl: econtTrackingUrl(created.shipmentNumber),
      },
      });

    await logOrderEvent({
      orderId: order.id,
      type: "waybill",
      message: `Товарителница ${created.shipmentNumber}`,
      actorEmail: session.user.email,
    });

    return NextResponse.json({
      shipmentNumber: updated.econtShipmentNumber,
      pdfUrl: updated.econtPdfUrl,
      alreadyCreated: false,
    });
  } catch (err) {
    const message =
      err instanceof EcontApiError
        ? err.message
        : "Неуспешно създаване на товарителница";
    const status = err instanceof EcontApiError ? err.status : 500;
    console.error("[econt] create label", err);
    return NextResponse.json({ error: message }, { status });
  }
}
