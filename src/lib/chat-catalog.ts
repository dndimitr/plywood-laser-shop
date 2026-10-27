import { cartTotals, getCart } from "@/lib/cart";
import { catalogProductWhere } from "@/lib/catalog-where";
import { prisma } from "@/lib/db";
import { CATEGORIES, type CategoryId } from "@/lib/shop-config";

const CATEGORY_ALIASES: Record<string, CategoryId> = {
  // Latin + Bulgarian labels / synonyms
  svatba: "wedding",
  сватба: "wedding",
  wedding: "wedding",
  "rozhden den": "birthday",
  "рожден ден": "birthday",
  рожден: "birthday",
  rozhden: "birthday",
  birthday: "birthday",
  novorodeno: "newborn",
  новородено: "newborn",
  newborn: "newborn",
  bebe: "newborn",
  бебе: "newborn",
  krashtene: "baptism",
  кръщене: "baptism",
  baptism: "baptism",
  godishnina: "anniversary",
  годишнина: "anniversary",
  anniversary: "anniversary",
  valentin: "valentines",
  валентин: "valentines",
  "sveti valentin": "valentines",
  "свети валентин": "valentines",
  koleda: "christmas",
  коледа: "christmas",
  christmas: "christmas",
  helouin: "halloween",
  хелоуин: "halloween",
  halloween: "halloween",
  uchilishte: "school",
  училище: "school",
  school: "school",
  uchitel: "school",
  учител: "school",
  "nova godina": "newyear",
  "нова година": "newyear",
  newyear: "newyear",
  "baba marta": "spring",
  "баба марта": "spring",
  "8 mart": "spring",
  "8 март": "spring",
  spring: "spring",
  podarak: "gifts",
  подарък: "gifts",
  gifts: "gifts",
  dekor: "decor",
  декор: "decor",
  decor: "decor",
  montessori: "nursery",
  монтесори: "nursery",
  detska: "nursery",
  детска: "nursery",
  nursery: "nursery",
  tabela: "signs",
  табела: "signs",
  signs: "signs",
  avto: "auto",
  авто: "auto",
  auto: "auto",
  klyuchodarzhatel: "keychains",
  ключодържател: "keychains",
  keychains: "keychains",
};

function resolveCategory(raw?: string | null): CategoryId | undefined {
  if (!raw?.trim()) return undefined;
  const key = raw.trim().toLowerCase();
  if (CATEGORIES.some((c) => c.id === key)) return key as CategoryId;
  const byLabel = CATEGORIES.find(
    (c) =>
      c.label.toLowerCase() === key || c.labelEn.toLowerCase() === key,
  );
  if (byLabel) return byLabel.id;
  return CATEGORY_ALIASES[key];
}

function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export async function searchCatalogProducts(opts: {
  query: string;
  category?: string;
  limit?: number;
}) {
  const limit = Math.min(Math.max(opts.limit ?? 6, 1), 12);
  const q = opts.query.trim();
  const guessedFromQuery = q
    ? resolveCategory(
        Object.keys(CATEGORY_ALIASES)
          .sort((a, b) => b.length - a.length)
          .find((a) => q.toLowerCase().includes(a)),
      )
    : undefined;
  const category = resolveCategory(opts.category) ?? guessedFromQuery;

  // Prefer category landing when the query is clearly an occasion word;
  // otherwise combine category + free-text contains.
  const textLooksLikeOccasion =
    Boolean(guessedFromQuery) &&
    q.length <= 40 &&
    !/\d/.test(q) &&
    q.split(/\s+/).length <= 6;

  const products = await prisma.product.findMany({
    where: {
      ...catalogProductWhere,
      ...(category ? { category } : {}),
      ...(q && !textLooksLikeOccasion
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      options: { orderBy: { priceModifier: "asc" }, take: 4 },
    },
    orderBy: { name: "asc" },
    take: limit,
  });

  if (products.length === 0 && !category && q) {
    const guessed = resolveCategory(q);
    if (guessed) {
      return searchCatalogProducts({ query: "", category: guessed, limit });
    }
  }

  return products.map((p) => {
    const defaultOption = p.options[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      categoryLabel: categoryLabel(p.category),
      basePrice: Number(p.basePrice),
      href: `/products/${p.slug}`,
      imageUrl: p.imageUrl,
      shortDescription: p.description.slice(0, 160),
      defaultOptionId: defaultOption?.id ?? null,
      defaultOptionLabel: defaultOption?.label ?? null,
      options: p.options.map((o) => ({
        id: o.id,
        label: o.label,
        sizeLabel: o.sizeLabel,
        price:
          Math.round(
            (Number(p.basePrice) + Number(o.priceModifier)) * 100,
          ) / 100,
      })),
    };
  });
}

export async function getCatalogProduct(slugOrId: string) {
  const key = slugOrId.trim();
  const product =
    (await prisma.product.findFirst({
      where: { ...catalogProductWhere, slug: key },
      include: { options: { orderBy: { priceModifier: "asc" } } },
    })) ??
    (await prisma.product.findFirst({
      where: { ...catalogProductWhere, id: key },
      include: { options: { orderBy: { priceModifier: "asc" } } },
    }));
  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    categoryLabel: categoryLabel(product.category),
    basePrice: Number(product.basePrice),
    href: `/products/${product.slug}`,
    imageUrl: product.imageUrl,
    description: product.description.slice(0, 400),
    options: product.options.map((o) => ({
      id: o.id,
      label: o.label,
      sizeLabel: o.sizeLabel,
      thicknessMm: o.thicknessMm,
      price:
        Math.round(
          (Number(product.basePrice) + Number(o.priceModifier)) * 100,
        ) / 100,
    })),
  };
}

export async function getCartSummaryForChat() {
  const cart = await getCart();
  const { subtotal, itemCount } = cartTotals(cart);
  return {
    itemCount,
    subtotal,
    currency: "EUR",
    checkoutUrl: "/checkout",
    items: cart.items.map((i) => ({
      id: i.id,
      title: i.title,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: Math.round(i.unitPrice * i.quantity * 100) / 100,
      engravingText: i.personalization.engravingText ?? "",
      optionLabel: i.personalization.optionLabel ?? "",
      href: i.productSlug ? `/products/${i.productSlug}` : null,
    })),
  };
}
