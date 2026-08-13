import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Невалиден имейл" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const filtered = (orders as Array<Record<string, unknown>>)
    .filter(
      (o) =>
        String(o.customerEmail).toLowerCase() ===
        parsed.data.email.toLowerCase(),
    )
    .slice(0, 20)
    .map((o) => ({
      id: o.id,
      publicToken: o.publicToken,
      status: o.status,
      paymentMethod: o.paymentMethod,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
    }));

  return NextResponse.json({ orders: filtered });
}
