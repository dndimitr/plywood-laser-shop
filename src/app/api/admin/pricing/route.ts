import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rules = await prisma.pricingRule.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(rules);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Липсва id" }, { status: 400 });
  }

  const rule = await prisma.pricingRule.update({
    where: { id: body.id },
    data: {
      pricePerCm2: Number(body.pricePerCm2),
      minPrice: Number(body.minPrice),
      thicknessCoefficients: body.thicknessCoefficients,
      complexityMultipliers: body.complexityMultipliers,
      active: Boolean(body.active),
    },
  });

  return NextResponse.json(rule);
}
