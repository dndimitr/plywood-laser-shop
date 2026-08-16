import {
  categoryLandingById,
  categoryLandingPath,
} from "@/lib/category-landings";
import { occasionByCategoryId, occasionPath } from "@/lib/occasions";
import { categoryById, type CategoryId } from "@/lib/shop-config";
import { SITE_NAME, truncateMeta } from "@/lib/seo";

const CATEGORY_LONG_TAIL: Partial<Record<CategoryId, string>> = {
  baptism: "подарък за кръщене с име на бебе",
  newborn: "подарък за новородено с име",
  wedding: "персонализиран сватбен подарък",
  birthday: "подарък за рожден ден с име",
  anniversary: "подарък за годишнина с имена",
  valentines: "подарък за Свети Валентин с гравиране",
  christmas: "персонализиран коледен подарък",
  halloween: "хелоуин декорация с име",
  school: "подарък за първи учебен ден",
  newyear: "новогодишен подарък с гравиране",
  spring: "подарък за Баба Марта или 8 март",
  gifts: "персонализиран подарък с име",
  decor: "декор за дома с гравиране",
  panels: "стенен панел с имена",
  ornaments: "орнамент с име",
  kitchen: "кухненски подарък с гравиране",
  nursery: "Монтесори играчка или детски DIY комплект от дърво",
  signs: "табела с текст по поръчка",
  venues: "табела за заведение",
  corporate: "корпоративен подарък с лого",
  keychains: "ключодържател с гравирано име",
  jewelry: "висулка с име",
  pets: "табела с име на домашен любимец",
  auto: "авто подарък с регистрационен номер",
};

export type ProductSeoInput = {
  name: string;
  description: string;
  slug: string;
  category?: string | null;
};

export type ProductSeo = {
  /** <title> without brand suffix */
  title: string;
  /** meta description ≤160 */
  metaDescription: string;
  /** Longer copy for Schema.org Product.description */
  schemaDescription: string;
  /** On-page paragraphs (unique long-tail body) */
  bodyParagraphs: string[];
  categoryLabel: string | null;
  categoryHref: string | null;
  longTailPhrase: string | null;
};

function categoryLabelOf(category?: string | null): string | null {
  if (!category) return null;
  return categoryById(category as CategoryId)?.label ?? null;
}

function categoryHrefOf(category?: string | null): string | null {
  if (!category) return null;
  const occasion = occasionByCategoryId(category);
  if (occasion) return occasionPath(occasion.slug);
  const landing = categoryLandingById(category);
  if (landing) return categoryLandingPath(landing.slug);
  return `/?cat=${encodeURIComponent(category)}#katalog`;
}

/**
 * Builds unique title/meta/body for each product from name + category +
 * short seed description — targets long-tail queries without rewriting DB rows.
 */
export function buildProductSeo(input: ProductSeoInput): ProductSeo {
  const catId = (input.category ?? "") as CategoryId;
  const catLabel = categoryLabelOf(input.category);
  const longTail = CATEGORY_LONG_TAIL[catId] ?? null;
  const short = input.description.replace(/\s+/g, " ").trim();

  const title = catLabel
    ? `${input.name} | ${catLabel} с гравиране`
    : `${input.name} | персонализиран подарък с гравиране`;

  const metaParts = [
    short,
    longTail ? `Идеален като ${longTail}.` : null,
    `Персонализация с име или послание · изработка 2–5 дни · доставка в България от ${SITE_NAME}.`,
  ].filter(Boolean) as string[];

  const metaDescription = truncateMeta(metaParts.join(" "));

  const schemaDescription = [
    short,
    longTail
      ? `${input.name} е подходящ като ${longTail} — добавете име, дата или кратко послание при поръчка.`
      : `Персонализирайте „${input.name}“ с име, дата или послание при поръчка.`,
    catLabel
      ? `Категория: ${catLabel}. Изработка обикновено 2–5 работни дни след потвърждение. Доставка с Еконт или Speedy в цяла България.`
      : `Изработка обикновено 2–5 работни дни след потвърждение. Доставка с Еконт или Speedy в цяла България.`,
  ].join(" ");

  const bodyParagraphs = [
    short,
    longTail
      ? `Търсите ${longTail}? „${input.name}“ се изработва с лазерно гравиране по ваш текст — име, инициали, дата или кратко послание. Преди изработка потвърждаваме макета при нужда.`
      : `„${input.name}“ се изработва с лазерно гравиране по ваш текст — име, инициали, дата или кратко послание. Преди изработка потвърждаваме макета при нужда.`,
    `Поръчвате без регистрация. Стандартният срок е 2–5 работни дни след потвърждение; при близка дата може да заявите ускорена изработка. Доставката е с Еконт или Speedy в цяла България, с опция за лично получаване.`,
  ];

  return {
    title,
    metaDescription,
    schemaDescription,
    bodyParagraphs,
    categoryLabel: catLabel,
    categoryHref: categoryHrefOf(input.category),
    longTailPhrase: longTail,
  };
}
