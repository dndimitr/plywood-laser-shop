import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { createEcontLabel, EcontApiError, econtTrackingUrl } from "@/lib/econt";
import { prisma } from "@/lib/db";
import { logOrderEvent } from "@/lib/order-events";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { ids?: string[] };
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length) {
    return NextResponse.json({ error: "Изберете поръчки" }, { status: 400 });
  }

  const results: Array<{ id: string; ok: boolean; error?: string; shipmentNumber?: string }> =
    [];

  for (const id of ids) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order || order.courier !== "ECONT") {
      results.push({ id, ok: false, error: "Не е поръчка с Еконт" });
      continue;
    }
    if (order.econtShipmentNumber) {
      results.push({
        id,
        ok: true,
        shipmentNumber: order.econtShipmentNumber,
      });
      continue;
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
      await prisma.order.update({
        where: { id },
        data: {
          econtShipmentNumber: created.shipmentNumber,
          econtPdfUrl: created.pdfURL,
          trackingUrl: econtTrackingUrl(created.shipmentNumber),
        },
      });
      await logOrderEvent({
        orderId: id,
        type: "waybill",
        message: `Товарителница ${created.shipmentNumber}`,
        actorEmail: session.user.email,
      });
      results.push({ id, ok: true, shipmentNumber: created.shipmentNumber });
    } catch (err) {
      results.push({
        id,
        ok: false,
        error:
          err instanceof EcontApiError
            ? err.message
            : "Неуспешно създаване на товарителница",
      });
    }
  }

  return NextResponse.json({ results });
}
