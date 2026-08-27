import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { sendCustomerMessage } from "@/lib/customer-emails";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  const fromVercel = request.headers.get("x-vercel-cron") === "1";
  const ok =
    (secret && authHeader === `Bearer ${secret}`) ||
    (fromVercel && Boolean(secret));
  if (!ok) {
    const session = await requireAdmin();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: {
      paymentMethod: "BANK_TRANSFER",
      paymentStatus: { in: ["PENDING", "AWAITING_TRANSFER"] },
      status: { not: "CANCELLED" },
      reminderSentAt: null,
      createdAt: { lte: cutoff },
    },
    take: 30,
  });

  const sent: string[] = [];
  const failed: string[] = [];
  for (const order of orders) {
    try {
      const result = await sendCustomerMessage({
        orderId: order.id,
        key: "payment_reminder",
      });
      if (!result.skipped) {
        await prisma.order.update({
          where: { id: order.id },
          data: { reminderSentAt: new Date() },
        });
        sent.push(order.id);
      }
    } catch {
      failed.push(order.id);
    }
  }

  return NextResponse.json({ checked: orders.length, sent, failed });
}
