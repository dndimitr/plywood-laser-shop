/**
 * Gift kits with locked EUR prices (not run through pack() BGN conversion).
 * Bundle totals use catalog “from” prices minus 9–13% for shared laser setup
 * and a single shipment. Free shipping applies from FREE_SHIPPING_MIN_EUR (35 €).
 */

import type { SeedOption, SeedProduct } from "./catalog-products";

function kitOpts(
  variants: Array<{
    label: string;
    sizeLabel: string;
    thicknessMm?: number;
    laserType?: SeedOption["laserType"];
    finish?: string;
    priceModifier: number;
  }>,
): SeedOption[] {
  return variants.map((v) => ({
    label: v.label,
    sizeLabel: v.sizeLabel,
    thicknessMm: v.thicknessMm ?? 4,
    laserType: v.laserType ?? "BOTH",
    material: "birch-plywood",
    finish: v.finish ?? "raw",
    doubleSided: false,
    priceModifier: v.priceModifier,
  }));
}

const PHOTO = (slug: string) => `/products/photos/${slug}.png`;

const CLOSET_VARIANTS = [
  { slug: "baby-closet-mecho", label: "Касетка „Мече“" },
  { slug: "baby-closet-luna", label: "Касетка „Луна“" },
  { slug: "baby-closet-lav", label: "Касетка „Лъвче“" },
  { slug: "baby-closet-more", label: "Касетка „Море“" },
  { slug: "baby-closet-elen", label: "Касетка „Еленче“" },
  { slug: "baby-closet-slantse", label: "Касетка „Слънце“" },
  { slug: "baby-closet-tigar", label: "Касетка „Тигър“" },
  { slug: "baby-closet-balon", label: "Касетка „Балон“" },
  { slug: "baby-closet-vlak", label: "Касетка „Влак“" },
  { slug: "baby-closet-zamak", label: "Касетка „Замък“" },
] as const;

/** Place cards 1.95 € each; kit price = list × (51.90 / 57.22). */
const WEDDING_GUEST_TIERS = [
  { guests: 10, price: 51.9 },
  { guests: 30, price: 87.27 },
  { guests: 50, price: 122.65 },
  { guests: 80, price: 175.71 },
] as const;

