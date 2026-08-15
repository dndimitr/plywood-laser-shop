/**
 * Extra occasion catalog drafts — wedding, birthday, newborn, baptism,
 * anniversary, Valentine's, christmas, halloween, gifts expansions.
 *
 * Names and descriptions are storefront Bulgarian copy.
 * All single-piece sizes fit the laser bed (≤ 40×40 cm).
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

export type OccasionDraft = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  options: SeedOption[];
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

/** Additional occasion products appended to the main catalog. */
export const OCCASION_EXPANSION_DRAFTS: OccasionDraft[] = [
  // —— Сватба (разширение) ——
  {
    name: "Топер за сватбена торта „Mr & Mrs“",
    slug: "svatba-toper-mr-mrs",
    category: "wedding",
    description:
      "Класически топер с надпис „Mr & Mrs“ от брезов шперплат. По желание гравираме фамилия и дата на сватбата.",
    basePrice: 18,
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×10 см" },
      { label: "Голям · масло", size: "20×12 см", price: 7 },
    ),
  },
  {
    name: "Кутия за парични подаръци „Сватба“",
    slug: "svatba-kutiya-pari",
    category: "wedding",
    description:
      "Ажурна кутия за пликове и парични подаръци с гравирани имена на младоженците. Подходяща за подаръчната маса.",
    basePrice: 42,
    options: std2(
      { label: "Средна · 4 мм", size: "25×18×8 см", mm: 4 },
      { label: "Голяма · масло", size: "30×22×10 см", mm: 6, price: 14 },
    ),
  },
  {
    name: "Сватбени етикети за гости",
    slug: "svatba-etiketi-gosti",
    category: "wedding",
    description:
      "Комплект лазерно изрязани етикети за подаръчетата на гостите. Гравираме инициали или дата на сватбата.",
    basePrice: 28,
    options: opts([
      {
        label: "20 бр. · 3 мм",
        sizeLabel: "5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "50 бр. · масло",
        sizeLabel: "5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Табела с имена за сватбена арка",
    slug: "svatba-tabela-arka-imena",
    category: "wedding",
    description:
      "Голяма ажурна табела с имената на младоженците — за арка, фотозона или стена. Чист силует до 40×40 см, готов за окачване.",
    basePrice: 55,
    options: std2(
      { label: "Средна · 4 мм", size: "40×20 см", mm: 4 },
      { label: "Голяма · 6 мм", size: "40×25 см", mm: 6, price: 20 },
    ),
  },
  {
    name: "Табелки за местата на младоженците",
    slug: "svatba-postavka-sednali",
    category: "wedding",
    description:
      "Комплект от две мини табелки за почетната маса — „Младоженец“ и „Младоженка“ или с вашите имена.",
    basePrice: 16,
    options: std2(
      { label: "Комплект 2 бр.", size: "10×6 см" },
      { label: "Комплект · масло", size: "12×7 см", price: 6 },
    ),
  },
  {
    name: "Кутия за бутилка вино — сватбен подарък",
    slug: "svatba-kutiya-vino",
    category: "wedding",
    description:
      "Кутия от шперплат за бутилка вино с гравирани имена и дата. Подходяща за кумове или за младоженците.",
    basePrice: 36,
    options: std2(
      { label: "Стандарт · 4 мм", size: "за бутилка 0,75 л", mm: 4 },
      { label: "Премиум · масло", size: "за бутилка 0,75 л", mm: 4, price: 10 },
    ),
  },

  // —— Рожден ден (разширение) ——
  {
    name: "Голяма цифра за рожден ден",
    slug: "rozhden-golyama-cifra",
    category: "birthday",
    description:
      "Лазерно изрязана цифра от шперплат за фотозона или декорация около тортата (до 40 см). Посочете възрастта при поръчка.",
    basePrice: 24,
    options: std2(
      { label: "30 см · 4 мм", size: "височина около 30 см", mm: 4 },
      { label: "40 см · 6 мм", size: "височина около 40 см", mm: 6, price: 16 },
    ),
  },
  {
    name: "Кутия за пари „Честит рожден ден“",
    slug: "rozhden-kutiya-pari",
    category: "birthday",
    description:
      "Ажурна кутия за паричен подарък с поздрав. По желание добавяме името на юбиляря.",
    basePrice: 32,
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12×6 см", mm: 4 },
      { label: "С име · масло", size: "20×14×7 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Топер за торта с име и години",
    slug: "rozhden-toper-ime-godini",
    category: "birthday",
    description:
      "Персонализиран топер от шперплат с име и възраст. Ясен силует и стабилен щифт за торта.",
    basePrice: 16,
    options: std2(
      { label: "Стандарт · 3 мм", size: "14×12 см" },
      { label: "Голям · 4 мм", size: "18×15 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Банер „Честит юбилей“",
    slug: "rozhden-baner-yubiley",
    category: "birthday",
    description:
      "Надпис от шперплат за юбилей — за стена или фотозона. По желание гравираме години.",
    basePrice: 38,
    options: std2(
      { label: "Среден · 4 мм", size: "40×12 см", mm: 4 },
      { label: "Голям · 6 мм", size: "40×18 см", mm: 6, price: 14 },
    ),
  },
  {
    name: "Плакет „Честит рожден ден“ с име",
    slug: "rozhden-plaket-ime",
    category: "birthday",
    description:
      "Настолен плакет с поздрав и име. Подходящ като самостоятелен подарък или към букет.",
    basePrice: 22,
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12 см", mm: 4 },
      { label: "Премиум · масло", size: "22×14 см", mm: 4, price: 8 },
    ),
  },

  // —— Новородено (разширение) ——
  {
    name: "Табела за изписване с име",
    slug: "novorodeno-tabela-izpisvane",
    category: "newborn",
    description:
      "Табела за изписване от болницата с името на бебето. Лек шперплат, чисти ръбове — готова за снимки.",
    basePrice: 26,
    options: std2(
      { label: "Кръгла · 3 мм", size: "Ø 20 см" },
      { label: "Кръгла · масло", size: "Ø 25 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Гирлянда с името на бебето",
    slug: "novorodeno-girlyanda-ime",
    category: "newborn",
    description:
      "Букви от шперплат за гирлянда с името на бебето. За детската стая или партито за изписване.",
    basePrice: 34,
    options: opts([
      {
        label: "До 6 букви · 3 мм",
        sizeLabel: "буква около 10 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "До 10 букви · 4 мм",
        sizeLabel: "буква около 12 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Кутия „Първите спомени“",
    slug: "novorodeno-kutiya-parvi-spomeni",
    category: "newborn",
    description:
      "Кутия с разделители за първите спомени — тестове, гривничка, снимки. Гравираме име и дата.",
    basePrice: 48,
    options: std2(
      { label: "Стандарт · 4 мм", size: "25×18×8 см", mm: 4 },
      { label: "Премиум · масло", size: "30×20×10 см", mm: 6, price: 16 },
    ),
  },
  {
    name: "Мобил с облаци и звезди",
    slug: "novorodeno-mobile-oblaci",
    category: "newborn",
    description:
      "Лек висящ мобил от шперплат с облаци и звезди. За над креватчето или за фотозона.",
    basePrice: 42,
    options: std2(
      { label: "Стандарт · 3 мм", size: "Ø около 30 см" },
      { label: "Голям · 4 мм", size: "Ø около 40 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Рамка за отпечатък на ръчичка",
    slug: "novorodeno-ramka-otpechatak",
    category: "newborn",
    description:
      "Рамка от шперплат с място за отпечатък и гравирано име — траен спомен от първите дни.",
    basePrice: 28,
    options: std2(
      { label: "Стандарт · 4 мм", size: "20×25 см", mm: 4 },
      { label: "С масло", size: "20×25 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Табела „Бебе спи“",
    slug: "novorodeno-tabela-bebe-spi",
    category: "newborn",
    description:
      "Дискретна табела за вратата с надпис „Бебе спи“ или „Тишина“. Практичен подарък за родителите.",
    basePrice: 16,
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×8 см" },
      { label: "С масло", size: "15×8 см", price: 4 },
    ),
  },

  // —— Кръщене (нова категория) ——
  {
    name: "Топер за кръщене с име",
    slug: "krashtene-toper-ime",
    category: "baptism",
    description:
      "Топер за тортата при кръщене с името на кръщелника и деликатен кръст от шперплат.",
    basePrice: 17,
    options: std2(
      { label: "Стандарт · 3 мм", size: "14×12 см" },
      { label: "Голям · 4 мм", size: "18×15 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Кутия за кръстче",
    slug: "krashtene-kutiya-krastche",
    category: "baptism",
    description:
      "Малка ажурна кутия за кръстчето и аксесоарите от ритуала. С гравирано име по желание.",
    basePrice: 28,
    options: std2(
      { label: "Стандарт · 4 мм", size: "12×12×5 см", mm: 4 },
      { label: "С масло", size: "14×14×5 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Табела с име за кръщене",
    slug: "krashtene-tabela-ime",
    category: "baptism",
    description:
      "Декоративна табела с името на кръщелника — за масата или фотозоната.",
    basePrice: 24,
    options: std2(
      { label: "Средна · 3 мм", size: "25×12 см" },
      { label: "Голяма · масло", size: "35×15 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Етикети за гости при кръщене",
    slug: "krashtene-etiketi-gosti",
    category: "baptism",
    description:
      "Комплект малки етикети за гостите с име или дата на кръщенето.",
    basePrice: 26,
    options: opts([
      {
        label: "20 бр. · 3 мм",
        sizeLabel: "5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "40 бр.",
        sizeLabel: "5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Рамка — спомен от кръщенето",
    slug: "krashtene-ramka-spomen",
    category: "baptism",
    description:
      "Рамка от шперплат за снимка от кръщенето с гравирани име и дата.",
    basePrice: 30,
    options: std2(
      { label: "За снимка 10×15 · 4 мм", size: "рамка за 10×15", mm: 4 },
      { label: "За снимка 13×18 · масло", size: "рамка за 13×18", mm: 4, price: 10 },
    ),
  },
  {
    name: "Поставка за свещ при кръщене",
    slug: "krashtene-postavka-svesht",
    category: "baptism",
    description:
      "Декоративна поставка за ритуалната свещ с ажурен мотив и място за име.",
    basePrice: 20,
    options: std2(
      { label: "Стандарт · 3 мм", size: "Ø около 8 см" },
      { label: "С масло", size: "Ø около 9 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Кутия за пари „Честито кръщене“",
    slug: "krashtene-kutiya-pari",
    category: "baptism",
    description:
      "Кутия за парични подаръци при кръщене с поздрав. По желание добавяме име.",
    basePrice: 34,
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12×6 см", mm: 4 },
      { label: "С име · масло", size: "20×14×7 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Надпис „Честито кръщене“",
    slug: "krashtene-nadpis",
    category: "baptism",
    description:
      "Надпис от шперплат за украса на залата — стенен или настолен, с чист шрифт.",
    basePrice: 36,
    options: std2(
      { label: "Среден · 4 мм", size: "40×10 см", mm: 4 },
      { label: "Голям · 6 мм", size: "40×15 см", mm: 6, price: 14 },
    ),
  },

  // —— Годишнини (нова категория) ——
  {
    name: "Плакет за юбилей с години",
    slug: "godishnina-plaket-godini",
    category: "anniversary",
    description:
      "Класически плакет от шперплат за юбилей. Гравираме години, имена и поздрав.",
    basePrice: 28,
    options: std2(
      { label: "25×17 см · 4 мм", size: "25×17 см", mm: 4 },
      { label: "30×20 см · масло", size: "30×20 см", mm: 6, price: 12 },
    ),
  },
  {
    name: "Табела „Честита годишнина“",
    slug: "godishnina-tabela-chestita",
    category: "anniversary",
    description:
      "Декоративна табела за сватбена годишнина с имена и дата на брака.",
    basePrice: 32,
    options: std2(
      { label: "Средна · 4 мм", size: "30×15 см", mm: 4 },
      { label: "Голяма · масло", size: "40×18 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Кутия спомен за годишнина",
    slug: "godishnina-kutiya-spomen",
    category: "anniversary",
    description:
      "Кутия за писма, билети и малки спомени с гравирани години и инициали.",
    basePrice: 40,
    options: std2(
      { label: "Стандарт · 4 мм", size: "22×16×7 см", mm: 4 },
      { label: "Премиум · масло", size: "26×18×8 см", mm: 6, price: 14 },
    ),
  },
  {
    name: "Сърце с години заедно",
    slug: "godishnina-sarce-godini",
    category: "anniversary",
    description:
      "Ажурно сърце с гравирани години заедно — за маса или като стенен акцент.",
    basePrice: 18,
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×14 см" },
      { label: "Голямо · масло", size: "22×20 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Плакет „10 години заедно“",
    slug: "godishnina-plaket-10",
    category: "anniversary",
    description:
      "Плакет за десетата годишнина с място за имена. Други годишнини изработваме по заявка.",
    basePrice: 26,
    options: std2(
      { label: "Стандарт · 4 мм", size: "22×15 см", mm: 4 },
      { label: "С масло", size: "22×15 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Настолен календар „Нашата дата“",
    slug: "godishnina-kalendar-data",
    category: "anniversary",
    description:
      "Настолна декорация с гравирана важна дата — годишнина, годеж или друга лична дата.",
    basePrice: 24,
    options: std2(
      { label: "Стандарт · 4 мм", size: "16×12 см", mm: 4 },
      { label: "Премиум · масло", size: "18×14 см", mm: 4, price: 8 },
    ),
  },

  // —— Свети Валентин (нова категория) ——
  {
    name: "Сърце с имена за Свети Валентин",
    slug: "valentin-sarce-imena",
    category: "valentines",
    description:
      "Лазерно изрязано сърце с гравирани имена или инициали — класически жест за 14 февруари.",
    basePrice: 15,
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×11 см" },
      { label: "Голямо · масло", size: "18×16 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Ключодържатели за двойка",
    slug: "valentin-klyuchodarzhateli-dvoika",
    category: "valentines",
    description:
      "Комплект от два ключодържателя във форма на сърца, които се пасват едно в друго. С инициали по желание.",
    basePrice: 18,
    options: std2(
      { label: "Комплект · 3 мм", size: "6×4 см" },
      { label: "С масло", size: "6×4 см", price: 5 },
    ),
  },
  {
    name: "Рамка „Обичам те“",
    slug: "valentin-ramka-obicham-te",
    category: "valentines",
    description:
      "Рамка от шперплат с надпис и място за снимка — подарък с лично послание.",
    basePrice: 28,
    options: std2(
      { label: "За 10×15 · 4 мм", size: "за снимка 10×15", mm: 4 },
      { label: "С масло", size: "за снимка 10×15", mm: 4, price: 8 },
    ),
  },
  {
    name: "Топер сърце за десерт",
    slug: "valentin-toper-sarce",
    category: "valentines",
    description:
      "Малък топер във форма на сърце за торта или десерт. По желание с инициали.",
    basePrice: 12,
    options: std2(
      { label: "Стандарт · 3 мм", size: "10×9 см" },
      { label: "С текст", size: "12×10 см", price: 4 },
    ),
  },
  {
    name: "Кутия за пръстен или малък подарък",
    slug: "valentin-kutiya-prasten",
    category: "valentines",
    description:
      "Мини кутия от шперплат за пръстен или бижу. Гравираме инициали по желание.",
    basePrice: 22,
    options: std2(
      { label: "Стандарт · 4 мм", size: "8×8×4 см", mm: 4 },
      { label: "С масло", size: "8×8×4 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Табела „Ти и аз“",
    slug: "valentin-tabela-ti-az",
    category: "valentines",
    description:
      "Настолна табела за двойка — с имена, дата или надпис „Ти и аз“.",
    basePrice: 20,
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×10 см" },
      { label: "С масло", size: "20×12 см", mm: 4, price: 7 },
    ),
  },

  // —— Коледа (разширение) ——
  {
    name: "Орнамент с имената на семейството",
    slug: "koleda-ornament-semeistvo",
    category: "christmas",
    description:
      "Коледен орнамент от шперплат с гравирани имена на семейството — за елхата.",
    basePrice: 14,
    options: std2(
      { label: "Стандарт · 3 мм", size: "9×9 см" },
      { label: "Комплект 4 бр.", size: "9×9 см", price: 28 },
    ),
  },
  {
    name: "Табела „Весела Коледа“ с фамилия",
    slug: "koleda-tabela-familiya",
    category: "christmas",
    description:
      "Табела за стена или вход с поздрав и фамилия — коледен акцент за дома.",
    basePrice: 30,
    options: std2(
      { label: "Средна · 4 мм", size: "35×15 см", mm: 4 },
      { label: "Голяма · масло", size: "40×18 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Кутия за коледни сладки",
    slug: "koleda-kutiya-sladki",
    category: "christmas",
    description:
      "Ажурна кутия за сладки и малки подаръци. По желание гравираме име.",
    basePrice: 26,
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×15×5 см" },
      { label: "С масло", size: "18×18×6 см", mm: 4, price: 9 },
    ),
  },
  {
    name: "Настолна елхичка от шперплат",
    slug: "koleda-nastolna-elhichka",
    category: "christmas",
    description:
      "Сглобяема настолна елхичка с ажурен силует — за маса или рафт.",
    basePrice: 22,
    options: std2(
      { label: "Средна · 3 мм", size: "височина около 20 см" },
      { label: "Голяма · 4 мм", size: "височина около 28 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Адвент календар от шперплат",
    slug: "koleda-advent-kalendar",
    category: "christmas",
    description:
      "Адвент календар с прозорчета за малки изненади. По желание персонализираме с име.",
    basePrice: 48,
    options: std2(
      { label: "24 клетки · 4 мм", size: "40×30 см", mm: 4 },
      { label: "С масло", size: "40×30 см", mm: 4, price: 14 },
    ),
  },
  {
    name: "Венец „Весела Коледа“",
    slug: "koleda-venets",
    category: "christmas",
    description:
      "Ажурен коледен венец за врата или стена. По желание с гравирана фамилия.",
    basePrice: 34,
    options: std2(
      { label: "Ø 30 см · 4 мм", size: "диаметър около 30 см", mm: 4 },
      { label: "Ø 40 см · масло", size: "диаметър около 40 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Комплект коледни орнаменти с имена",
    slug: "koleda-komplekt-ornamenti-imena",
    category: "christmas",
    description:
      "Комплект орнаменти с различни имена — подходящ семеен коледен подарък.",
    basePrice: 36,
    options: opts([
      {
        label: "4 бр. · 3 мм",
        sizeLabel: "9×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "6 бр. · масло",
        sizeLabel: "9×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },

  // —— Хелоуин (разширение) ——
  {
    name: "Банер „Честит Хелоуин“",
    slug: "helouin-baner",
    category: "halloween",
    description:
      "Надпис-банер от шперплат за хелоуин парти или витрина — ажурни букви.",
    basePrice: 32,
    options: std2(
      { label: "Среден · 3 мм", size: "40×10 см" },
      { label: "Голям · 4 мм", size: "40×15 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Ажурна тиква свещник",
    slug: "helouin-tikva-sveshtnik",
    category: "halloween",
    description:
      "Ажурна тиква-свещник от шперплат за LED свещ — уютна атмосфера без открит пламък.",
    basePrice: 19,
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×12 см" },
      { label: "Голяма · 4 мм", size: "16×16 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Фигурка скелет за Хелоуин",
    slug: "helouin-skelet",
    category: "halloween",
    description:
      "Ажурен скелет от шперплат — за маса или за окачване на парти.",
    basePrice: 21,
    options: std2(
      { label: "Среден · 3 мм", size: "височина около 25 см" },
      { label: "Голям · 4 мм", size: "височина около 35 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Силует на вещица",
    slug: "helouin-veshtica",
    category: "halloween",
    description:
      "Силует на вещица от шперплат за прозорец, стена или фотозона — лек и ефектен.",
    basePrice: 18,
    options: std2(
      { label: "Средна · 3 мм", size: "20×25 см" },
      { label: "Голяма · 4 мм", size: "28×35 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Фигурка дух за Хелоуин",
    slug: "helouin-duh",
    category: "halloween",
    description:
      "Фигурка на дух от шперплат — за маса, рафт или витрина. Изберете по-мил или по-страшен вариант при поръчка.",
    basePrice: 14,
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×15 см" },
      { label: "Голям · 4 мм", size: "16×20 см", mm: 4, price: 5 },
    ),
  },
  {
    name: "Комплект фигурки за Хелоуин",
    slug: "helouin-komplekt-figurki",
    category: "halloween",
    description:
      "Комплект хелоуински фигурки — тиква, дух и прилеп. Готов набор за декорация.",
    basePrice: 38,
    options: opts([
      {
        label: "3 бр. · 3 мм",
        sizeLabel: "микс около 12 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "5 бр. · 4 мм",
        sizeLabel: "микс около 14 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 14,
      },
    ]),
  },

  // —— Универсални подаръци (разширение) ——
  {
    name: "Гравирана дъска за мезета",
    slug: "podaraci-daska-mezeta",
    category: "gifts",
    description:
      "Сервизна дъска от шперплат с гравиран текст — подарък за домакини и юбилеи.",
    basePrice: 35,
    options: std2(
      { label: "Средна · 6 мм", size: "30×20 см", mm: 6 },
      { label: "Голяма · масло", size: "40×25 см", mm: 6, price: 14 },
    ),
  },
  {
    name: "Плик за пари от шперплат",
    slug: "podaraci-plik-pari",
    category: "gifts",
    description:
      "Оригинален плик от шперплат за паричен подарък — с поздрав и име по желание.",
    basePrice: 16,
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×10 см" },
      { label: "С масло", size: "18×10 см", price: 5 },
    ),
  },
  {
    name: "Стойка за вино с гравиране",
    slug: "podaraci-stoika-vino",
    category: "gifts",
    description:
      "Стойка за бутилка вино с гравирани имена — универсален подарък за всякакъв повод.",
    basePrice: 29,
    options: std2(
      { label: "Стандарт · 4 мм", size: "за бутилка 0,75 л", mm: 4 },
      { label: "Премиум · масло", size: "за бутилка 0,75 л", mm: 4, price: 9 },
    ),
  },
  {
    name: "Гравирана картичка от шперплат",
    slug: "podaraci-kartichka-darvena",
    category: "gifts",
    description:
      "Картичка от шперплат с поздрав — по-траен жест от хартиена. Текст по ваш избор.",
    basePrice: 14,
    options: std2(
      { label: "Стандарт · 3 мм", size: "15×10 см" },
      { label: "С масло", size: "15×10 см", price: 4 },
    ),
  },
  {
    name: "Магнит с послание",
    slug: "podaraci-magnet-poslanie",
    category: "gifts",
    description:
      "Магнит от шперплат с кратко послание или име — малък, но личен подарък.",
    basePrice: 10,
    options: std2(
      { label: "Стандарт · 3 мм", size: "7×5 см" },
      { label: "Комплект 3 бр.", size: "7×5 см", price: 14 },
    ),
  },
  {
    name: "Кутия „Отвори когато…“",
    slug: "podaraci-kutiya-otvori-kogato",
    category: "gifts",
    description:
      "Кутия с гравиран надпис за писма или малки жестове — романтичен или приятелски подарък.",
    basePrice: 32,
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12×6 см", mm: 4 },
      { label: "Премиум · масло", size: "20×14×7 см", mm: 4, price: 10 },
    ),
  },
];
