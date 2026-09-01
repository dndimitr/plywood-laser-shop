import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateCustomPrice,
  type ComplexityMultipliers,
  type ThicknessCoefficients,
} from "@/lib/pricing";
import { customQuoteSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = customQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const rule = await prisma.pricingRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  if (!rule) {
    return NextResponse.json(
      { error: "Няма активни ценови правила" },
      { status: 500 },
    );
  }

  const price = calculateCustomPrice({
    widthCm: parsed.data.widthCm,
    heightCm: parsed.data.heightCm,
    thicknessMm: parsed.data.thicknessMm,
    complexity: parsed.data.complexity,
    pricePerCm2: Number(rule.pricePerCm2),
    thicknessCoefficients: rule.thicknessCoefficients as ThicknessCoefficients,
    complexityMultipliers: rule.complexityMultipliers as ComplexityMultipliers,
    minPrice: Number(rule.minPrice),
    quantity: parsed.data.quantity,
    quantityDiscounts:
      (rule.quantityDiscounts as { minQty: number; percentOff: number }[]) ?? [],
    rush: parsed.data.rush,
    rushMultiplier: Number(rule.rushMultiplier ?? 1.5),
    doubleSided: parsed.data.doubleSided,
  });

  return NextResponse.json({ price, ruleName: rule.name });
}
