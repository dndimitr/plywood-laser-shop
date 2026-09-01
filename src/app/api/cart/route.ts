import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  CART_COOKIE,
  cartCookieOptions,
  emptyCart,
  getCart,
  serializeCart,
  type CartItem,
} from "@/lib/cart";
import { prisma } from "@/lib/db";
import { catalogProductWhere } from "@/lib/catalog-where";
import {
  calculateCustomPrice,
  calculateTemplatePrice,
  unitPriceFromTotal,
  type ComplexityMultipliers,
  type ThicknessCoefficients,
} from "@/lib/pricing";
import { addTemplateCartSchema, customQuoteSchema } from "@/lib/validators";

export async function GET() {
  const cart = await getCart();
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const body = await request.json();
  const cart = await getCart();

  if (body.action === "add_template") {
    const parsed = addTemplateCartSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: parsed.data.productId, ...catalogProductWhere },
      include: { options: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Продуктът не е намерен" }, { status: 404 });
    }

    const option = product.options.find((o) => o.id === parsed.data.optionId);
    if (!option) {
      return NextResponse.json({ error: "Опцията не е намерена" }, { status: 404 });
    }

    const rule = await prisma.pricingRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    const quantityDiscounts =
      (rule?.quantityDiscounts as { minQty: number; percentOff: number }[] | undefined) ??
      [];
    const lineTotal = calculateTemplatePrice(
      Number(product.basePrice),
      Number(option.priceModifier),
      parsed.data.quantity,
      {
        quantityDiscounts,
        rush: parsed.data.rush,
        rushMultiplier: Number(rule?.rushMultiplier ?? 1.5),
        doubleSided: Boolean(option.doubleSided),
      },
    );

    const item: CartItem = {
      id: randomUUID(),
      type: "TEMPLATE",
      productId: product.id,
      productSlug: product.slug,
      title: product.name,
      quantity: parsed.data.quantity,
      unitPrice: unitPriceFromTotal(lineTotal, parsed.data.quantity),
      imageUrl: product.imageUrl,
      personalization: {
        engravingText: parsed.data.engravingText ?? "",
        sizeLabel: option.sizeLabel,
        thicknessMm: option.thicknessMm,
        laserType: option.laserType,
        optionId: option.id,
        optionLabel: option.label,
        material: option.material,
        finish: option.finish,
        doubleSided: option.doubleSided,
        rush: parsed.data.rush,
      },
    };

    cart.items.push(item);
  } else if (body.action === "add_custom") {
    const quote = customQuoteSchema.safeParse(body);
    if (!quote.success) {
      return NextResponse.json({ error: quote.error.flatten() }, { status: 400 });
    }
    if (typeof body.uploadedDesignId !== "string" || typeof body.title !== "string") {
      return NextResponse.json({ error: "Непълни данни за custom" }, { status: 400 });
    }

    const design = await prisma.uploadedDesign.findUnique({
      where: { id: body.uploadedDesignId },
    });
    if (!design) {
      return NextResponse.json({ error: "Файлът не е намерен" }, { status: 404 });
    }

    const rule = await prisma.pricingRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    if (!rule) {
      return NextResponse.json({ error: "Няма активни ценови правила" }, { status: 500 });
    }

    const quantity = quote.data.quantity;
    const lineTotal = calculateCustomPrice({
      widthCm: quote.data.widthCm,
      heightCm: quote.data.heightCm,
      thicknessMm: quote.data.thicknessMm,
      complexity: quote.data.complexity,
      pricePerCm2: Number(rule.pricePerCm2),
      thicknessCoefficients: rule.thicknessCoefficients as ThicknessCoefficients,
      complexityMultipliers: rule.complexityMultipliers as ComplexityMultipliers,
      minPrice: Number(rule.minPrice),
      quantity,
      quantityDiscounts:
        (rule.quantityDiscounts as { minQty: number; percentOff: number }[]) ?? [],
      rush: quote.data.rush,
      rushMultiplier: Number(rule.rushMultiplier ?? 1.5),
      doubleSided: quote.data.doubleSided,
    });

    const item: CartItem = {
      id: randomUUID(),
      type: "CUSTOM",
      uploadedDesignId: design.id,
      designUrl: design.url,
      title: body.title,
      quantity,
      unitPrice: unitPriceFromTotal(lineTotal, quantity),
      imageUrl: design.url,
      personalization: {
        widthCm: quote.data.widthCm,
        heightCm: quote.data.heightCm,
        thicknessMm: quote.data.thicknessMm,
        complexity: quote.data.complexity,
        notes: quote.data.notes,
        rush: quote.data.rush,
        doubleSided: quote.data.doubleSided,
      },
    };
    cart.items.push(item);
  } else if (body.action === "update_qty") {
    const item = cart.items.find((i) => i.id === body.id);
    if (!item) {
      return NextResponse.json({ error: "Артикулът липсва" }, { status: 404 });
    }
    item.quantity = Math.max(1, Math.min(50, Number(body.quantity) || 1));
  } else if (body.action === "remove") {
    cart.items = cart.items.filter((i) => i.id !== body.id);
  } else if (body.action === "clear") {
    cart.items = [];
  } else {
    return NextResponse.json({ error: "Неизвестна операция" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(CART_COOKIE, serializeCart(cart), cartCookieOptions());

  return NextResponse.json(cart);
}

export async function DELETE() {
  const jar = await cookies();
  jar.set(CART_COOKIE, serializeCart(emptyCart()), cartCookieOptions(0));
  return NextResponse.json(emptyCart());
}