export const CATALOG_KITS: SeedProduct[] = [
  {
    name: "Комплект 5 подвижни фигури — Хелоуин",
    shortTitle: "Хелоуин 5 фигури",
    slug: "komplekt-helouin-5-figuri",
    category: "halloween",
    description:
      "Пет подвижни фигури по избор от серията Хелоуин — тиква, вещица, скелет, черна котка, дух, прилеп, гарван, бухал, паяк или лунен силует. Поотделно са 5 × 12,10 € = 60,50 €; комплектът е 52,90 € (−13%) с безплатна доставка. Напишете кои пет искате при поръчка. Има и входна точка от 3 фигури.",
    basePrice: 52.9,
    imageUrl: PHOTO("komplekt-helouin-5-figuri"),
    galleryUrls: [
      PHOTO("komplekt-helouin-5-figuri"),
      PHOTO("helouin-tikva-ime"),
      PHOTO("helouin-veshtica"),
      PHOTO("helouin-skelet"),
      PHOTO("helouin-duh"),
      PHOTO("helouin-komplekt-figurki"),
    ],
    options: kitOpts([
      {
        label: "5 фигури · комплект",
        sizeLabel: "микс около 12–15 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
    ]),
  },
  {
    name: "Комплект 3 подвижни фигури — Хелоуин",
    shortTitle: "Хелоуин 3 фигури",
    slug: "komplekt-helouin-3-figuri",
    category: "halloween",
    description:
      "Входна точка към хелоуинската серия: три подвижни фигури по избор (тиква, вещица, скелет, черна котка, дух и още) за 32,90 €. Напишете кои три при поръчка. Под 35 € доставката се заплаща — за безплатна доставка вземете комплекта от 5 фигури. „Събери всички“ е вградено в продукта.",
    basePrice: 32.9,
    imageUrl: PHOTO("komplekt-helouin-3-figuri"),
    galleryUrls: [
      PHOTO("komplekt-helouin-3-figuri"),
      PHOTO("helouin-tikva-ime"),
      PHOTO("helouin-veshtica"),
      PHOTO("helouin-duh"),
    ],
    options: kitOpts([
      {
        label: "3 фигури · комплект",
        sizeLabel: "микс около 12–15 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
    ]),
  },
  {
    name: "Семейна Коледа",
    slug: "komplekt-koleda-semeistvo",
    category: "christmas",
    description:
      "Водещият коледен комплект: табела „Весела Коледа“ с фамилия (12,96 €), комплект орнаменти „Семейство“ с имена и година (20,74 €) и два държача за коледен чорап с име (17,30 €). Сбор 51,00 € → 45,90 € (−10%), с безплатна доставка. Едно гравиране на фамилията минава през всички елементи — напишете фамилия, имена и година при поръчка.",
    basePrice: 45.9,
    imageUrl: PHOTO("komplekt-koleda-semeistvo"),
    galleryUrls: [
      PHOTO("komplekt-koleda-semeistvo"),
      PHOTO("tabela-vesela-koleda"),
      PHOTO("komplekt-koledni-ornamenti-semeistvo"),
      PHOTO("koleda-chorap-darzhach"),
    ],
    options: kitOpts([
      {
        label: "Семеен комплект",
        sizeLabel: "табела + орнаменти + 2 държача",
        thicknessMm: 4,
        priceModifier: 0,
      },
    ]),
  },
  {
    name: "Първи спомени — делукс",
    slug: "komplekt-novorodeno-delux",
    category: "newborn",
    description:
      "Готов подарък за бебешко парти: гардероб-касетка по избор (мече, луна, лъвче, море и още — 20,74 €), табела с данни за раждането (18,15 €), закачалка с име (6,92 €) и кутийка за зъбче (7,77 €). Сбор 53,58 € → 47,90 € (−11%), с безплатна доставка. Изберете мотива на касетката и напишете име, дата, час, тегло и ръст.",
    basePrice: 47.9,
    imageUrl: PHOTO("komplekt-novorodeno-delux"),
    galleryUrls: [
      PHOTO("komplekt-novorodeno-delux"),
      PHOTO("baby-closet-mecho"),
      PHOTO("tabela-danni-razhdane"),
      PHOTO("zakachalka-ime-garderob"),
      PHOTO("kutiika-zabche"),
    ],
    options: kitOpts(
      CLOSET_VARIANTS.map((v) => ({
        label: v.label,
        sizeLabel: "касетка + табела + закачалка + кутийка",
        thicknessMm: 3,
        priceModifier: 0,
      })),
    ),
  },
  {
    name: "Стартов сватбен комплект",
    slug: "komplekt-svatba-start",
    category: "wedding",
    description:
      "Табела за посрещане с имена и дата (22,60 €), топер за торта с имена (15,12 €) и картички за места на масата. При 10 гости сборът е 57,22 € → 51,90 € (−9%), с безплатна доставка. Изберете броя гости — цената се преизчислява (30 / 50 / 80). Напишете имената на младоженците, датата и списъка с гости за картичките.",
    basePrice: 51.9,
    imageUrl: PHOTO("komplekt-svatba-start"),
    galleryUrls: [
      PHOTO("komplekt-svatba-start"),
      PHOTO("svatbena-welcome"),
      PHOTO("cake-topper-imena"),
      PHOTO("place-cards-svatba"),
    ],
    options: kitOpts(
      WEDDING_GUEST_TIERS.map((tier) => ({
        label: `${tier.guests} гости · картички за места`,
        sizeLabel: `табела + топер + ${tier.guests} картички`,
        thicknessMm: 3,
        priceModifier: Math.round((tier.price - 51.9) * 100) / 100,
      })),
    ),
  },
  {
    name: "Монтесори стартов комплект 2–4 г.",
    shortTitle: "Монтесори 2–4 г.",
    slug: "komplekt-montessori-start",
    category: "nursery",
    description:
      "Първа степен за домашна Монтесори среда: табла за дейности (14,69 €), сортер форми (16,42 €) и дъска с колчета (17,28 €). Сбор 48,39 € → 42,90 € (−11%), с безплатна доставка. Когато детето порасне, продължете с комплекта „Монтесори математика 4–6 г.“",
    basePrice: 42.9,
    imageUrl: PHOTO("komplekt-montessori-start"),
    galleryUrls: [
      PHOTO("komplekt-montessori-start"),
      PHOTO("montessori-tabla-deinosti"),
      PHOTO("montessori-sorter-formi"),
      PHOTO("montessori-peg-board"),
    ],
    options: kitOpts([
      {
        label: "Старт 2–4 г.",
        sizeLabel: "табла + сортер + peg board",
        thicknessMm: 4,
        priceModifier: 0,
      },
    ]),
  },
  {
    name: "Монтесори математика 4–6 г.",
    shortTitle: "Монтесори 4–6 г.",
    slug: "komplekt-montessori-matematika",
    category: "nursery",
    description:
      "Втора степен — естествена повторна покупка след стартовия комплект 2–4 г.: числа и броеве 1–10 (17,28 €), цифрови вретена (22,46 €) и проследяващи букви кирилица (19,01 €). Сбор 58,75 € → 52,90 € (−11%), с безплатна доставка.",
    basePrice: 52.9,
    imageUrl: PHOTO("komplekt-montessori-matematika"),
    galleryUrls: [
      PHOTO("komplekt-montessori-matematika"),
      PHOTO("montessori-chisla-1-10"),
      PHOTO("montessori-vretena-1-10"),
      PHOTO("montessori-bukvi-prosledyavane"),
    ],
    options: kitOpts([
      {
        label: "Математика 4–6 г.",
        sizeLabel: "числа + вретена + букви",
        thicknessMm: 4,
        priceModifier: 0,
      },
    ]),
  },
];

/** Five campaign kits shown on the homepage (entry SKUs stay in catalog/feed). */
export const FEATURED_KITS: { slug: string; badge: string }[] = [
  { slug: "komplekt-helouin-5-figuri", badge: "Хелоуин" },
  { slug: "komplekt-koleda-semeistvo", badge: "Коледа" },
  { slug: "komplekt-novorodeno-delux", badge: "Новородено" },
  { slug: "komplekt-svatba-start", badge: "Сватба" },
  { slug: "komplekt-montessori-start", badge: "Монтесори" },
];

export const FEATURED_KIT_SLUGS = FEATURED_KITS.map((k) => k.slug);

export const KIT_SLUG_SET = new Set(CATALOG_KITS.map((k) => k.slug));

/** Catalog “from” totals before kit discount — used as Facebook `price` vs `sale_price`. */
export const KIT_LIST_PRICE_EUR: Record<string, number> = {
  "komplekt-helouin-5-figuri": 60.5,
  "komplekt-helouin-3-figuri": 36.3,
  "komplekt-koleda-semeistvo": 51,
  "komplekt-novorodeno-delux": 53.58,
  "komplekt-svatba-start": 57.22,
  "komplekt-montessori-start": 48.39,
  "komplekt-montessori-matematika": 58.75,
};

export const KIT_RELATED: Record<string, { href: string; label: string }> = {
  "komplekt-helouin-5-figuri": {
    href: "/products/komplekt-helouin-3-figuri",
    label: "Входна точка: 3 фигури — 32,90 €",
  },
  "komplekt-helouin-3-figuri": {
    href: "/products/komplekt-helouin-5-figuri",
    label: "Пълен комплект: 5 фигури — 52,90 € с безплатна доставка",
  },
  "komplekt-montessori-start": {
    href: "/products/komplekt-montessori-matematika",
    label: "Следваща степен: математика 4–6 г. — 52,90 €",
  },
  "komplekt-montessori-matematika": {
    href: "/products/komplekt-montessori-start",
    label: "Стартов комплект 2–4 г. — 42,90 €",
  },
};

export const KIT_ENGRAVING_HINTS: Record<string, string> = {
  "komplekt-helouin-5-figuri":
    "Кои 5 фигури: тиква, вещица, скелет, черна котка, дух…",
  "komplekt-helouin-3-figuri":
    "Кои 3 фигури: тиква, вещица, скелет, черна котка, дух…",
  "komplekt-koleda-semeistvo": "Фамилия, имена за орнаментите и година",
  "komplekt-novorodeno-delux": "Име, дата, час, тегло и ръст",
  "komplekt-svatba-start": "Имена, дата и гости за картичките",
  "komplekt-montessori-start": "Име или посвещение (по желание)",
  "komplekt-montessori-matematika": "Име или посвещение (по желание)",
};
