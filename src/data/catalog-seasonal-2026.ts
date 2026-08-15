/**
 * Seasonal catalog — Sep 2026 → Mar 2027
 * (училище, есен/Хелоуин, Никулден/Коледа/Нова година, Валентин, Баба Марта/8 март)
 *
 * Prices authored in BGN; converted in pack(). Sizes ≤ 40×40 cm bed.
 */

type SeedLaserType = "ENGRAVE" | "CUT" | "BOTH";

type SeedOption = {
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: SeedLaserType;
  material: string;
  finish: string;
  doubleSided: boolean;
  priceModifier: number;
};

export type SeasonalDraft = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  options: SeedOption[];
  /** Bulgarian text shown on the product photo */
  photoText: string;
};

function opts(
  variants: Array<{
    label: string;
    sizeLabel: string;
    thicknessMm: number;
    laserType: SeedLaserType;
    material?: string;
    finish?: string;
    doubleSided?: boolean;
    priceModifier: number;
  }>,
): SeedOption[] {
  return variants.map((v) => ({
    material: v.material ?? "birch-plywood",
    finish: v.finish ?? "raw",
    doubleSided: v.doubleSided ?? false,
    ...v,
  }));
}

function std2(
  small: { label: string; size: string; mm?: number; price?: number },
  large: { label: string; size: string; mm?: number; price?: number },
): SeedOption[] {
  return opts([
    {
      label: small.label,
      sizeLabel: small.size,
      thicknessMm: small.mm ?? 3,
      laserType: "BOTH",
      priceModifier: small.price ?? 0,
    },
    {
      label: large.label,
      sizeLabel: large.size,
      thicknessMm: large.mm ?? 4,
      laserType: "BOTH",
      finish: "oil",
      priceModifier: large.price ?? 6,
    },
  ]);
}

