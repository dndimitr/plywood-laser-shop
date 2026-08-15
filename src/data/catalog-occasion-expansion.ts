/**
 * Extra occasion catalog drafts — wedding, birthday, newborn, baptism,
 * anniversary, Valentine's, christmas, halloween, gifts expansions.
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
    name: "Сватбен топер Mr & Mrs",
    slug: "svatba-toper-mr-mrs",
    category: "wedding",
    description:
      "Класически топер „Mr & Mrs“ от шперплат за сватбената торта. Опция за гравирани фамилия и дата.",
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
      "Ажурна кутия за пликове и парични подаръци с гравирани имена на младоженците. Централен акцент на подаръчната маса.",
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
      "Комплект лазерно изрязани етикети/тагчета за подаръчета на гостите — с инициали или дата на сватбата.",
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
    name: "Табела „Нашите имена“ за арка",
    slug: "svatba-tabela-arka-imena",
    category: "wedding",
    description:
      "Голяма ажурна табела с имена за сватбена арка или фотозона. Чист силует, подходящ за окачване.",
    basePrice: 55,
    options: std2(
      { label: "Средна · 4 мм", size: "50×25 см", mm: 4 },
      { label: "Голяма · 6 мм", size: "70×35 см", mm: 6, price: 20 },
    ),
  },
  {
    name: "Поставка за седнали имена",
    slug: "svatba-postavka-sednali",
    category: "wedding",
    description:
      "Мини табелки „Младоженец / Младоженка“ или с имена за местата на почетната маса.",
    basePrice: 16,
    options: std2(
      { label: "Комплект 2 бр.", size: "10×6 см" },
      { label: "Комплект + масло", size: "12×7 см", price: 6 },
    ),
  },
  {
    name: "Сватбена кутия за бутилка вино",
    slug: "svatba-kutiya-vino",
    category: "wedding",
    description:
      "Дървена кутия/облицовка за бутилка с гравирани имена и дата — подарък за кумове или за младоженците.",
    basePrice: 36,
    options: std2(
      { label: "Стандарт · 4 мм", size: "под бутилка 0.75 л", mm: 4 },
      { label: "Премиум · масло", size: "под бутилка 0.75 л", mm: 4, price: 10 },
    ),
  },

  // —— Рожден ден (разширение) ——
  {
    name: "Голяма цифра за рожден ден (стена/фотозона)",
    slug: "rozhden-golyama-cifra",
    category: "birthday",
    description:
      "Лазерно изрязана голяма цифра от шперплат за фотозона или торта-маса. Изберете възраст при поръчка.",
    basePrice: 24,
    options: std2(
      { label: "40 см · 4 мм", size: "височина ~40 см", mm: 4 },
      { label: "60 см · 6 мм", size: "височина ~60 см", mm: 6, price: 16 },
    ),
  },
  {
    name: "Кутия за пари „Честит рожден ден“",
    slug: "rozhden-kutiya-pari",
    category: "birthday",
    description:
      "Ажурна кутия за паричен подарък с надпис и опция за име на юбиляря.",
    basePrice: 32,
    options: std2(
      { label: "Стандарт · 4 мм", size: "18×12×6 см", mm: 4 },
      { label: "С име · масло", size: "20×14×7 см", mm: 4, price: 10 },
    ),
  },
  {
    name: "Топер с име и години",
    slug: "rozhden-toper-ime-godini",
    category: "birthday",
    description:
      "Персонализиран топер за торта с име и възраст — ясен силует, стабилен шип за торта.",
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
      "Надпис-банер за юбилей от шперплат — за стена или фотозона. Гравиране на години по желание.",
    basePrice: 38,
    options: std2(
      { label: "Среден · 4 мм", size: "60×15 см", mm: 4 },
      { label: "Голям · 6 мм", size: "80×18 см", mm: 6, price: 14 },
    ),
  },
  {
    name: "Плакет „Честит рожден ден“ с име",
    slug: "rozhden-plaket-ime",
    category: "birthday",
    description:
      "Настолен плакет с поздрав и име — подходящ като самостоятелен подарък или допълнение към букет.",
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
      "Табела за изписване от болницата с име на бебето — лек шперплат, чисти ръбове, готов за снимки.",
    basePrice: 26,
    options: std2(
      { label: "Кръгла · 3 мм", size: "Ø 20 см" },
      { label: "Кръгла · масло", size: "Ø 25 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Гирлянда с име на бебето",
    slug: "novorodeno-girlyanda-ime",
    category: "newborn",
    description:
      "Букви от шперплат за гирлянда с името на бебето — за детска стая или парти за изписване.",
    basePrice: 34,
    options: opts([
      {
        label: "До 6 букви · 3 мм",
        sizeLabel: "буква ~10 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "До 10 букви · 4 мм",
        sizeLabel: "буква ~12 см",
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
      "Кутия с разделители за първите спомени — тестове, гривничка, снимки. Гравиране на име и дата.",
    basePrice: 48,
    options: std2(
      { label: "Стандарт · 4 мм", size: "25×18×8 см", mm: 4 },
      { label: "Премиум · масло", size: "30×20×10 см", mm: 6, price: 16 },
    ),
  },
  {
    name: "Мобиле облак / звезди",
    slug: "novorodeno-mobile-oblaci",
    category: "newborn",
    description:
      "Леко мобиле от шперплат с облаци и звезди — над креватчето или за фотозона.",
    basePrice: 42,
    options: std2(
      { label: "Стандарт · 3 мм", size: "Ø ~30 см" },
      { label: "Голямо · 4 мм", size: "Ø ~40 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Рамка за отпечатък на ръчичка",
    slug: "novorodeno-ramka-otpechatak",
    category: "newborn",
    description:
      "Рамка от шперплат с място за отпечатък и гравирано име — спомен за цял живот.",
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
      "Дискретна табела за врата „Бебе спи“ / „Тишина“ — практичен подарък за родители.",
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
      "Топер за торта при кръщене с име на кръщелника и деликатен кръст/орнамент от шперплат.",
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
      "Малка ажурна кутия за кръстче и аксесоари от ритуала — с гравирано име.",
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
      "Декоративна табела с името на кръщелника за масата или фотозоната.",
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
      "Комплект малки етикети/спомени за гостите с име или дата на кръщенето.",
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
    name: "Рамка спомен от кръщене",
    slug: "krashtene-ramka-spomen",
    category: "baptism",
    description:
      "Рамка от шперплат за снимка от кръщенето с гравирани име и дата.",
    basePrice: 30,
    options: std2(
      { label: "10×15 снимка · 4 мм", size: "рамка под 10×15", mm: 4 },
      { label: "13×18 · масло", size: "рамка под 13×18", mm: 4, price: 10 },
    ),
  },
  {
    name: "Поставка за свещ при кръщене",
    slug: "krashtene-postavka-svesht",
    category: "baptism",
    description:
      "Декоративна поставка/облицовка за ритуална свещ с ажурен мотив и име.",
    basePrice: 20,
    options: std2(
      { label: "Стандарт · 3 мм", size: "Ø ~8 см" },
      { label: "С масло", size: "Ø ~9 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Кутия за пари „Честито кръщене“",
    slug: "krashtene-kutiya-pari",
    category: "baptism",
    description:
      "Кутия за парични подаръци при кръщене с поздрав и опция за име.",
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
      "Стенен/настолен надпис за украса на залата — чист шрифт от шперплат.",
    basePrice: 36,
    options: std2(
      { label: "Среден · 4 мм", size: "50×12 см", mm: 4 },
      { label: "Голям · 6 мм", size: "70×15 см", mm: 6, price: 14 },
    ),
  },

  // —— Годишнини (нова категория) ——
  {
    name: "Плакет за юбилей с години",
    slug: "godishnina-plaket-godini",
    category: "anniversary",
    description:
      "Класически плакет от шперплат за юбилей — гравиране на години, имена и поздрав.",
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
      "Кутия за писма, билети и малки спомени — гравирани години и инициали.",
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
      "Ажурно сърце с гравирани години „заедно“ — настолна декорация или стенен акцент.",
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
      "Готов мотив за 10-та годишнина с място за имена — други годишнини по заявка.",
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
      "Декоративен вечен/настолен акцент с гравирана важна дата — годишнина или годеж.",
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
      "Комплект от два ключа/сърца, които пасват едно в друго — с инициали.",
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
      "Рамка от шперплат с надпис и място за снимка — подарък с послание.",
    basePrice: 28,
    options: std2(
      { label: "10×15 · 4 мм", size: "под 10×15", mm: 4 },
      { label: "С масло", size: "под 10×15", mm: 4, price: 8 },
    ),
  },
  {
    name: "Топер сърце за десерт",
    slug: "valentin-toper-sarce",
    category: "valentines",
    description:
      "Малък топер сърце за торта или десерт — с инициали по желание.",
    basePrice: 12,
    options: std2(
      { label: "Стандарт · 3 мм", size: "10×9 см" },
      { label: "С текст", size: "12×10 см", price: 4 },
    ),
  },
  {
    name: "Кутия за пръстен / малък подарък",
    slug: "valentin-kutiya-prasten",
    category: "valentines",
    description:
      "Мини кутия от шперплат за пръстен или бижу — гравиране на инициали.",
    basePrice: 22,
    options: std2(
      { label: "Стандарт · 4 мм", size: "8×8×4 см", mm: 4 },
      { label: "С масло", size: "8×8×4 см", mm: 4, price: 6 },
    ),
  },
  {
    name: "Табела „Ти + Аз“",
    slug: "valentin-tabela-ti-az",
    category: "valentines",
    description:
      "Настолна табела с надпис за двойка — имена или „Ти + Аз“ с дата.",
    basePrice: 20,
    options: std2(
      { label: "Стандарт · 3 мм", size: "18×10 см" },
      { label: "С масло", size: "20×12 см", mm: 4, price: 7 },
    ),
  },

  // —— Коледа (разширение) ——
  {
    name: "Орнамент с име на семейството",
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
      "Стенна/входна табела с поздрав и фамилия — коледен акцент за дома.",
    basePrice: 30,
    options: std2(
      { label: "Средна · 4 мм", size: "35×15 см", mm: 4 },
      { label: "Голяма · масло", size: "45×18 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Кутия за коледни сладки",
    slug: "koleda-kutiya-sladki",
    category: "christmas",
    description:
      "Ажурна кутия за сладки и малки подаръци — гравиране на име по желание.",
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
      "Сглобяема настолна елхичка — ажурен силует за маса или рафт.",
    basePrice: 22,
    options: std2(
      { label: "Средна · 3 мм", size: "височина ~20 см" },
      { label: "Голяма · 4 мм", size: "височина ~28 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Адвент календар от шперплат",
    slug: "koleda-advent-kalendar",
    category: "christmas",
    description:
      "Адвент рамка/календар с прозорчета за малки изненади — персонализация с име.",
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
      "Ажурен коледен венец за врата или стена — с опция за гравирана фамилия.",
    basePrice: 34,
    options: std2(
      { label: "Ø30 см · 4 мм", size: "диаметър ~30 см", mm: 4 },
      { label: "Ø40 см · масло", size: "диаметър ~40 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Комплект коледни орнаменти с имена",
    slug: "koleda-komplekt-ornamenti-imena",
    category: "christmas",
    description:
      "Комплект от няколко орнамента с различни имена — идеален семеен подарък.",
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
    name: "Хелоуин банер „Happy Halloween“",
    slug: "helouin-baner",
    category: "halloween",
    description:
      "Надпис-банер за хелоуин парти или витрина — ажурни букви от шперплат.",
    basePrice: 32,
    options: std2(
      { label: "Среден · 3 мм", size: "55×12 см" },
      { label: "Голям · 4 мм", size: "75×15 см", mm: 4, price: 12 },
    ),
  },
  {
    name: "Тиква свещник (ажурна)",
    slug: "helouin-tikva-sveshtnik",
    category: "halloween",
    description:
      "Ажурна тиква-свещник от шперплат за LED свещ — атмосфера без открит пламък.",
    basePrice: 19,
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×12 см" },
      { label: "Голяма · 4 мм", size: "16×16 см", mm: 4, price: 7 },
    ),
  },
  {
    name: "Скелет подвижна фигурка",
    slug: "helouin-skelet",
    category: "halloween",
    description:
      "Ажурен скелет от шперплат — настолна или окачваща декорация за парти.",
    basePrice: 21,
    options: std2(
      { label: "Среден · 3 мм", size: "височина ~25 см" },
      { label: "Голям · 4 мм", size: "височина ~35 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Вещица силует",
    slug: "helouin-veshtica",
    category: "halloween",
    description:
      "Силует на вещица за прозорец, стена или фотозона — лек и ефектен.",
    basePrice: 18,
    options: std2(
      { label: "Средна · 3 мм", size: "20×25 см" },
      { label: "Голяма · 4 мм", size: "28×35 см", mm: 4, price: 8 },
    ),
  },
  {
    name: "Призрак / дух фигурка",
    slug: "helouin-duh",
    category: "halloween",
    description:
      "Мила или страшна фигурка на дух — за маса, рафт или витрина.",
    basePrice: 14,
    options: std2(
      { label: "Стандарт · 3 мм", size: "12×15 см" },
      { label: "Голям · 4 мм", size: "16×20 см", mm: 4, price: 5 },
    ),
  },
  {
    name: "Хелоуин комплект фигурки",
    slug: "helouin-komplekt-figurki",
    category: "halloween",
    description:
      "Комплект от няколко хелоуин героя (тиква, дух, прилеп) — готов сет за декорация.",
    basePrice: 38,
    options: opts([
      {
        label: "3 бр. · 3 мм",
        sizeLabel: "микс ~12 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "5 бр. · 4 мм",
        sizeLabel: "микс ~14 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 14,
      },
    ]),
  },

  // —— Универсални подаръци (разширение) ——
  {
    name: "Гравирана дъска за мезета с текст",
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
      "Оригинален „плик“ от шперплат за паричен подарък — с поздрав и име.",
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
      "Мини стойка/облицовка за бутилка с гравирани имена — универсален подарък.",
    basePrice: 29,
    options: std2(
      { label: "Стандарт · 4 мм", size: "под 0.75 л", mm: 4 },
      { label: "Премиум · масло", size: "под 0.75 л", mm: 4, price: 9 },
    ),
  },
  {
    name: "Гравирана картичка от шперплат",
    slug: "podaraci-kartichka-darvena",
    category: "gifts",
    description:
      "Дървена картичка с поздрав — по-траен жест от хартиена. Текст по ваш избор.",
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
