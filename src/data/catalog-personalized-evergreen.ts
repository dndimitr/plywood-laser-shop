/**
 * Evergreen personalized products — sell year-round (names, dates, QR, maps).
 * Prices authored in BGN; converted in pack() in catalog-products.ts.
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

export type PersonalizedDraft = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  options: SeedOption[];
  /** Sample engraving shown on the product photo */
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
      priceModifier: large.price ?? 10,
    },
  ]);
}

export const PERSONALIZED_EVERGREEN_DRAFTS: PersonalizedDraft[] = [
  {
    name: "Семейна табела за вход",
    slug: "personal-semeina-tabela-vhod",
    category: "personalized",
    description:
      "Табела за входна врата или антре с фамилия и година „откакто сме тук“. Целогодишен подарък за нов дом и семейства.",
    basePrice: 36,
    photoText: "Семейство Иванови · от 2019",
    options: std2(
      { label: "Стандарт · 3 мм", size: "30×12 см" },
      { label: "Голяма · 4 мм · масло", size: "40×15 см", mm: 4, price: 14 },
    ),
  },
  {
    name: "Координати на мястото ни",
    slug: "personal-koordinati",
    category: "personalized",
    description:
      "Плакет с GPS координати на специално място — дом, среща или пътуване. Гравираме lat/long и кратък надпис по избор.",
    basePrice: 28,
    photoText: "42.6977° N 23.3219° E · София",
    options: std2(
      { label: "Квадрат · 3 мм", size: "15×15 см" },
      { label: "Голям · 4 мм · масло", size: "20×20 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Карта „Къде се запознахме“",
    slug: "personal-karta-zapoznahme",
    category: "personalized",
    description:
      "Ажурна карта на град или държава с маркирана точка на запознанството. Персонализация с имена и дата.",
    basePrice: 42,
    photoText: "София · 14.06.2018",
    options: std2(
      { label: "Средна · 3 мм", size: "25×20 см" },
      { label: "Голяма · 4 мм", size: "35×28 см", mm: 4, price: 16 },
    ),
  },
  {
    name: "Плакет „Нашата песен“ с QR",
    slug: "personal-plaket-pesen",
    category: "personalized",
    description:
      "Дървен плакет с QR към любима песен в Spotify/YouTube, заглавие и имена. Романтичен подарък без сезонен повод.",
    basePrice: 26,
    photoText: "♪ Нашата песен · QR",
    options: std2(
      { label: "Компактен · 3 мм", size: "12×12 см" },
      { label: "Стойка · 4 мм", size: "15×15 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Рамка спомен с дата",
    slug: "personal-ramka-spomen",
    category: "personalized",
    description:
      "Ажурна рамка за снимка с гравирана дата и кратко послание — първи дом, пътуване или годишнина.",
    basePrice: 32,
    photoText: "Нашият дом · 2024",
    options: std2(
      { label: "10×15 · 3 мм", size: "18×23 см" },
      { label: "13×18 · 4 мм · масло", size: "22×28 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Комплект „Отвори когато…“",
    slug: "personal-komplekt-otvori",
    category: "personalized",
    description:
      "Комплект от 6 малки кутийки с гравирани поводи: „когато си тъжен“, „когато празнуваме“ и др. Текстовете се персонализират.",
    basePrice: 58,
    photoText: "Отвори когато… ×6",
    options: opts([
      {
        label: "6 кутии · 3 мм",
        sizeLabel: "8×6×4 см всяка",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "6 кутии · масло",
        sizeLabel: "8×6×4 см всяка",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Двойка ключодържатели пъзел-сърце",
    slug: "personal-pazel-sarce",
    category: "personalized",
    description:
      "Два ключодържателя, които заедно образуват сърце. Гравираме имена или инициали от двете страни.",
    basePrice: 22,
    photoText: "М + А",
    options: opts([
      {
        label: "Комплект · 3 мм · гравиране",
        sizeLabel: "5×5 см ×2",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект · двустранно · масло",
        sizeLabel: "5×5 см ×2",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Стенна линия на живота",
    slug: "personal-liniya-zhivot",
    category: "personalized",
    description:
      "Хоризонтална лента с важни дати — запознанство, сватба, деца. Добавяте събития и години при поръчка.",
    basePrice: 48,
    photoText: "2016 → 2019 → 2022",
    options: std2(
      { label: "3 събития · 3 мм", size: "40×8 см" },
      { label: "5 събития · 4 мм", size: "40×10 см", mm: 4, price: 18 },
    ),
  },
  {
    name: "Табела с имена на децата",
    slug: "personal-tabela-detsa",
    category: "personalized",
    description:
      "Семейна табела с фамилия и имената на децата — за хол, антре или детска. Целогодишен декор с гравиране.",
    basePrice: 34,
    photoText: "Иванови · Ема · Никола",
    options: std2(
      { label: "Средна · 3 мм", size: "28×14 см" },
      { label: "Голяма · 4 мм · масло", size: "36×16 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Календар „Важните дати“",
    slug: "personal-kalendar-vazhni",
    category: "personalized",
    description:
      "Вечен календар от шперплат с гравирани годишнини — рождени дни, сватба и семейни дати. Ползва се целогодишно.",
    basePrice: 44,
    photoText: "Важните дати · Семейство",
    options: std2(
      { label: "Стандарт · 3 мм", size: "20×25 см" },
      { label: "Голям · 4 мм · масло", size: "24×30 см", mm: 4, price: 14 },
    ),
  },
  {
    name: "Настолна табела с име и длъжност",
    slug: "personal-nastolna-ime",
    category: "personalized",
    description:
      "Настолна табела за бюро с име и длъжност или кабинет. Подходяща за офис, кабинет и корпоративен подарък.",
    basePrice: 24,
    photoText: "Мария Петрова · Дизайнер",
    options: std2(
      { label: "Стандарт · 3 мм", size: "20×7 см" },
      { label: "Широка · 4 мм · масло", size: "25×8 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Медальон за любимец с QR",
    slug: "personal-medalion-qr",
    category: "personalized",
    description:
      "Медальон за куче или котка с име, телефон и QR към контакт. Лек брезов шперплат с метална халка.",
    basePrice: 16,
    photoText: "Рекс · 0888… · QR",
    options: opts([
      {
        label: "Костен · 3 мм",
        sizeLabel: "3,5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Кръгъл · двустранен",
        sizeLabel: "4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        doubleSided: true,
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Табела за хранилка с име",
    slug: "personal-tabela-hranilka",
    category: "personalized",
    description:
      "Малка табела или етикет за купичка/кутия с лакомства — име на любимеца и кратък надпис.",
    basePrice: 14,
    photoText: "Храната на Мими",
    options: std2(
      { label: "Етикет · 3 мм", size: "10×5 см" },
      { label: "Стойка · 3 мм", size: "12×6 см", price: 5 },
    ),
  },
  {
    name: "Рамка „Осиновихме на…“",
    slug: "personal-ramka-osinovyavane",
    category: "personalized",
    description:
      "Рамка за снимка на домашен любимец с дата на осиновяване и име. Топъл целогодишен спомен.",
    basePrice: 30,
    photoText: "Осиновихме на 03.05.2023",
    options: std2(
      { label: "10×15 · 3 мм", size: "18×23 см" },
      { label: "13×18 · 4 мм", size: "22×28 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Звездна карта за дата и място",
    slug: "personal-zvezdna-karta",
    category: "personalized",
    description:
      "Карта на звездното небе за конкретна дата, час и място — „Небето над нас“. Премиум персонализиран подарък.",
    basePrice: 52,
    photoText: "15.08.2020 · София",
    options: std2(
      { label: "Кръгла · 3 мм", size: "25 см" },
      { label: "Квадрат · 4 мм · масло", size: "30×30 см", mm: 4, price: 18 },
    ),
  },
  {
    name: "Кутия спомени с отделения",
    slug: "personal-kutiya-spomeni",
    category: "personalized",
    description:
      "Кутия с отделения за билети, снимки и дребни спомени. Капакът е с име, година или послание.",
    basePrice: 46,
    photoText: "Нашите спомени · 2020–",
    options: std2(
      { label: "Средна · 3 мм", size: "20×14×6 см" },
      { label: "Голяма · 4 мм · масло", size: "25×18×7 см", mm: 4, price: 16 },
    ),
  },
  {
    name: "Нощна лампа с име",
    slug: "personal-lampa-ime",
    category: "personalized",
    description:
      "Нощна лампа-кутия с ажурно име или инициали и LED лента. Подходяща за детска, спалня или подарък.",
    basePrice: 54,
    photoText: "Ема",
    options: opts([
      {
        label: "Кутия · 3 мм · LED",
        sizeLabel: "15×10×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Кутия · масло · LED",
        sizeLabel: "15×10×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Табела за стая с име",
    slug: "personal-tabela-staya",
    category: "personalized",
    description:
      "Табела за врата на стая или кабинет — „Стаята на…“, хоби или възраст. Лесна персонализация.",
    basePrice: 18,
    photoText: "Стаята на Никола",
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×8 см" },
      { label: "Голяма · 4 мм", size: "24×10 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Стойка за телефон с монограм",
    slug: "personal-stoika-monogram",
    category: "personalized",
    description:
      "Сгъваема стойка за телефон с гравиран монограм или инициали. Практичен подарък за бюро и пътуване.",
    basePrice: 20,
    photoText: "ДП",
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "10×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Масло · по-дебела",
        sizeLabel: "10×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Ключарница с фамилия",
    slug: "personal-klyucharnitsa",
    category: "personalized",
    description:
      "Стенна ключарница с гравирана фамилия и куки за ключове. Целогодишен декор за антрето.",
    basePrice: 38,
    photoText: "Ключовете на Иванови",
    options: std2(
      { label: "4 куки · 3 мм", size: "25×12 см" },
      { label: "6 куки · 4 мм · масло", size: "30×14 см", mm: 4, price: 12 },
    ),
  },
];
