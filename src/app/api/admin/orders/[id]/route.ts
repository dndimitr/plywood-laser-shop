import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { logOrderEvent } from "@/lib/order-events";
import { roundMoney } from "@/lib/currency";
import { formatEcontShippingAddress } from "@/lib/shipping-details";
import { adminOrderUpdateSchema } from "@/lib/validators";
import {
  courierLabel,
  machineStatusLabel,
  orderStatusLabel,
  paymentStatusLabel,
  designReviewLabel,
} from "@/lib/labels";

type Params = { params: Promise<{ id: string }> };

function issueMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues: Array<{ message?: string }> }).issues)
  ) {
    return (
      (error as { issues: Array<{ message?: string }> }).issues[0]?.message ??
      "Невалидни данни"
    );
  }
  return "Невалидни данни";
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdmin();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = adminOrderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: issueMessage(parsed.error) }, { status: 400 });
  }

  const current = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!current) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  const actorEmail = session.user.email ?? null;
  const changes: string[] = [];

  if (data.items?.length) {
    const allowed = new Set(current.items.map((item) => item.id));
    for (const item of data.items) {
      if (!allowed.has(item.id)) {
        return NextResponse.json(
          { error: "Невалиден артикул към тази поръчка" },
          { status: 400 },
        );
      }
      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          ...(item.title ? { title: item.title } : {}),
          ...(item.quantity != null ? { quantity: item.quantity } : {}),
          ...(item.unitPrice != null ? { unitPrice: item.unitPrice } : {}),
          ...(item.sheetCount !== undefined ? { sheetCount: item.sheetCount } : {}),
        },
      });
    }
    changes.push("артикули");
  }

  const itemsAfter = data.items
    ? current.items.map((item) => {
        const patch = data.items?.find((row) => row.id === item.id);
        return {
          quantity: patch?.quantity ?? item.quantity,
          unitPrice: patch?.unitPrice ?? Number(item.unitPrice),
        };
      })
    : current.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      }));

  const shouldRetotal =
    data.items != null || data.shippingFee != null;
  const subtotal = shouldRetotal
    ? roundMoney(
        itemsAfter.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      )
    : Number(current.subtotalAmount);
  const shippingFee = data.shippingFee ?? Number(current.shippingFee);
  const total = shouldRetotal
    ? roundMoney(subtotal + shippingFee)
    : Number(current.totalAmount);

  let shippingAddress = data.shippingAddress ?? current.shippingAddress;
  if (data.shippingDetails) {
    shippingAddress = formatEcontShippingAddress(data.shippingDetails);
  }

  const addressChanged =
    (data.shippingAddress != null &&
      data.shippingAddress !== current.shippingAddress) ||
    data.shippingDetails !== undefined;
  if (addressChanged && current.econtShipmentNumber) {
    changes.push("адрес след издадена товарителница");
  }

  if (data.customerName && data.customerName !== current.customerName) {
    changes.push("име");
  }
  if (data.customerPhone && data.customerPhone !== current.customerPhone) {
    changes.push("телефон");
  }
  if (data.courier && data.courier !== current.courier) {
    changes.push(`куриер → ${courierLabel[data.courier]}`);
  }
  if (data.status && data.status !== current.status) {
    changes.push(`статус → ${orderStatusLabel[data.status]}`);
  }
  if (data.paymentStatus && data.paymentStatus !== current.paymentStatus) {
    changes.push(`плащане → ${paymentStatusLabel[data.paymentStatus]}`);
  }
  if (data.designReview && data.designReview !== current.designReview) {
    changes.push(`макет → ${designReviewLabel[data.designReview]}`);
  }
  if (data.machineStatus && data.machineStatus !== current.machineStatus) {
    changes.push(`машина → ${machineStatusLabel[data.machineStatus]}`);
  }
  if (data.shippingFee != null && data.shippingFee !== Number(current.shippingFee)) {
    changes.push("такса доставка");
  }

  let paidAt = current.paidAt;
  if (data.paidAt !== undefined) {
    paidAt = data.paidAt ? new Date(data.paidAt) : null;
  } else if (data.paymentStatus === "PAID" && !current.paidAt) {
    paidAt = new Date();
    changes.push("преводът е отбелязан");
  } else if (data.paymentStatus && data.paymentStatus !== "PAID") {
    paidAt = data.paymentStatus === "REFUNDED" ? current.paidAt : null;
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(data.customerName ? { customerName: data.customerName } : {}),
      ...(data.customerEmail ? { customerEmail: data.customerEmail } : {}),
      ...(data.customerPhone ? { customerPhone: data.customerPhone } : {}),
      ...(data.shippingAddress !== undefined || data.shippingDetails
        ? { shippingAddress }
        : {}),
      ...(data.shippingDetails !== undefined
        ? {
            shippingDetails:
              data.shippingDetails === null
                ? Prisma.JsonNull
                : data.shippingDetails,
          }
        : {}),
      ...(data.shippingNote !== undefined ? { shippingNote: data.shippingNote } : {}),
      ...(data.courier ? { courier: data.courier } : {}),
      ...(data.shippingFee != null ? { shippingFee } : {}),
      ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
      ...(data.paymentStatus ? { paymentStatus: data.paymentStatus } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.designReview ? { designReview: data.designReview } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
      ...(data.rush !== undefined ? { rush: data.rush } : {}),
      ...(data.needInvoice !== undefined ? { needInvoice: data.needInvoice } : {}),
      ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
      ...(data.vatNumber !== undefined ? { vatNumber: data.vatNumber } : {}),
      ...(data.machineStatus ? { machineStatus: data.machineStatus } : {}),
      ...(data.trackingUrl !== undefined ? { trackingUrl: data.trackingUrl } : {}),
      ...(data.speedyShipmentNumber !== undefined
        ? { speedyShipmentNumber: data.speedyShipmentNumber }
        : {}),
      ...(data.designReviewNote !== undefined
        ? { designReviewNote: data.designReviewNote }
        : {}),
      paidAt,
      ...(shouldRetotal ? { subtotalAmount: subtotal, totalAmount: total } : {}),
    },
    include: {
      items: { include: { uploadedDesign: true, adminDesign: true, product: true } },
      events: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  if (changes.length) {
    await logOrderEvent({
      orderId: id,
      type: "update",
      message: `Промяна: ${changes.join(", ")}`,
      actorEmail,
      payload: { fields: Object.keys(data) },
    });
  }

  return NextResponse.json(order);
}
