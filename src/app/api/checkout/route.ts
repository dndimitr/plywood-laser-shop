import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  CART_COOKIE,
  emptyCart,
  getCart,
  serializeCart,
} from "@/lib/cart";
import { prisma } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";
import type { Prisma } from "@/generated/prisma/client";
import {
  calculateCustomPrice,
  calculateTemplatePrice,
  roundMoney,
  unitPriceFromTotal,
  type ComplexityMultipliers,
  type ThicknessCoefficients,
} from "@/lib/pricing";
import { shippingFeeFor } from "@/lib/shop-config";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cart = await getCart();
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Количката е празна" }, { status: 400 });
  }

  const rule = await prisma.pricingRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  const quantityDiscounts =
    (rule?.quantityDiscounts as { minQty: number; percentOff: number }[] | undefined) ??
    [];
  const rushMultiplier = Number(rule?.rushMultiplier ?? 1.5);
  const minOrderAmount = Number(rule?.minOrderAmount ?? 0);

  const pricedItems: Array<{
    type: "TEMPLATE" | "CUSTOM";
    productId: string | null;
    uploadedDesignId: string | null;
    title: string;
    quantity: number;
    unitPrice: number;
    personalization: Record<string, unknown>;
  }> = [];

  let hasCustom = false;

  for (const item of cart.items) {
    if (item.type === "TEMPLATE") {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, active: true },
        include: { options: true },
      });
      if (!product) {
        return NextResponse.json(
          { error: `Продуктът „${item.title}“ вече не е наличен` },
          { status: 400 },
        );
      }
      const option = product.options.find(
        (o) => o.id === item.personalization.optionId,
      );
      if (!option) {
        return NextResponse.json(
          { error: `Опцията за „${item.title}“ е невалидна` },
          { status: 400 },
        );
      }
      const lineTotal = calculateTemplatePrice(
        Number(product.basePrice),
        Number(option.priceModifier),
        item.quantity,
        {
          quantityDiscounts,
          rush: parsed.data.rush,
          rushMultiplier,
          doubleSided: Boolean(
            item.personalization.doubleSided ?? option.doubleSided,
          ),
        },
      );
      pricedItems.push({
        type: "TEMPLATE",
        productId: product.id,
        uploadedDesignId: null,
        title: item.title,
        quantity: item.quantity,
        unitPrice: unitPriceFromTotal(lineTotal, item.quantity),
        personalization: {
          ...item.personalization,
          material: option.material,
          finish: option.finish,
          doubleSided: option.doubleSided,
          rush: parsed.data.rush,
        },
      });
    } else {
      hasCustom = true;
      if (!rule) {
        return NextResponse.json(
          { error: "Няма активни ценови правила" },
          { status: 500 },
        );
      }
      const widthCm = Number(item.personalization.widthCm);
      const heightCm = Number(item.personalization.heightCm);
      const thicknessMm = Number(item.personalization.thicknessMm);
      const complexity = String(item.personalization.complexity ?? "medium");
      const lineTotal = calculateCustomPrice({
        widthCm,
        heightCm,
        thicknessMm,
        complexity,
        pricePerCm2: Number(rule.pricePerCm2),
        thicknessCoefficients: rule.thicknessCoefficients as ThicknessCoefficients,
        complexityMultipliers: rule.complexityMultipliers as ComplexityMultipliers,
        minPrice: Number(rule.minPrice),
        quantity: item.quantity,
        quantityDiscounts,
        rush: parsed.data.rush,
        rushMultiplier,
        doubleSided: Boolean(item.personalization.doubleSided),
      });
      pricedItems.push({
        type: "CUSTOM",
        productId: null,
        uploadedDesignId: item.uploadedDesignId ?? null,
        title: item.title,
        quantity: item.quantity,
        unitPrice: unitPriceFromTotal(lineTotal, item.quantity),
        personalization: {
          ...item.personalization,
          rush: parsed.data.rush,
        },
      });
    }
  }

  const subtotalAmount = roundMoney(
    pricedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
  );

  if (subtotalAmount < minOrderAmount) {
    return NextResponse.json(
      {
        error: `Минималната стойност на поръчката е ${minOrderAmount.toFixed(2)} €.`,
      },
      { status: 400 },
    );
  }

  const shippingFee = shippingFeeFor(parsed.data.courier, subtotalAmount);
  const totalAmount = roundMoney(subtotalAmount + shippingFee);
  const publicToken = randomUUID().replace(/-/g, "");

  const paymentStatus =
    parsed.data.paymentMethod === "BANK_TRANSFER"
      ? "AWAITING_TRANSFER"
      : parsed.data.paymentMethod === "CARD"
        ? "PENDING"
        : "PENDING";

  const office = parsed.data.courierOfficeCode?.trim();
  const addressBase =
    parsed.data.courier === "PICKUP"
      ? parsed.data.shippingAddress?.trim() || "Лично получаване"
      : parsed.data.shippingAddress.trim();
  const shippingAddress = office
    ? `${addressBase}\nОфис код: ${office}`
    : addressBase;

  const order = await prisma.order.create({
    data: {
      publicToken,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      companyName: parsed.data.companyName || null,
      vatNumber: parsed.data.vatNumber || null,
      needInvoice: parsed.data.needInvoice,
      shippingAddress,
      shippingNote: parsed.data.shippingNote || null,
      courier: parsed.data.courier,
      shippingFee,
      rush: parsed.data.rush,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus,
      subtotalAmount,
      totalAmount,
      status: hasCustom ? "AWAITING_DESIGN" : "NEW",
      designReview: hasCustom ? "PENDING" : "NOT_REQUIRED",
      locale: parsed.data.locale,
      adminNotes: null,
      customerId: null,
      items: {
        create: pricedItems.map((item) => ({
          ...item,
          personalization: item.personalization as Prisma.InputJsonValue,
        })),
      },
    },
  });

  try {
    await sendOrderEmails({
      id: order.id,
      publicToken,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      totalAmount,
      paymentMethod: parsed.data.paymentMethod,
      rush: parsed.data.rush,
    });
  } catch (err) {
    console.error("[email] failed", err);
  }

  const jar = await cookies();
  jar.set(CART_COOKIE, serializeCart(emptyCart()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({
    orderId: order.id,
    publicToken,
    totalAmount,
    paymentMethod: parsed.data.paymentMethod,
  });
}
