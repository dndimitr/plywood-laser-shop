import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import {
  CART_COOKIE,
  cartCookieOptions,
  getCart,
  serializeCart,
  type Cart,
  type CartItem,
} from "@/lib/cart";
import { catalogProductWhere } from "@/lib/catalog-where";
import { prisma } from "@/lib/db";
import {
  calculateTemplatePrice,
  unitPriceFromTotal,
} from "@/lib/pricing";

export type AddTemplateInput = {
  productId: string;
  optionId: string;
  engravingText?: string;
  quantity: number;
  rush?: boolean;
};

export type AddTemplateResult =
  | { ok: true; cart: Cart; item: CartItem }
  | { ok: false; error: string; status: number };

/** Build a TEMPLATE cart line and persist the cart cookie (shared by cart API + chat). */
export async function addTemplateToCart(
  input: AddTemplateInput,
): Promise<AddTemplateResult> {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, ...catalogProductWhere },
    include: { options: true },
  });
  if (!product) {
    return { ok: false, error: "Продуктът не е намерен", status: 404 };
  }

  const option = product.options.find((o) => o.id === input.optionId);
  if (!option) {
    return { ok: false, error: "Опцията не е намерена", status: 404 };
  }

  const rule = await prisma.pricingRule.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  const quantityDiscounts =
    (rule?.quantityDiscounts as
      | { minQty: number; percentOff: number }[]
      | undefined) ?? [];
  const lineTotal = calculateTemplatePrice(
    Number(product.basePrice),
    Number(option.priceModifier),
    input.quantity,
    {
      quantityDiscounts,
      rush: input.rush,
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
    quantity: input.quantity,
    unitPrice: unitPriceFromTotal(lineTotal, input.quantity),
    imageUrl: product.imageUrl,
    personalization: {
      engravingText: input.engravingText ?? "",
      sizeLabel: option.sizeLabel,
      thicknessMm: option.thicknessMm,
      laserType: option.laserType,
      optionId: option.id,
      optionLabel: option.label,
      material: option.material,
      finish: option.finish,
      doubleSided: option.doubleSided,
      rush: input.rush,
    },
  };

  const cart = await getCart();
  cart.items.push(item);

  const jar = await cookies();
  jar.set(CART_COOKIE, serializeCart(cart), cartCookieOptions());

  return { ok: true, cart, item };
}
