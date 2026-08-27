import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-session";
import { prisma } from "@/lib/db";
import { customerProfileSchema } from "@/lib/validators";

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    const profiles = await prisma.customerProfile.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ profiles, orders: [] });
  }

  const [profiles, orders] = await Promise.all([
    prisma.customerProfile.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { customerEmail: { contains: q, mode: "insensitive" } },
          { customerPhone: { contains: q } },
          { customerName: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  return NextResponse.json({ profiles, orders });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = customerProfileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Невалидни данни" }, { status: 400 });
  }
  const profile = await prisma.customerProfile.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {
      phone: parsed.data.phone || null,
      name: parsed.data.name || null,
      flag: parsed.data.flag,
      note: parsed.data.note || null,
    },
    create: {
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      name: parsed.data.name || null,
      flag: parsed.data.flag,
      note: parsed.data.note || null,
    },
  });
  return NextResponse.json(profile);
}