export const SEASONAL_2026_DRAFTS: SeasonalDraft[] = [
  // —— Септември: училище ——
  {
    name: "Линийка с име за ученик",
    slug: "uchen-lineika-ime",
    category: "school",
    description:
      "Дървена линийка с гравирано име — практичен и личен подарък за първия учебен ден.",
    basePrice: 14,
    photoText: "МАРИЯ",
    options: std2(
      { label: "20 см · 3 мм", size: "20×3 см" },
      { label: "30 см · масло", size: "30×3.5 см", price: 5 },
    ),
  },
  {
    name: "Табела „Учи тук“ с име",
    slug: "uchen-tabela-uchi-tuk",
    category: "school",
    description:
      "Табела за врата или шкафче с името на детето — ясно и весело за новата учебна година.",
    basePrice: 22,
    photoText: "Георги учи тук",
    options: std2(
      { label: "Стандарт · 3 мм", size: "20×12 см" },
      { label: "Голяма · масло", size: "28×16 см", price: 8 },
    ),
  },
  {
    name: "Моливник с име и клас",
    slug: "uchen-molivnik-ime",
    category: "school",
    description:
      "Сглобяем моливник от шперплат с гравирани име и клас. Подходящ за бюрото вкъщи или в училище.",
    basePrice: 28,
    photoText: "Иван · 3 клас",
    options: std2(
      { label: "Стандарт · 4 мм", size: "12×8×8 см", mm: 4 },
      { label: "Премиум · масло", size: "14×9×9 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Книгоразделител „Първи учебен ден“",
    slug: "uchen-knigorzadelitel",
    category: "school",
    description:
      "Персонализиран книгоразделител с име и година — спомен от първия учебен ден.",
    basePrice: 12,
    photoText: "Първи учебен ден · 2026",
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×4 см" },
      { label: "Комплект 3 бр.", size: "12×4 см", price: 16 },
    ),
  },
  {
    name: "Плакет „Благодаря, учителке“",
    slug: "uchen-plaket-uchitelka",
    category: "school",
    description:
      "Плакет с гравиран поздрав за учителка или учител — подходящ за края на срока или 1 ноември.",
    basePrice: 26,
    photoText: "Благодаря, учителке!",
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12 см", mm: 4 },
      { label: "Стойка · масло", size: "20×14 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Ключодържател буква с инициал",
    slug: "uchen-klyuch-bukva",
    category: "school",
    description:
      "Ажурна буква-ключодържател с инициал — малък подарък за ученик или учител.",
    basePrice: 10,
    photoText: "А",
    options: opts([
      {
        label: "Единичен · 3 мм",
        sizeLabel: "5×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 3 бр.",
        sizeLabel: "5×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Табела „Домашните на…“",
    slug: "uchen-tabela-domashni",
    category: "school",
    description:
      "Табела за къта с домашните — гравираме името на детето. Весел ред на бюрото.",
    basePrice: 20,
    photoText: "Домашните на Елена",
    options: std2(
      { label: "Стандарт · 3 мм", size: "22×10 см" },
      { label: "Голяма · масло", size: "28×12 см", price: 7 },
    ),
  },
  {
    name: "Кутия „Училищни спомени“",
    slug: "uchen-kutiya-spomeni",
    category: "school",
    description:
      "Кутия за рисунки, грамоти и първи учебни дни — с година и име по желание.",
    basePrice: 36,
    photoText: "Училищни спомени 2026",
    options: std2(
      { label: "Средна · 4 мм", size: "22×16×8 см", mm: 4 },
      { label: "Голяма · масло", size: "28×20×10 см", mm: 6, price: 12 },
    ),
  },

  // —— Октомври: есен & Хелоуин ——
  {
    name: "Есенен венец с фамилия",
    slug: "esen-venets-familia",
    category: "halloween",
    description:
      "Ажурен есенен венец за врата с гравирана фамилия — топъл акцент за сезона.",
    basePrice: 38,
    photoText: "Семейство Петрови",
    options: std2(
      { label: "Ø 28 см · 4 мм", size: "Ø 28 см", mm: 4 },
      { label: "Ø 35 см · масло", size: "Ø 35 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Есенна табела „Добре дошли“",
    slug: "esen-tabela-dobre-doshli",
    category: "halloween",
    description:
      "Табела за вход с есенен мотив и надпис „Добре дошли“ — по желание с фамилия.",
    basePrice: 24,
    photoText: "Добре дошли",
    options: std2(
      { label: "Стандарт · 3 мм", size: "25×15 см" },
      { label: "Голяма · масло", size: "32×18 см", price: 8 },
    ),
  },
  {
    name: "Тиква-табела с име за парти",
    slug: "helouin-tikva-ime",
    category: "halloween",
    description:
      "Мила тиква с име — за Хелоуин парти или есенна декорация, без страшни мотиви.",
    basePrice: 18,
    photoText: "Никол",
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×14 см" },
      { label: "Голяма · масло", size: "22×20 см", price: 7 },
    ),
  },
  {
    name: "Етикети за бонбони „Хелоуин“",
    slug: "helouin-etiketi-bonboni",
    category: "halloween",
    description:
      "Комплект етикети за treat bags с име или поздрав — за детско парти.",
    basePrice: 22,
    photoText: "За теб · Хелоуин",
    options: opts([
      {
        label: "20 бр. · 3 мм",
        sizeLabel: "6×4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "50 бр. · масло",
        sizeLabel: "6×4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Фоторамка „Есен 2026“",
    slug: "esen-ramka-2026",
    category: "halloween",
    description:
      "Рамка с гравирана година и място за снимка — спомен от есенния сезон.",
    basePrice: 30,
    photoText: "Есен 2026",
    options: std2(
      { label: "10×15 · 4 мм", size: "18×22 см", mm: 4 },
      { label: "13×18 · масло", size: "22×28 см", mm: 4, price: 9 },
    ),
  },
  {
    name: "Надпис за фотозона „Честит Хелоуин“",
    slug: "helouin-fotozona-nadpis",
    category: "halloween",
    description:
      "Голям ажурен надпис за фотозона или стена — парти акцент с чист шрифт.",
    basePrice: 34,
    photoText: "Честит Хелоуин",
    options: std2(
      { label: "Среден · 3 мм", size: "40×12 см" },
      { label: "Голям · 4 мм", size: "40×16 см", mm: 4, price: 10 },
    ),
  },

  // —— Ноември ——
  {
    name: "Плакет „На любимия учител“",
    slug: "uchitel-plaket-lyubim",
    category: "school",
    description:
      "Плакет с поздрав за учител — подходящ за Деня на народните будители и края на срока.",
    basePrice: 28,
    photoText: "На любимия учител",
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12 см", mm: 4 },
      { label: "Стойка · масло", size: "20×14 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Кутия „Отвори на 1 декември“",
    slug: "kutiya-otvori-1-dekemvri",
    category: "christmas",
    description:
      "Кутия за малък жест или писмо — старт на адвент настроението преди Коледа.",
    basePrice: 32,
    photoText: "Отвори на 1 декември",
    options: std2(
      { label: "Стандарт · 4 мм", size: "16×12×6 см", mm: 4 },
      { label: "Премиум · масло", size: "18×14×7 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Стойка за вино „Благодаря“",
    slug: "vino-stoika-blagodarya",
    category: "gifts",
    description:
      "Стойка за бутилка с гравирано „Благодаря“ — корпоративен или личен жест.",
    basePrice: 26,
    photoText: "Благодаря",
    options: std2(
      { label: "Стандарт · 4 мм", size: "28×12 см", mm: 4 },
      { label: "С име · масло", size: "30×14 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Магнит „Семейство“ с фамилия",
    slug: "magnet-semeistvo-familia",
    category: "gifts",
    description:
      "Хладилников магнит с фамилия — малък сезонен спомен за дома.",
    basePrice: 11,
    photoText: "Семейство Иванови",
    options: std2(
      { label: "Единичен · 3 мм", size: "8×6 см" },
      { label: "Комплект 3 бр.", size: "8×6 см", price: 16 },
    ),
  },
  {
    name: "Настолен календар 2027 с фамилия",
    slug: "kalendar-2027-familia",
    category: "newyear",
    description:
      "Вечен / годишен настолен календар с гравирана фамилия — подарък за новата година.",
    basePrice: 40,
    photoText: "2027 · Семейство Георгиеви",
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×14 см", mm: 4 },
      { label: "Премиум · масло", size: "22×16 см", mm: 4, price: 12 },
    ),
  },

  // —— Декември: Никулден, Коледа, Нова година ——
  {
    name: "Орнамент „Честит Никулден“",
    slug: "nikulden-ornament",
    category: "christmas",
    description:
      "Орнамент за Никулден с поздрав или име — за елхата или като малък жест на 6 декември.",
    basePrice: 14,
    photoText: "Честит Никулден",
    options: std2(
      { label: "Стандарт · 3 мм", size: "9×9 см" },
      { label: "С име · масло", size: "10×10 см", price: 5 },
    ),
  },
  {
    name: "Държач за коледен чорап с име",
    slug: "koleda-chorap-darzhach",
    category: "christmas",
    description:
      "Стенен държач/кука с гравирано име — за чорапа над камината или вратата.",
    basePrice: 20,
    photoText: "Алекс",
    options: std2(
      { label: "Стандарт · 4 мм", size: "12×8 см", mm: 4 },
      { label: "Голям · масло", size: "15×10 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Табела „Семейство · Коледа 2026“",
    slug: "koleda-tabela-familia-2026",
    category: "christmas",
    description:
      "Семейна табела с фамилия и година — за врата, стена или фотозона.",
    basePrice: 32,
    photoText: "Семейство Димитрови · Коледа 2026",
    options: std2(
      { label: "Стандарт · 4 мм", size: "30×16 см", mm: 4 },
      { label: "Голяма · масло", size: "38×18 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Кутия за коледна картичка",
    slug: "koleda-kutiya-kartichka",
    category: "christmas",
    description:
      "Малка кутия за картичка и плик — с поздрав „Весела Коледа“.",
    basePrice: 24,
    photoText: "Весела Коледа",
    options: std2(
      { label: "Стандарт · 3 мм", size: "16×11×3 см" },
      { label: "Премиум · масло", size: "18×12×3 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Топер „Честита Нова година“",
    slug: "nova-godina-toper",
    category: "newyear",
    description:
      "Топер за торта или десертна маса с поздрав за Нова година.",
    basePrice: 16,
    photoText: "Честита Нова година",
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×12 см" },
      { label: "Голям · масло", size: "24×14 см", price: 6 },
    ),
  },
  {
    name: "Табела „2027“",
    slug: "nova-godina-tabela-2027",
    category: "newyear",
    description:
      "Декоративна табела с новата година — за фотозона, врата или рафт.",
    basePrice: 22,
    photoText: "2027",
    options: std2(
      { label: "Стандарт · 3 мм", size: "25×12 см" },
      { label: "Голяма · масло", size: "35×14 см", price: 8 },
    ),
  },
  {
    name: "Стойка за шампанско „Нова година“",
    slug: "nova-godina-stoika-shampansko",
    category: "newyear",
    description:
      "Стойка за бутилка с имена на двойката и годината — празничен жест.",
    basePrice: 30,
    photoText: "Иван & Мария · 2027",
    options: std2(
      { label: "Стандарт · 4 мм", size: "30×14 см", mm: 4 },
      { label: "Премиум · масло", size: "32×16 см", mm: 4, price: 9 },
    ),
  },
  {
    name: "Орнамент „Първа Коледа“ с име на бебе",
    slug: "koleda-purva-bebe-ime",
    category: "christmas",
    description:
      "Нежен орнамент за първата Коледа на бебето — с име и година.",
    basePrice: 15,
    photoText: "Първа Коледа на Мия",
    options: std2(
      { label: "Стандарт · 3 мм", size: "9×9 см" },
      { label: "С година · масло", size: "10×10 см", price: 5 },
    ),
  },

  // —— Януари–февруари ——
  {
    name: "Табела „Нов дом 2027“",
    slug: "nov-dom-2027",
    category: "gifts",
    description:
      "Табела за новото жилище с година — подарък за нанасяне или нов дом.",
    basePrice: 28,
    photoText: "Нов дом 2027",
    options: std2(
      { label: "Стандарт · 4 мм", size: "25×15 см", mm: 4 },
      { label: "С фамилия · масло", size: "30×16 см", mm: 4, price: 9 },
    ),
  },
  {
    name: "Плакет „Моята година 2027“",
    slug: "plaket-moyata-godina-2027",
    category: "newyear",
    description:
      "Плакет за целите на годината с име — мотивационен и личен акцент за бюрото.",
    basePrice: 24,
    photoText: "Моята година 2027",
    options: std2(
      { label: "Стандарт · 4 мм", size: "16×12 см", mm: 4 },
      { label: "С име · масло", size: "18×14 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Кутия „Отвори на 14 февруари“",
    slug: "kutiya-otvori-14-fevruari",
    category: "valentines",
    description:
      "Кутия за малък подарък или писмо — романтичен жест преди Свети Валентин.",
    basePrice: 32,
    photoText: "Отвори на 14 февруари",
    options: std2(
      { label: "Стандарт · 4 мм", size: "16×12×6 см", mm: 4 },
      { label: "Премиум · масло", size: "18×14×7 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Табела „Нашата дата“",
    slug: "valentin-nashata-data",
    category: "valentines",
    description:
      "Табела с дата на срещата или годишнина — компактен романтичен спомен.",
    basePrice: 22,
    photoText: "Нашата дата · 14.02",
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×12 см" },
      { label: "С имена · масло", size: "22×14 см", price: 7 },
    ),
  },

  // —— Март 2027: Баба Марта и 8 март ——
  {
    name: "Табела „Честита Баба Марта“",
    slug: "baba-marta-tabela",
    category: "spring",
    description:
      "Табела с поздрав за 1 март — с имена или фамилия по желание.",
    basePrice: 24,
    photoText: "Честита Баба Марта",
    options: std2(
      { label: "Стандарт · 3 мм", size: "22×14 см" },
      { label: "Голяма · масло", size: "28×16 см", price: 8 },
    ),
  },
  {
    name: "Плакет „Честит 8 март“",
    slug: "osmimart-plaket",
    category: "spring",
    description:
      "Плакет с поздрав за 8 март — с име на майка, баба или колежка.",
    basePrice: 26,
    photoText: "Честит 8 март",
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12 см", mm: 4 },
      { label: "С име · масло", size: "20×14 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Ключодържател мартеница с инициали",
    slug: "baba-marta-klyuch-iniciali",
    category: "spring",
    description:
      "Ключодържател в дух на мартеница с инициали — малък жест за 1 март.",
    basePrice: 12,
    photoText: "М · П",
    options: opts([
      {
        label: "Единичен · 3 мм",
        sizeLabel: "6×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 2 бр.",
        sizeLabel: "6×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Стойка за мартеници с имена",
    slug: "baba-marta-stoika-imena",
    category: "spring",
    description:
      "Настолна стойка за мартеници с гравирани имена — за семейния ритуал на 1 март.",
    basePrice: 28,
    photoText: "Мартениците на семейство Николови",
    options: std2(
      { label: "Стандарт · 4 мм", size: "16×10 см", mm: 4 },
      { label: "Голяма · масло", size: "20×12 см", mm: 4, price: 8 },
    ),
  },
];
