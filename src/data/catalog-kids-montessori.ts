/**
 * Kids DIY + Montessori laser-cut plywood toys.
 * Prices authored in BGN; converted via pack() in catalog-products.ts.
 * All sizes fit the laser bed (≤ 40×40 cm).
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

export type KidsMontessoriDraft = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  options: SeedOption[];
  /** Bulgarian cue text for the product photo */
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

function sizes3(
  a: { label: string; size: string; mm?: number; price?: number },
  b: { label: string; size: string; mm?: number; price?: number },
  c: { label: string; size: string; mm?: number; price?: number },
): SeedOption[] {
  return opts([
    {
      label: a.label,
      sizeLabel: a.size,
      thicknessMm: a.mm ?? 3,
      laserType: "BOTH",
      priceModifier: a.price ?? 0,
    },
    {
      label: b.label,
      sizeLabel: b.size,
      thicknessMm: b.mm ?? 4,
      laserType: "BOTH",
      priceModifier: b.price ?? 8,
    },
    {
      label: c.label,
      sizeLabel: c.size,
      thicknessMm: c.mm ?? 4,
      laserType: "BOTH",
      finish: "oil",
      priceModifier: c.price ?? 14,
    },
  ]);
}

export const KIDS_MONTESSORI_DRAFTS: KidsMontessoriDraft[] = [
  // —— Направи си сам / оцветяване ——
  {
    name: "3D еленче за сглобяване",
    slug: "detsko-3d-elenche-sglo",
    category: "nursery",
    description:
      "Дървено 3D еленче от брезов шперплат за сглобяване без лепило — частите влизат една в друга. Развива фина моторика и търпение. Подходящо за деца над 3 г., рожден ден или творческа работилница. Може да се оцвети след сглобяване.",
    basePrice: 28,
    photoText: "ЕЛЕНЧЕ",
    options: sizes3(
      { label: "Малко · 3 мм", size: "12×10 см", mm: 3 },
      { label: "Средно · 4 мм", size: "16×14 см", mm: 4, price: 8 },
      { label: "Голямо · масло", size: "20×18 см", mm: 4, price: 14 },
    ),
  },
  {
    name: "Комплект фигури за оцветяване",
    slug: "detski-figuri-ozvetyavane",
    category: "nursery",
    description:
      "Комплект лазерно изрязани дървени фигурки за оцветяване с моливи, маркери или акрилни бои. Небоядисан брезов шперплат, безопасни заоблени ръбове. Идеален за детско творчество, парти и занимания у дома.",
    basePrice: 22,
    photoText: "ОЦВЕТИ МЕ",
    options: sizes3(
      { label: "4 фигури · 3 мм", size: "8×8 см", mm: 3 },
      { label: "6 фигури · 3 мм", size: "10×10 см", mm: 3, price: 10 },
      { label: "8 фигури · 4 мм", size: "12×12 см", mm: 4, price: 18 },
    ),
  },
  {
    name: "Маски за оцветяване",
    slug: "detski-maski-ozvetyavane",
    category: "nursery",
    description:
      "Дървени маски за оцветяване — животни и приказни герои от шперплат. С отвори за очи и място за ластик. Забавна DIY активност за рожден ден, Хелоуин или театрална игра след оцветяване.",
    basePrice: 18,
    photoText: "МАСКА",
    options: sizes3(
      { label: "1 маска · 3 мм", size: "18×14 см", mm: 3 },
      { label: "2 маски · 3 мм", size: "18×14 см", mm: 3, price: 12 },
      { label: "3 маски · 4 мм", size: "20×16 см", mm: 4, price: 20 },
    ),
  },
  {
    name: "Пазел с име за деца",
    slug: "detski-pazel-ime",
    category: "nursery",
    description:
      "Персонализиран дървен пазел с име на детето — лазерно изрязани части от брезов шперплат. Учи буквите чрез игра, подходящ Монтесори-стил подарък за рожден ден, кръщене или първи учебен ден. Изберете име при поръчка.",
    basePrice: 32,
    photoText: "МИЛА",
    options: sizes3(
      { label: "До 5 букви · 3 мм", size: "20×8 см", mm: 3 },
      { label: "До 8 букви · 4 мм", size: "28×10 см", mm: 4, price: 10 },
      { label: "До 10 букви · масло", size: "35×12 см", mm: 4, price: 16 },
    ),
  },
  {
    name: "Лабиринт с топче",
    slug: "detski-labirint-topche",
    category: "nursery",
    description:
      "Дървен лабиринт с топче от шперплат — пътека за контрол на движението и концентрация. Класическа Монтесори сензорна игра без екрани. Стабилен борд, подходящ за възраст 3+. Топчето се включва в комплекта.",
    basePrice: 36,
    photoText: "ЛАБИРИНТ",
    options: sizes3(
      { label: "Компактен · 4 мм", size: "18×18 см", mm: 4 },
      { label: "Среден · 4 мм", size: "24×24 см", mm: 4, price: 10 },
      { label: "Голям · 6 мм", size: "30×30 см", mm: 6, price: 18 },
    ),
  },
  {
    name: "Комплект „Оцвети и играй“",
    slug: "detski-komplekt-ozveti-igrai",
    category: "nursery",
    description:
      "Подаръчен комплект за детско творчество: дървени фигурки за оцветяване, стойка и основа от брезов шперплат. Готов за парти чантички, рожден ден или занималня. Небоядисан материал — детето създава своя свят с бои и маркери.",
    basePrice: 42,
    photoText: "ОЦВЕТИ И ИГРАЙ",
    options: sizes3(
      { label: "Старт · 3 фигури", size: "до 12 см", mm: 3 },
      { label: "Парти · 5 фигури", size: "до 14 см", mm: 3, price: 12 },
      { label: "Макси · 8 фигури", size: "до 16 см", mm: 4, price: 22 },
    ),
  },

  // —— Монтесори ——
  {
    name: "Монтесори сортер форми",
    slug: "montessori-sorter-formi",
    category: "nursery",
    description:
      "Монтесори сортер с геометрични форми — кръг, квадрат, триъгълник и още — от брезов шперплат. Учи разпознаване на форми и фина моторика. Класически сензорен материал за деца 2–5 г., подходящ за домашна Монтесори среда.",
    basePrice: 38,
    photoText: "ФОРМИ",
    options: sizes3(
      { label: "4 форми · 4 мм", size: "20×16 см", mm: 4 },
      { label: "6 форми · 4 мм", size: "24×18 см", mm: 4, price: 10 },
      { label: "8 форми · масло", size: "28×20 см", mm: 4, price: 16 },
    ),
  },
  {
    name: "Монтесори проследяващи букви — кирилица",
    slug: "montessori-bukvi-prosledyavane",
    category: "nursery",
    description:
      "Релефни дървени букви на кирилица за проследяване с пръст — Монтесори подготовка за писане. Лазерно изрязан брезов шперплат с гравиран контур. Помага за запаметяване на формата на буквите преди молив и тетрадка.",
    basePrice: 44,
    photoText: "А Б В",
    options: sizes3(
      { label: "10 букви · 3 мм", size: "6×8 см", mm: 3 },
      { label: "20 букви · 3 мм", size: "6×8 см", mm: 3, price: 14 },
      { label: "Пълна азбука · 4 мм", size: "7×9 см", mm: 4, price: 28 },
    ),
  },
  {
    name: "Монтесори числа и броеве 1–10",
    slug: "montessori-chisla-1-10",
    category: "nursery",
    description:
      "Монтесори сет числа 1–10: релефни цифри и плочки с точки/дупки за броене. Свързва символ и количество чрез допир и броене. Дървен учебно-игрален материал от шперплат за ранна математика у дома или в занималня.",
    basePrice: 40,
    photoText: "1–10",
    options: sizes3(
      { label: "Цифри 1–5 · 3 мм", size: "6×8 см", mm: 3 },
      { label: "Цифри 1–10 · 3 мм", size: "6×8 см", mm: 3, price: 12 },
      { label: "1–10 + плочки · 4 мм", size: "8×10 см", mm: 4, price: 20 },
    ),
  },
  {
    name: "Монтесори дъска с колчета",
    slug: "montessori-peg-board",
    category: "nursery",
    description:
      "Монтесори peg board — дъска с дупки и дървени колчета за подреждане, броене и фигури. Развива пинсетна хватка и концентрация. Спокоен сензорен материал без батерии, подходящ за ежедневна Монтесори практика.",
    basePrice: 40,
    photoText: "КОЛЧЕТА",
    options: sizes3(
      { label: "Малка · 25 колчета", size: "18×18 см", mm: 4 },
      { label: "Средна · 40 колчета", size: "24×24 см", mm: 4, price: 12 },
      { label: "Голяма · 60 колчета", size: "30×30 см", mm: 6, price: 20 },
    ),
  },
  {
    name: "Монтесори цифрови вретена 1–10",
    slug: "montessori-vretena-1-10",
    category: "nursery",
    description:
      "Монтесори цифрови вретена (1–10): кутийки/клетки с цифри и пръчици за броене. Детето поставя точен брой пръчици според цифрата — класическо упражнение за количество. Изработени от брезов шперплат с лазерна прецизност.",
    basePrice: 52,
    photoText: "ВРЕТЕНА",
    options: sizes3(
      { label: "1–5 · 4 мм", size: "28×12 см", mm: 4 },
      { label: "1–10 · 4 мм", size: "36×14 см", mm: 4, price: 14 },
      { label: "1–10 · масло", size: "38×14 см", mm: 4, price: 22 },
    ),
  },
  {
    name: "Монтесори табла за дейности",
    slug: "montessori-tabla-deinosti",
    category: "nursery",
    description:
      "Дървена Монтесори табла с нисък борд — рамка за една дейност (пресипване, сортиране, подреждане). Помага на детето да се фокусира и да прибере материалите самостоятелно. Незаменима основа за домашна Монтесори среда.",
    basePrice: 34,
    photoText: "ТАБЛА",
    options: sizes3(
      { label: "Малка · 4 мм", size: "24×18 см", mm: 4 },
      { label: "Средна · 4 мм", size: "30×22 см", mm: 4, price: 10 },
      { label: "Голяма · 6 мм", size: "35×28 см", mm: 6, price: 18 },
    ),
  },
];
