/**
 * Original shop catalog inspired by popular laser-cut plywood categories
 * (Etsy / handmade marketplaces). Names, copy and SKUs are original —
 * not scraped or copied from third-party listings.
 *
 * Draft amounts below are authored in BGN and converted to EUR in `pack()`.
 */

import { bgnToEur } from "@/lib/currency";
import { OCCASION_EXPANSION_DRAFTS } from "./catalog-occasion-expansion";

export type SeedLaserType = "ENGRAVE" | "CUT" | "BOTH";

export type SeedOption = {
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: SeedLaserType;
  material: string;
  finish: string;
  doubleSided: boolean;
  priceModifier: number;
};

export type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  galleryUrls: string[];
  options: SeedOption[];
};

function imgs(slug: string): { imageUrl: string; galleryUrls: string[] } {
  const photo = `/products/photos/${slug}.png`;
  return { imageUrl: photo, galleryUrls: [photo] };
}

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

type Draft = {
  name: string;
  slug: string;
  category: string;
  description: string;
  basePrice: number;
  options: SeedOption[];
};

function pack(drafts: Draft[]): SeedProduct[] {
  return drafts.map((d) => ({
    ...d,
    basePrice: bgnToEur(d.basePrice),
    options: d.options.map((o) => ({
      ...o,
      priceModifier: bgnToEur(o.priceModifier),
    })),
    ...imgs(d.slug),
  }));
}

const DRAFTS: Draft[] = [
  // —— Ключодържатели ——
  {
    name: "Ключодържател с гравирано име",
    slug: "klyuchodarzhatel-ime",
    category: "keychains",
    description:
      "Персонализиран ключодържател от брезов шперплат с лазерно гравиране на име или инициали. Подходящ за подарък и ежедневна употреба.",
    basePrice: 12,
    options: opts([
      {
        label: "Малък · 3 мм · гравиране",
        sizeLabel: "4×6 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Среден · 4 мм · двустранно",
        sizeLabel: "5×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Ключодържател сърце",
    slug: "klyuchodarzhatel-sarce",
    category: "keychains",
    description:
      "Ажурно изрязано сърце с опция за гравиран текст отвътре. Класически подарък за Свети Валентин и годишнини.",
    basePrice: 11,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "5×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "6×6 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Ключодържател с регистрационен номер",
    slug: "klyuchodarzhatel-reg-nomer",
    category: "keychains",
    description:
      "Правоъгълен таг с гравиран регистрационен номер или гаражен код. За автомобилни ключове и автоподаръци.",
    basePrice: 14,
    options: opts([
      {
        label: "Компактен · 3 мм",
        sizeLabel: "3×7 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "С контур · 4 мм",
        sizeLabel: "4×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Ключодържател зодия",
    slug: "klyuchodarzhatel-zodiya",
    category: "keychains",
    description:
      "Силует на зодия с фино гравиране. Изберете знак и опционално дата на раждане.",
    basePrice: 13,
    options: opts([
      {
        label: "Кръгъл · 3 мм",
        sizeLabel: "ø5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Двустранен · масло",
        sizeLabel: "ø5.5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Ключодържател къща с адрес",
    slug: "klyuchodarzhatel-kashta",
    category: "keychains",
    description:
      "Миниатюрна къща с гравиран уличен адрес или име на семейство. Подарък при нанасяне в нов дом.",
    basePrice: 15,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "4×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Детайлен · 4 мм",
        sizeLabel: "5×6 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Ключодържател силует домашен любимец",
    slug: "klyuchodarzhatel-lubimets",
    category: "keychains",
    description:
      "Силует на куче или котка по порода или по ваш контур. Добавете име на любимеца.",
    basePrice: 14,
    options: opts([
      {
        label: "По порода · 3 мм",
        sizeLabel: "4×5 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "По файл · 4 мм",
        sizeLabel: "5×6 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Ключодържател с QR код",
    slug: "klyuchodarzhatel-qr",
    category: "keychains",
    description:
      "Гравиран QR код към сайт, визитка или безжична мрежа. Практичен корпоративен и личен аксесоар.",
    basePrice: 16,
    options: opts([
      {
        label: "Квадрат · 3 мм",
        sizeLabel: "4×4 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "С рамка · лак",
        sizeLabel: "5×5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Комплект ключодържатели за гости",
    slug: "komplekt-klyuchodarzhateli-gosti",
    category: "keychains",
    description:
      "Мини ключодържатели за сватбени или фирмени гости. Еднакъв макет, индивидуални инициали по желание.",
    basePrice: 9,
    options: opts([
      {
        label: "От 10 бр. · 3 мм",
        sizeLabel: "3×4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "От 25 бр. · масло",
        sizeLabel: "3×4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 2,
      },
    ]),
  },

  // —— Табели ——
  {
    name: "Табела за врата",
    slug: "tabela-vrata",
    category: "signs",
    description:
      "Табела от шперплат с гравиран текст по ваш избор. За дом, офис или входна врата.",
    basePrice: 28,
    options: opts([
      {
        label: "A5 · 4 мм · гравиране",
        sizeLabel: "15×21 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "A4 · дъб · лак · 6 мм",
        sizeLabel: "21×30 см",
        thicknessMm: 6,
        laserType: "BOTH",
        material: "oak-veneer",
        finish: "lacquer",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Семейна табела с фамилия",
    slug: "semeina-tabela-familiya",
    category: "signs",
    description:
      "Класическа стенна табела с фамилия и година на основаване на дома. Популярен модел за хол и вход.",
    basePrice: 42,
    options: opts([
      {
        label: "Среден · 4 мм",
        sizeLabel: "30×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голям · масло · 6 мм",
        sizeLabel: "45×20 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Табела „Добре дошли“",
    slug: "welcome-tabela",
    category: "signs",
    description:
      "Декоративна входна табела с надпис „Добре дошли“ и ажурен орнамент. За врата, коридор или тераса.",
    basePrice: 36,
    options: opts([
      {
        label: "Хоризонтална · 4 мм",
        sizeLabel: "35×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С рамка · 6 мм",
        sizeLabel: "40×18 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Табела за кабинет / офис",
    slug: "tabela-kabinet",
    category: "signs",
    description:
      "Професионална табела с име, длъжност или кабинет. Чист шрифт и опция за лого.",
    basePrice: 32,
    options: opts([
      {
        label: "Стандартен · 4 мм",
        sizeLabel: "20×10 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "С лого · лак",
        sizeLabel: "25×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Адресна табела за къща",
    slug: "adresna-tabela",
    category: "signs",
    description:
      "Външна адресна табела с номер и улица. Препоръчваме лак за по-добра устойчивост.",
    basePrice: 48,
    options: opts([
      {
        label: "Номер · 6 мм",
        sizeLabel: "15×15 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 0,
      },
      {
        label: "Номер + улица · 6 мм",
        sizeLabel: "30×15 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Табела Отворено / Затворено",
    slug: "tabela-otvoreno-zatvoreno",
    category: "venues",
    description:
      "Двустранна или въртяща се табела за магазин и кафене. Гравиран текст на български или английски.",
    basePrice: 34,
    options: opts([
      {
        label: "Двустранна · 4 мм",
        sizeLabel: "20×10 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        doubleSided: true,
        priceModifier: 0,
      },
      {
        label: "С държач · 6 мм",
        sizeLabel: "22×12 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Табела за тоалетна и баня",
    slug: "tabela-wc",
    category: "signs",
    description:
      "Дискретна пиктограма или текст за тоалетна и баня. Подходяща за дом, хотел и офис.",
    basePrice: 18,
    options: opts([
      {
        label: "Пиктограма · 3 мм",
        sizeLabel: "10×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С текст · 4 мм",
        sizeLabel: "12×8 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Табела „Моля, свалете обувките“",
    slug: "tabela-obuvki",
    category: "signs",
    description:
      "Вежлива входна табела с икона на обувки. За дом, Airbnb и студио.",
    basePrice: 22,
    options: opts([
      {
        label: "Компактна · 3 мм",
        sizeLabel: "15×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С рамка · 4 мм",
        sizeLabel: "20×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },

  // —— Декор ——
  {
    name: "Декоративен ажурен елемент",
    slug: "dekorativen-ornament",
    category: "decor",
    description:
      "Лазерно изрязан ажурен детайл от шперплат. За интериор, стена или подаръчна кутия.",
    basePrice: 22,
    options: opts([
      {
        label: "20 см · топола · 3 мм",
        sizeLabel: "20×20 см",
        thicknessMm: 3,
        laserType: "CUT",
        material: "poplar-plywood",
        priceModifier: 0,
      },
      {
        label: "30 см · бреза · масло",
        sizeLabel: "30×30 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Геометричен стенен панел",
    slug: "geometrichen-stenen-panel",
    category: "decor",
    description:
      "Модулен геометричен панел — хексагони, линии или диаманти. Монтира се самостоятелно или в композиция.",
    basePrice: 38,
    options: opts([
      {
        label: "Единичен · 3 мм",
        sizeLabel: "25×25 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Комплект 3 бр. · 4 мм",
        sizeLabel: "25×25 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 45,
      },
    ]),
  },
  {
    name: "Мандала стенен декор",
    slug: "mandala-stenen-dekor",
    category: "decor",
    description:
      "Фино изрязана мандала с концентрични мотиви. Акцент за хол, йога студио или спалня.",
    basePrice: 44,
    options: opts([
      {
        label: "ø30 см · 3 мм",
        sizeLabel: "ø30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "ø45 см · 4 мм · масло",
        sizeLabel: "ø45 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 24,
      },
    ]),
  },
  {
    name: "Ажурна карта на България",
    slug: "karta-bulgaria",
    category: "decor",
    description:
      "Контур на България с опция за маркиране на град. Стенна декорация с национален акцент.",
    basePrice: 39,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "40×25 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм · масло",
        sizeLabel: "55×35 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 20,
      },
    ]),
  },
  {
    name: "Слоеста карта на света",
    slug: "sloesta-karta-svyat",
    category: "decor",
    description:
      "Многослоен макет на световна карта от шперплат. Премиум стенен акцент за офис и хол.",
    basePrice: 89,
    options: opts([
      {
        label: "2 слоя · 3 мм",
        sizeLabel: "60×35 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "3 слоя · масло",
        sizeLabel: "80×45 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 45,
      },
    ]),
  },
  {
    name: "Стенен часовник от шперплат",
    slug: "stenen-chasovnik",
    category: "decor",
    description:
      "Лазерно изрязан циферблат с място за стандартен часовников механизъм (не е включен).",
    basePrice: 52,
    options: opts([
      {
        label: "ø30 см · 4 мм",
        sizeLabel: "ø30 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "ø40 см · ажур · масло",
        sizeLabel: "ø40 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Ажурна рамка за снимка",
    slug: "azhurna-ramka",
    category: "decor",
    description:
      "Рамка с декоративен контур за снимка 10×15 или 13×18. Подарък с опция за гравиран надпис.",
    basePrice: 26,
    options: opts([
      {
        label: "10×15 · 3 мм",
        sizeLabel: "15×20 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "13×18 · 4 мм · масло",
        sizeLabel: "18×23 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Кутия за ключове за стена",
    slug: "kutiya-klyuchove",
    category: "decor",
    description:
      "Стенна кутия с кукички и гравиран надпис. Сглобяем комплект от лазерно изрязани детайли.",
    basePrice: 58,
    options: opts([
      {
        label: "Компактна · 4 мм",
        sizeLabel: "20×25 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Семейна · 6 мм · масло",
        sizeLabel: "25×30 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Многослоен пейзаж с релеф",
    slug: "sloen-peizazh-3d",
    category: "decor",
    description:
      "Многослоен планински или горски пейзаж с дълбочина. Готов за окачване; канал за светлинна лента — по заявка.",
    basePrice: 72,
    options: opts([
      {
        label: "3 слоя · 3 мм",
        sizeLabel: "30×20 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "5 слоя · масло",
        sizeLabel: "40×28 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 35,
      },
    ]),
  },
  {
    name: "Силует на градски хоризонт",
    slug: "siluet-grad",
    category: "decor",
    description:
      "Силует на избран град (София, Пловдив, Варна или по ваш файл). Хоризонтален стенен акцент.",
    basePrice: 46,
    options: opts([
      {
        label: "Среден · 4 мм",
        sizeLabel: "50×15 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 6 мм · масло",
        sizeLabel: "70×20 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Декоративен надпис за дом",
    slug: "dekorativen-nadpis",
    category: "decor",
    description:
      "Свободно стоящ или стенен надпис с избрана дума — „дом“, „любов“ или ваш текст. Шрифт по избор.",
    basePrice: 29,
    options: opts([
      {
        label: "До 6 букви · 4 мм",
        sizeLabel: "до 30 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "До 12 букви · 6 мм",
        sizeLabel: "до 50 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Стойка за саксия / растения",
    slug: "stoika-saksiya",
    category: "decor",
    description:
      "Ажурна стойка или подложка за саксия. Сглобяем комплект — стабилен и лек.",
    basePrice: 34,
    options: opts([
      {
        label: "За ø12 см · 4 мм",
        sizeLabel: "15×15 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "За ø18 см · 6 мм",
        sizeLabel: "22×22 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },

  // —— Сватба ——
  {
    name: "Топер за сватбена торта с имена",
    slug: "cake-topper-imena",
    category: "wedding",
    description:
      "Декоративен топер за торта с имена на младоженците и дата. За стандартна или многоетажна торта.",
    basePrice: 35,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "20×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Сватбена табела за посрещане",
    slug: "svatbena-welcome",
    category: "wedding",
    description:
      "Голяма табела за посрещане на гостите с имена и дата. Ажурна рамка по избор.",
    basePrice: 68,
    options: opts([
      {
        label: "A2 · 4 мм",
        sizeLabel: "42×60 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "A1 · 6 мм · масло",
        sizeLabel: "60×84 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 40,
      },
    ]),
  },
  {
    name: "Картички за места на масата",
    slug: "place-cards-svatba",
    category: "wedding",
    description:
      "Индивидуални дървени картички с име на гост. Поръчват се по бройка — подходящи за маси.",
    basePrice: 4.5,
    options: opts([
      {
        label: "Плоска · 3 мм",
        sizeLabel: "8×4 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Със стойка · 3 мм",
        sizeLabel: "8×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 1.5,
      },
    ]),
  },
  {
    name: "Кутия за халки",
    slug: "kutiya-halki",
    category: "wedding",
    description:
      "Мини кутия или възглавничка-алтернатива за халките. Гравирани инициали и дата.",
    basePrice: 42,
    options: opts([
      {
        label: "Квадратна · 4 мм",
        sizeLabel: "10×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Ажурна · масло",
        sizeLabel: "12×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Табела номер на маса",
    slug: "nomer-masa",
    category: "wedding",
    description:
      "Номер за сватбена или банкетна маса. Комплект от 1 до 20 по заявка.",
    basePrice: 12,
    options: opts([
      {
        label: "Кръгъл · 3 мм",
        sizeLabel: "ø10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Със стойка · 4 мм",
        sizeLabel: "12×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Дървена табела за пожелания",
    slug: "guestbook-darvo",
    category: "wedding",
    description:
      "Голяма табела или пъзел, върху който гостите оставят подписи и пожелания. Алтернатива на книгата за гости.",
    basePrice: 95,
    options: opts([
      {
        label: "Табела · 4 мм",
        sizeLabel: "50×40 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Пъзел · 4 мм · масло",
        sizeLabel: "50×40 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 25,
      },
    ]),
  },

  // —— Детска ——
  {
    name: "Име на бебе за стена",
    slug: "ime-bebe-stena",
    category: "nursery",
    description:
      "Букви или цяло име за детска стая. Шрифт, размер и цвят (суров/масло) по избор.",
    basePrice: 48,
    options: opts([
      {
        label: "До 6 букви · 6 мм",
        sizeLabel: "до 50 см",
        thicknessMm: 6,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "До 10 букви · масло",
        sizeLabel: "до 70 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Месечни картички за бебешки снимки",
    slug: "milestone-kartichki",
    category: "nursery",
    description:
      "Комплект картички за месечни снимки на бебето (1–12 месеца). Гравирани надписи на български.",
    basePrice: 55,
    options: opts([
      {
        label: "12 бр. · 3 мм",
        sizeLabel: "10×10 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "12 бр. + кутия · 3 мм",
        sizeLabel: "10×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Мобиле животни за креватче",
    slug: "mobile-zhivotni",
    category: "nursery",
    description:
      "Лазерно изрязани животни за мобиле. Комплект фигури + пръстени; окачалката е по желание.",
    basePrice: 46,
    options: opts([
      {
        label: "5 фигури · 3 мм",
        sizeLabel: "6–8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "8 фигури · масло",
        sizeLabel: "6–8 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Растежен метър за стена",
    slug: "rastezhen-metar",
    category: "nursery",
    description:
      "Дървен растежен метър с гравирана скала в см. Опция за име на детето.",
    basePrice: 62,
    options: opts([
      {
        label: "До 150 см · 6 мм",
        sizeLabel: "15×150 см",
        thicknessMm: 6,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "До 180 см · масло",
        sizeLabel: "15×180 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Рамка за отпечатък на бебе",
    slug: "ramka-otpechatak",
    category: "nursery",
    description:
      "Рамка с място за отпечатък на ръчичка/краче и гравирани данни за раждането.",
    basePrice: 38,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "20×25 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "25×30 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Табела „Тихо, бебе спи“",
    slug: "tabela-bebe-spi",
    category: "nursery",
    description:
      "Врата табела за родителска или детска стая. Вежлив надпис с икона.",
    basePrice: 20,
    options: opts([
      {
        label: "Компактна · 3 мм",
        sizeLabel: "15×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С закачалка · 4 мм",
        sizeLabel: "18×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 5,
      },
    ]),
  },

  // —— Орнаменти ——
  {
    name: "Коледна топка с име",
    slug: "koledna-topka-ime",
    category: "ornaments",
    description:
      "Плоска „топка“ от шперплат с гравирано име и година. Комплекти за цялото семейство.",
    basePrice: 10,
    options: opts([
      {
        label: "Единична · 3 мм",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 4 бр.",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 28,
      },
    ]),
  },
  {
    name: "Орнамент „Първа Коледа“",
    slug: "parva-koleda",
    category: "ornaments",
    description:
      "Специален орнамент за бебешка първа Коледа или първи дом. Персонализация с имена.",
    basePrice: 14,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "9×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Ажурен · масло",
        sizeLabel: "10×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Ажурна снежинка",
    slug: "azhurna-snezhinka",
    category: "ornaments",
    description:
      "Фино изрязана снежинка за елха или прозорец. Продава се поединично или в комплект.",
    basePrice: 8,
    options: opts([
      {
        label: "ø8 см · 3 мм",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Комплект 6 бр.",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 32,
      },
    ]),
  },
  {
    name: "Ангелче орнамент",
    slug: "angelche-ornament",
    category: "ornaments",
    description:
      "Деликатен ангел с опция за име и дата. Подходящ за спомен и подарък.",
    basePrice: 12,
    options: opts([
      {
        label: "Малък · 3 мм",
        sizeLabel: "6×8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Среден · масло",
        sizeLabel: "8×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Великденско яйце орнамент",
    slug: "velikdensko-yaitse",
    category: "ornaments",
    description:
      "Ажурно яйце с пролетни мотиви. За великденска украса и подаръчни комплекти.",
    basePrice: 9,
    options: opts([
      {
        label: "Единично · 3 мм",
        sizeLabel: "6×8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Комплект 4 бр.",
        sizeLabel: "6×8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 24,
      },
    ]),
  },
  {
    name: "Валентинско сърце орнамент",
    slug: "valentinsko-sarce",
    category: "ornaments",
    description:
      "Сърце с гравирано послание или дата. За Свети Валентин и годишнини.",
    basePrice: 11,
    options: opts([
      {
        label: "Плоско · 3 мм",
        sizeLabel: "8×8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Двуслойно · масло",
        sizeLabel: "9×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Семеен комплект орнаменти",
    slug: "semeen-komplekt-ornamenti",
    category: "ornaments",
    description:
      "Комплект орнаменти с имена на всички в семейството + година. Един макет, различни надписи.",
    basePrice: 45,
    options: opts([
      {
        label: "4 бр. · 3 мм",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "6 бр. · масло",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },

  // —— Кухня ——
  {
    name: "Подложки за чаши — комплект от 4",
    slug: "podlozhki-chashi",
    category: "kitchen",
    description:
      "Комплект от 4 гравирани подложки с общ мотив или монограм. Препоръчваме масло или лак.",
    basePrice: 28,
    options: opts([
      {
        label: "Квадрат · 4 мм · масло",
        sizeLabel: "9×9 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 0,
      },
      {
        label: "Кръг · 4 мм · лак",
        sizeLabel: "ø9 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Подставка за горещи съдове",
    slug: "podstavka-goreshto",
    category: "kitchen",
    description:
      "Ажурна подставка за тенджери и тигани. Здрава конструкция от по-дебел шперплат.",
    basePrice: 24,
    options: opts([
      {
        label: "Средна · 6 мм",
        sizeLabel: "18×18 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм",
        sizeLabel: "24×24 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Кутия за рецепти",
    slug: "kutiya-retsepti",
    category: "kitchen",
    description:
      "Сглобяема кутия за рецептурни карти с гравиран надпис „Рецепти“ или фамилия.",
    basePrice: 48,
    options: opts([
      {
        label: "A6 карти · 4 мм",
        sizeLabel: "18×12×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "20×14×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Табела за кафе кът",
    slug: "tabela-coffee-bar",
    category: "venues",
    description:
      "Декоративна кухненска табела за къта с кафе. Текст и икони по ваш избор.",
    basePrice: 32,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "30×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "40×18 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Стойка за салфетки",
    slug: "stoika-salfetki",
    category: "kitchen",
    description:
      "Ажурна стойка за салфетки — сглобяем комплект. За маса и бюфет.",
    basePrice: 22,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "12×8×10 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "С гравиране · масло",
        sizeLabel: "12×8×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Сервираща дъска с гравиране",
    slug: "servirashta-daska",
    category: "kitchen",
    description:
      "Дъска за сервиране на сирена и мезета с гравиран монограм. Само за презентация — не за рязане.",
    basePrice: 54,
    options: opts([
      {
        label: "Средна · 6 мм · масло",
        sizeLabel: "30×20 см",
        thicknessMm: 6,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 0,
      },
      {
        label: "Голяма · дъб · лак",
        sizeLabel: "40×25 см",
        thicknessMm: 6,
        laserType: "ENGRAVE",
        material: "oak-veneer",
        finish: "lacquer",
        priceModifier: 28,
      },
    ]),
  },

  // —— Бижута ——
  {
    name: "Обеци геометрични",
    slug: "obeci-geometrichni",
    category: "jewelry",
    description:
      "Леки геометрични обеци от 3 мм шперплат. Включва стоманени кукички.",
    basePrice: 18,
    options: opts([
      {
        label: "Малки · 3 мм",
        sizeLabel: "3×4 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Дълги · масло",
        sizeLabel: "3×7 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Обеци с листен мотив",
    slug: "obeci-list",
    category: "jewelry",
    description:
      "Силует на лист или цвете с фини детайли. Лек и характерен аксесоар от шперплат.",
    basePrice: 19,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "3×5 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Двуслоен · масло",
        sizeLabel: "3×5 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Колие медальон с гравиране",
    slug: "kolie-medalion",
    category: "jewelry",
    description:
      "Кръгъл или сърцевиден медальон с инициали. Верижка по заявка или само висулката.",
    basePrice: 16,
    options: opts([
      {
        label: "Висулка · 3 мм",
        sizeLabel: "ø3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Двустранен · масло",
        sizeLabel: "ø3.5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Брошка от шперплат",
    slug: "broshka-pin",
    category: "jewelry",
    description:
      "Декоративна брошка с щипка. Форми: геометрични, животни или лого по ваш файл.",
    basePrice: 14,
    options: opts([
      {
        label: "Малък · 3 мм",
        sizeLabel: "3×3 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Среден · гравиране",
        sizeLabel: "4×4 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 3,
      },
    ]),
  },

  // —— Домашни любимци ——
  {
    name: "Медальон за куче / котка",
    slug: "medalion-lubimets",
    category: "pets",
    description:
      "Лек дървен медальон с име и телефон. Не е заместител на металния чип — декоративен слой.",
    basePrice: 12,
    options: opts([
      {
        label: "Костен · 3 мм",
        sizeLabel: "4×2.5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Кръгъл · двустранен",
        sizeLabel: "ø3.5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        doubleSided: true,
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Табела за кучешка къщичка",
    slug: "tabela-kucheshka-kashta",
    category: "pets",
    description:
      "Именна табела за къщичка или зона на любимеца. Водоустойчив лак по желание.",
    basePrice: 24,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "20×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С лак · 6 мм",
        sizeLabel: "25×12 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Силует на любимец по снимка",
    slug: "siluet-po-snimka",
    category: "pets",
    description:
      "Изработка на силует по ваша снимка (векторизираме макета). Стенен декор или ключодържател.",
    basePrice: 45,
    options: opts([
      {
        label: "Стенен · 4 мм",
        sizeLabel: "20×20 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 6 мм · масло",
        sizeLabel: "35×35 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 25,
      },
    ]),
  },
  {
    name: "Етикет за кутия с лакомства",
    slug: "etiket-lakomstva",
    category: "pets",
    description:
      "Декоративен етикет/табела за кутия с храна или лакомства. Име на любимеца включено.",
    basePrice: 16,
    options: opts([
      {
        label: "Плосък · 3 мм",
        sizeLabel: "12×6 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "С контур · 4 мм",
        sizeLabel: "14×7 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 4,
      },
    ]),
  },

  // —— Корпоративни ——
  {
    name: "Дървен визитник",
    slug: "darven-vizitnik",
    category: "corporate",
    description:
      "Сглобяем визитник с гравирано лого. Елегантен корпоративен подарък и бюро аксесоар.",
    basePrice: 36,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "10×6×4 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · дъб · лак",
        sizeLabel: "11×7×5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        material: "oak-veneer",
        finish: "lacquer",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Табела с фирмено лого",
    slug: "tabela-logo-firma",
    category: "corporate",
    description:
      "Табела за рецепция или офис с фирмено лого. Работим по векторни файлове SVG, AI или PDF.",
    basePrice: 65,
    options: opts([
      {
        label: "Средна · 6 мм",
        sizeLabel: "40×20 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм",
        sizeLabel: "60×30 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 35,
      },
    ]),
  },
  {
    name: "Плакет / награда",
    slug: "plaket-nagrada",
    category: "corporate",
    description:
      "Награден плакет с текст и лого. За служители, партньори и събития.",
    basePrice: 48,
    options: opts([
      {
        label: "A5 · 6 мм",
        sizeLabel: "15×21 см",
        thicknessMm: 6,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 0,
      },
      {
        label: "A4 · със стойка",
        sizeLabel: "21×30 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Именен бейдж от шперплат",
    slug: "imenen-beidzh",
    category: "corporate",
    description:
      "Лек бейдж с име и позиция. За конференции, хотели и екипи. Клипс/магнит по заявка.",
    basePrice: 9,
    options: opts([
      {
        label: "От 10 бр. · 3 мм",
        sizeLabel: "7×3 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "От 25 бр. · лак",
        sizeLabel: "8×3.5 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 2,
      },
    ]),
  },
  {
    name: "Кутийка за USB памет",
    slug: "usb-kutiika",
    category: "corporate",
    description:
      "Мини кутийка или плъзгащ се капак за USB памет с лого. Подарък за клиенти и партньори.",
    basePrice: 18,
    options: opts([
      {
        label: "Капак · 3 мм",
        sizeLabel: "6×2 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Кутийка · 4 мм",
        sizeLabel: "7×3×1.5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Корпоративен подаръчен комплект",
    slug: "korporativen-komplekt",
    category: "corporate",
    description:
      "Комплект: визитник + ключодържател + подложки с общо лого. Минимална поръчка 10 комплекта.",
    basePrice: 55,
    options: opts([
      {
        label: "Базов комплект · 4 мм",
        sizeLabel: "микс",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум + кутия · масло",
        sizeLabel: "микс",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 20,
      },
    ]),
  },

  // —— Подаръци ——
  {
    name: "Книгоразделител с гравиране",
    slug: "knigorzazdelitel",
    category: "gifts",
    description:
      "Тънък книгоразделител с име, цитат или илюстрация. Лек и практичен подарък.",
    basePrice: 10,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "4×14 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Ажурен · масло",
        sizeLabel: "4×16 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 3,
      },
    ]),
  },
  {
    name: "Магнит за хладилник",
    slug: "magnet-hladilnik",
    category: "gifts",
    description:
      "Дървен магнит с гравиране. Добавяме магнитна лента отзад.",
    basePrice: 8,
    options: opts([
      {
        label: "Малък · 3 мм",
        sizeLabel: "5×5 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Фигурен · 3 мм",
        sizeLabel: "6×6 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 3,
      },
    ]),
  },
  {
    name: "Кутия за бижута ажурна",
    slug: "kutiya-bizhuta",
    category: "gifts",
    description:
      "Сглобяема кутия с ажурен капак и опционални прегради. Подарък с гравирани инициали.",
    basePrice: 58,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "15×10×6 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "20×14×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 20,
      },
    ]),
  },
  {
    name: "Органайзер за бюро",
    slug: "organaizer-byuro",
    category: "gifts",
    description:
      "Сглобяем органайзер за химикали и дребни предмети. С лого или име.",
    basePrice: 42,
    options: opts([
      {
        label: "Компактен · 4 мм",
        sizeLabel: "15×10×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Широк · масло",
        sizeLabel: "22×12×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Стойка за телефон",
    slug: "stoika-telefon",
    category: "gifts",
    description:
      "Минималистична стойка за смартфон — портрет и пейзаж. Сглобява се без лепило.",
    basePrice: 18,
    options: opts([
      {
        label: "Универсална · 4 мм",
        sizeLabel: "8×8 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "С гравиране · масло",
        sizeLabel: "8×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Вечен календар от шперплат",
    slug: "vechen-kalendar",
    category: "gifts",
    description:
      "Настолен вечен календар с въртящи се елементи. Сглобяем комплект с инструкции.",
    basePrice: 64,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "18×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "20×14 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Персонализиран пъзел",
    slug: "personaliziran-pazel",
    category: "gifts",
    description:
      "Пъзел с гравирана илюстрация, карта или послание. Брой части по избор.",
    basePrice: 36,
    options: opts([
      {
        label: "A5 · ~24 части · 3 мм",
        sizeLabel: "15×21 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "A4 · ~48 части · 4 мм",
        sizeLabel: "21×30 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Нощна лампа кутия със светлинна лента",
    slug: "led-noshtna-lampa",
    category: "gifts",
    description:
      "Ажурна кутия-лампа за светлинна лента (лентата не е включена). Топъл акцент за спалня и детска.",
    basePrice: 68,
    options: opts([
      {
        label: "Куб 15 см · 3 мм",
        sizeLabel: "15×15×15 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Куб 20 см · масло",
        sizeLabel: "20×20×20 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 22,
      },
    ]),
  },
  {
    name: "Кутия спомен с гравиране",
    slug: "kutiya-spomen",
    category: "gifts",
    description:
      "Кутия за писма, билети и дребни спомени. Капак с дата, имена или послание.",
    basePrice: 52,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "20×12×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "28×18×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Пощенска картичка от шперплат",
    slug: "poshtenska-kartichka",
    category: "gifts",
    description:
      "Твърда „картичка“ с гравирано послание — за специални поводи. Плик не е включен.",
    basePrice: 12,
    options: opts([
      {
        label: "A6 · 3 мм",
        sizeLabel: "10×15 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Ажурна рамка · 3 мм",
        sizeLabel: "10×15 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 4,
      },
    ]),
  },

  // —— Коледа ——
  {
    name: "Табела „Весела Коледа“",
    slug: "tabela-vesela-koleda",
    category: "christmas",
    description:
      "Празнична стенна табела с гравиран надпис и зимен орнамент. За вход, хол или витрина.",
    basePrice: 36,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "30×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "40×18 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Настолна елхичка от шперплат",
    slug: "nastolna-elhichka",
    category: "christmas",
    description:
      "Сглобяема ажурна елхичка за маса или рафт. Стабилна основа, без лепило.",
    basePrice: 28,
    options: opts([
      {
        label: "Малка · 3 мм",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Средна · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Коледен венец ажурен",
    slug: "koleden-venets",
    category: "christmas",
    description:
      "Кръгъл ажурен венец с зимни мотиви. За врата или стена — лек и декоративен.",
    basePrice: 42,
    options: opts([
      {
        label: "ø30 см · 3 мм",
        sizeLabel: "ø30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "ø40 см · масло",
        sizeLabel: "ø40 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Адвент календар дървен",
    slug: "advent-kalendar",
    category: "christmas",
    description:
      "Календар с 24 вратички или джобчета от шперплат. Персонализация с година и име на семейството.",
    basePrice: 78,
    options: opts([
      {
        label: "Стенен · 4 мм",
        sizeLabel: "40×50 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "45×55 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 24,
      },
    ]),
  },
  {
    name: "Фигурка Дядо Коледа",
    slug: "figura-dyado-koleda",
    category: "christmas",
    description:
      "Сглобяема фигурка на Дядо Коледа от шперплат. За маса, рафт или витрина.",
    basePrice: 24,
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "10×15 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "14×20 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Орнамент снежен човек",
    slug: "ornament-snejen-chovek",
    category: "christmas",
    description:
      "Ажурен снежен човек за елхата с опция за гравирано име. Лек и здрав.",
    basePrice: 11,
    options: opts([
      {
        label: "Единичен · 3 мм",
        sizeLabel: "7×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 4 бр.",
        sizeLabel: "7×9 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 28,
      },
    ]),
  },
  {
    name: "Орнамент коледна шапка",
    slug: "ornament-koledna-shapka",
    category: "christmas",
    description:
      "Мини коледна шапка от шперплат с гравиране. За елха или пакетни украси.",
    basePrice: 9,
    options: opts([
      {
        label: "Единична · 3 мм",
        sizeLabel: "5×7 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 6 бр.",
        sizeLabel: "5×7 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 36,
      },
    ]),
  },
  {
    name: "Гирлянда „Весела Коледа“",
    slug: "girlyanda-vesela-koleda",
    category: "christmas",
    description:
      "Отделни букви и орнаменти за гирлянда. Нишка не е включена — окачват се лесно.",
    basePrice: 38,
    options: opts([
      {
        label: "Букви · 3 мм",
        sizeLabel: "букви ~8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Букви + звезди · масло",
        sizeLabel: "букви ~8 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Табела за коледни чорапи",
    slug: "tabela-koledni-chorapi",
    category: "christmas",
    description:
      "Стенна лента с кукички и гравирани имена за семейните чорапи. Сглобяем комплект.",
    basePrice: 54,
    options: opts([
      {
        label: "До 4 имена · 4 мм",
        sizeLabel: "40×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "До 6 имена · масло",
        sizeLabel: "55×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Кутия за коледен подарък",
    slug: "kutiya-koleden-podaruk",
    category: "christmas",
    description:
      "Ажурна кутия с капак — за лакомства или дребен подарък. Гравирани имена и година.",
    basePrice: 32,
    options: opts([
      {
        label: "Средна · 3 мм",
        sizeLabel: "12×12×8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "16×16×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Стенен коледен ангел",
    slug: "stenen-koleden-angel",
    category: "christmas",
    description:
      "Голям ажурен ангел за стена или врата. Деликатни крила и опция за име.",
    basePrice: 34,
    options: opts([
      {
        label: "Среден · 3 мм",
        sizeLabel: "20×25 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · масло",
        sizeLabel: "28×35 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Комплект коледни орнаменти „Семейство“",
    slug: "komplekt-koledni-ornamenti-semeistvo",
    category: "christmas",
    description:
      "Комплект орнаменти с имена на всички вкъщи плюс годината. Един макет — различни надписи.",
    basePrice: 48,
    options: opts([
      {
        label: "4 бр. · 3 мм",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "6 бр. · масло",
        sizeLabel: "ø8 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },

  // —— Рождени дни ——
  {
    name: "Топер за рожденденска торта",
    slug: "toper-rozhdenen",
    category: "birthday",
    description:
      "Топер с име и възраст или „Честит рожден ден“. За стандартна торта.",
    basePrice: 22,
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "12×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голям · масло",
        sizeLabel: "16×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Табела „Честит рожден ден“",
    slug: "tabela-chestit-rozhdenen",
    category: "birthday",
    description:
      "Празнична табела за украса на партито с опция за име на юбиляра.",
    basePrice: 32,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "30×15 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "40×18 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Банер с име за рожден ден",
    slug: "baner-ime-rozhdenen",
    category: "birthday",
    description:
      "Отделни букви за банер с името на юбиляра. Нишка не е включена.",
    basePrice: 35,
    options: opts([
      {
        label: "До 8 букви · 3 мм",
        sizeLabel: "букви ~8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "До 12 букви · масло",
        sizeLabel: "букви ~8 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Дървени цифри за торта",
    slug: "cifri-za-torta",
    category: "birthday",
    description:
      "Цифри за възраст (1–99) като топер или украса. Чисти ръбове, стабилна стойка.",
    basePrice: 14,
    options: opts([
      {
        label: "Една цифра · 4 мм",
        sizeLabel: "8×12 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Две цифри · масло",
        sizeLabel: "14×12 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Коронка за юбиляр",
    slug: "korona-yubilyar",
    category: "birthday",
    description:
      "Парти коронка от шперплат с гравирано име. Лека и удобна за снимки.",
    basePrice: 18,
    options: opts([
      {
        label: "Детска · 3 мм",
        sizeLabel: "регулируема",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Възрастни · масло",
        sizeLabel: "регулируема",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Медал „Юбиляр на партито“",
    slug: "medal-yubilyar",
    category: "birthday",
    description:
      "Дървен медал с панделка и гравиране. Забавен акцент за рожденика.",
    basePrice: 16,
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "ø7 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голям · масло",
        sizeLabel: "ø9 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Кутия подарък с възраст",
    slug: "kutiya-podaruk-vazrast",
    category: "birthday",
    description:
      "Кутия с голяма цифра на капака и име. За паричен или дребен подарък.",
    basePrice: 36,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "15×10×6 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "20×12×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Рамка за рожденденска снимка",
    slug: "ramka-rozhdenenska-snimka",
    category: "birthday",
    description:
      "Рамка с гравирана дата и възраст. Подходяща за 10×15 или 13×18 снимка.",
    basePrice: 28,
    options: opts([
      {
        label: "10×15 · 3 мм",
        sizeLabel: "15×20 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "13×18 · масло",
        sizeLabel: "18×23 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Ключодържател с възраст",
    slug: "klyuchodarzhatel-vazrast",
    category: "birthday",
    description:
      "Ключодържател с цифра на възрастта и име. Практичен спомен от партито.",
    basePrice: 12,
    options: opts([
      {
        label: "Кръгъл · 3 мм",
        sizeLabel: "ø5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С контур · масло",
        sizeLabel: "ø5.5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Табела за юбилейни години",
    slug: "tabela-yubileini-godini",
    category: "birthday",
    description:
      "Декоративна табела за 18, 30, 40, 50 и други кръгли годишнини. Текст по избор.",
    basePrice: 38,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "25×25 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "35×35 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },

  // —— Новородени ——
  {
    name: "Табела „Добре дошло, бебе“",
    slug: "tabela-dobre-doshlo-bebe",
    category: "newborn",
    description:
      "Празнична табела за посрещане на новороденото с име и дата на раждане.",
    basePrice: 34,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "25×18 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "35×22 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Табела с данни за раждането",
    slug: "tabela-danni-razhdane",
    category: "newborn",
    description:
      "Стенна табела с име, дата, час, тегло и ръст. Класически спомен за детската.",
    basePrice: 42,
    options: opts([
      {
        label: "Кръгла · 4 мм",
        sizeLabel: "ø25 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Правоъгълна · масло",
        sizeLabel: "30×20 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Кръгла табела с име на бебе",
    slug: "kragla-tabela-ime-bebe",
    category: "newborn",
    description:
      "Кръгла именна табела за над креватчето. Нежен шрифт и опционален мотив.",
    basePrice: 36,
    options: opts([
      {
        label: "ø20 см · 4 мм",
        sizeLabel: "ø20 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "ø30 см · масло",
        sizeLabel: "ø30 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Кутия спомени за бебе",
    slug: "kutiya-spomeni-bebe",
    category: "newborn",
    description:
      "Кутия за гривничка, билет от болницата и първи спомени. Капак с име и дата.",
    basePrice: 48,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "20×12×8 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "25×15×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Кутийка за зъбче",
    slug: "kutiika-zabche",
    category: "newborn",
    description:
      "Мини кутийка за първото зъбче с гравирано име. Нежен подарък за кръщене или рожден ден.",
    basePrice: 18,
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "5×5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Със зъбче мотив · масло",
        sizeLabel: "5×5×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Табела за болнична стая",
    slug: "tabela-bolnichna-staya",
    category: "newborn",
    description:
      "Компактна табела с име на бебето за вратата на стаята. Лека за окачване.",
    basePrice: 20,
    options: opts([
      {
        label: "Компактна · 3 мм",
        sizeLabel: "15×10 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С дата · масло",
        sizeLabel: "18×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Рамка за отпечатък на краче",
    slug: "ramka-otpechatak-krache",
    category: "newborn",
    description:
      "Рамка с място за отпечатък на краче и гравирани данни. Мастилото не е включено.",
    basePrice: 36,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "20×25 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Премиум · масло",
        sizeLabel: "25×30 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Мобиле звезди и луна",
    slug: "mobile-zvezdi-luna",
    category: "newborn",
    description:
      "Комплект фигури звезди и луна за мобиле над креватчето. Окачалката е по желание.",
    basePrice: 40,
    options: opts([
      {
        label: "6 фигури · 3 мм",
        sizeLabel: "5–8 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "8 фигури · масло",
        sizeLabel: "5–8 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Гирлянда с месеците на бебето",
    slug: "girlyanda-meseci-bebe",
    category: "newborn",
    description:
      "Флагчета или кръгчета от 1 до 12 месеца за месечни снимки. Комплект за цялата година.",
    basePrice: 44,
    options: opts([
      {
        label: "12 бр. · 3 мм",
        sizeLabel: "8×8 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "12 бр. · масло",
        sizeLabel: "8×8 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Закачалка с име за гардероб",
    slug: "zakachalka-ime-garderob",
    category: "newborn",
    description:
      "Детска закачалка с гравирано име. Практичен подарък за новородено и кръщене.",
    basePrice: 16,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "35×2 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С мотив · масло",
        sizeLabel: "35×2 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Подаръчен комплект за новородено",
    slug: "podarachen-komplekt-novorodeno",
    category: "newborn",
    description:
      "Комплект: именна табела + ключодържател + картичка. Готов подарък в една поръчка.",
    basePrice: 58,
    options: opts([
      {
        label: "Базов комплект · 4 мм",
        sizeLabel: "микс",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С кутия спомени · масло",
        sizeLabel: "микс",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 28,
      },
    ]),
  },
  {
    name: "Фигурка мече за детска",
    slug: "figurka-meche",
    category: "newborn",
    description:
      "Сглобяемо мече от шперплат за рафт или като топер. Нежен акцент за стаята.",
    basePrice: 22,
    options: opts([
      {
        label: "Средно · 3 мм",
        sizeLabel: "10×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голямо · масло",
        sizeLabel: "14×16 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },

  // —— Заведения ——
  {
    name: "Меню табло за стена",
    slug: "menu-tablo-stena",
    category: "venues",
    description:
      "Голямо стенно табло за дневни предложения и цени. Работим по ваш макет или списък.",
    basePrice: 85,
    options: opts([
      {
        label: "A2 · 4 мм",
        sizeLabel: "42×60 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "A1 · 6 мм · лак",
        sizeLabel: "60×84 см",
        thicknessMm: 6,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 45,
      },
    ]),
  },
  {
    name: "Стойка за QR меню",
    slug: "stoika-qr-menu",
    category: "venues",
    description:
      "Настолна стойка с гравиран QR код към дигитално меню. За маси в ресторант и кафене.",
    basePrice: 18,
    options: opts([
      {
        label: "Компактна · 4 мм",
        sizeLabel: "8×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С лого · лак",
        sizeLabel: "10×14 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Номер за маса — заведение",
    slug: "nomer-masa-zavedenie",
    category: "venues",
    description:
      "Номерирани табели за маси в ресторант, бар или кафене. Комплект по бройка.",
    basePrice: 10,
    options: opts([
      {
        label: "Със стойка · 4 мм",
        sizeLabel: "8×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Двустранна · лак",
        sizeLabel: "8×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "lacquer",
        doubleSided: true,
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Табела „Резервирано“",
    slug: "tabela-rezervirano",
    category: "venues",
    description:
      "Двустранна или със стойка табела „Резервирано“ за маси. Дискретен и четлив дизайн.",
    basePrice: 14,
    options: opts([
      {
        label: "Със стойка · 3 мм",
        sizeLabel: "10×6 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Двустранна · масло",
        sizeLabel: "12×7 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "oil",
        doubleSided: true,
        priceModifier: 4,
      },
    ]),
  },
  {
    name: "Табела с работно време",
    slug: "tabela-rabotno-vreme",
    category: "venues",
    description:
      "Входна табела с гравирано работно време. Подходяща за ресторант, бар, салон и магазин.",
    basePrice: 38,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "25×30 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Голяма · лак",
        sizeLabel: "30×40 см",
        thicknessMm: 6,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Табела за тоалетни — заведение",
    slug: "tabela-toaletni-zavedenie",
    category: "venues",
    description:
      "Комплект или единични пиктограми за мъже / жени / достъпна тоалетна. Единен стил с бранда.",
    basePrice: 22,
    options: opts([
      {
        label: "Единична · 4 мм",
        sizeLabel: "12×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Комплект 3 бр. · лак",
        sizeLabel: "12×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 40,
      },
    ]),
  },
  {
    name: "Стойка за салфетки — бар / ресторант",
    slug: "stoika-salfetki-bar",
    category: "venues",
    description:
      "Здрава ажурна стойка за салфетки с опция за лого на заведението.",
    basePrice: 24,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "12×8×10 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "С лого · масло",
        sizeLabel: "12×8×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 8,
      },
    ]),
  },
  {
    name: "Подложки за чаши с лого на заведение",
    slug: "podlozhki-logo-zavedenie",
    category: "venues",
    description:
      "Комплект подложки с гравирано лого. За бар, кафене и хотелски лоби.",
    basePrice: 32,
    options: opts([
      {
        label: "Сет 4 бр. · масло",
        sizeLabel: "9×9 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "oil",
        priceModifier: 0,
      },
      {
        label: "Сет 8 бр. · лак",
        sizeLabel: "9×9 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        finish: "lacquer",
        priceModifier: 24,
      },
    ]),
  },
  {
    name: "Табела за бар / ресторант с име",
    slug: "tabela-ime-zavedenie",
    category: "venues",
    description:
      "Фасадна или рецепция табела с името на заведението. Работим по векторно лого.",
    basePrice: 72,
    options: opts([
      {
        label: "Средна · 6 мм · лак",
        sizeLabel: "50×20 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм · лак",
        sizeLabel: "80×30 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 40,
      },
    ]),
  },
  {
    name: "Табела „Тераса“ / „Градина“",
    slug: "tabela-terasa-gradina",
    category: "venues",
    description:
      "Указателна табела за тераса, градина или външна зона на заведението.",
    basePrice: 26,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "25×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С лак · 6 мм",
        sizeLabel: "30×14 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "lacquer",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Кутия за съвети / бакшиши",
    slug: "kutiya-bakshishi",
    category: "venues",
    description:
      "Сглобяема кутия за бакшиши с гравиран надпис и процеп. За бар и рецепция.",
    basePrice: 34,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "15×10×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С лого · масло",
        sizeLabel: "15×10×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Табела за Wi‑Fi парола",
    slug: "tabela-wifi-parola",
    category: "venues",
    description:
      "Настолна или стенна табела с име на мрежата и парола / QR. Удобна за гости.",
    basePrice: 16,
    options: opts([
      {
        label: "Настолна · 3 мм",
        sizeLabel: "12×8 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "С QR · масло",
        sizeLabel: "14×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },

  // —— Стенни панели ——
  {
    name: "Геометричен панел „Лабиринт“",
    slug: "panel-labirint-geometriya",
    category: "panels",
    description:
      "Квадратен ажурен панел с лабиринтен геометричен мотив в четири квадранта. За стена, преграда или врата — 3 мм шперплат.",
    basePrice: 48,
    options: opts([
      {
        label: "30×30 см · 3 мм",
        sizeLabel: "30×30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "45×45 см · 3 мм · масло",
        sizeLabel: "45×45 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 22,
      },
      {
        label: "60×60 см · 4 мм · масло",
        sizeLabel: "60×60 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 45,
      },
    ]),
  },
  {
    name: "Ажурен панел „Цветна решетка“",
    slug: "panel-cvetna-reshetka",
    category: "panels",
    description:
      "Повтаряща се решетка с флорални арки и звезди. Класически лазерно изрязан мотив за хол, коридор или заведение.",
    basePrice: 48,
    options: opts([
      {
        label: "30×30 см · 3 мм",
        sizeLabel: "30×30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "45×45 см · 3 мм · масло",
        sizeLabel: "45×45 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 22,
      },
      {
        label: "60×60 см · 4 мм · масло",
        sizeLabel: "60×60 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 45,
      },
    ]),
  },
  {
    name: "Панел „Гръцки ключ“",
    slug: "panel-gratski-klyuch",
    category: "panels",
    description:
      "Стенен панел с меандър / гръцки ключ. Чисти прави линии, симетричен ритъм — модерен интериорен акцент.",
    basePrice: 42,
    options: opts([
      {
        label: "30×30 см · 3 мм",
        sizeLabel: "30×30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "40×60 см · 4 мм · масло",
        sizeLabel: "40×60 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 28,
      },
    ]),
  },
  {
    name: "Мароканска ажурна решетка",
    slug: "panel-marokanska-reshetka",
    category: "panels",
    description:
      "Ориенталска решетка с островърхи арки и розети. Подходяща за стена, ширма или декоративна врата.",
    basePrice: 52,
    options: opts([
      {
        label: "30×30 см · 3 мм",
        sizeLabel: "30×30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "50×50 см · 4 мм · масло",
        sizeLabel: "50×50 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 35,
      },
    ]),
  },
  {
    name: "Модулен хексагонален панел",
    slug: "panel-heksagon-modulen",
    category: "panels",
    description:
      "Шестоъгълен модул с ажур — комбинира се в големи стенни композиции. Поръчайте по бройка.",
    basePrice: 18,
    options: opts([
      {
        label: "Единичен · 3 мм",
        sizeLabel: "ø20 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Комплект 7 бр. · масло",
        sizeLabel: "ø20 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 95,
      },
    ]),
  },
  {
    name: "Панел с вълнообразни линии",
    slug: "panel-valnovi-linii",
    category: "panels",
    description:
      "Минималистичен панел с паралелни вълни. Лек визуален ритъм за модерен хол или офис.",
    basePrice: 44,
    options: opts([
      {
        label: "40×40 см · 3 мм",
        sizeLabel: "40×40 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "50×70 см · 4 мм · масло",
        sizeLabel: "50×70 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 32,
      },
    ]),
  },
  {
    name: "Панел с ромбове и диаманти",
    slug: "panel-rombove",
    category: "panels",
    description:
      "Геометрична мрежа от ромбове с различен мащаб. Добър акцент зад диван или рецепция.",
    basePrice: 46,
    options: opts([
      {
        label: "40×40 см · 3 мм",
        sizeLabel: "40×40 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "60×40 см · 4 мм · масло",
        sizeLabel: "60×40 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 28,
      },
    ]),
  },
  {
    name: "Трислоен релефен панел",
    slug: "panel-trisloen-relef",
    category: "panels",
    description:
      "Три слоя шперплат за дълбочина и сянка. Премиум стенен декор — монтажът е с дистанционери.",
    basePrice: 89,
    options: opts([
      {
        label: "30×30 см · 3×3 мм",
        sizeLabel: "30×30 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "45×45 см · масло",
        sizeLabel: "45×45 см",
        thicknessMm: 3,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 40,
      },
    ]),
  },

  // —— Авто маниаци ——
  {
    name: "Ключодържател силует кола",
    slug: "avto-klyuchodarzhatel-kola",
    category: "auto",
    description:
      "Лазерно изрязан силует на автомобил с опция за гравирано име или инициали. За ключове от гаража или подарък на шофьор.",
    basePrice: 13,
    options: opts([
      {
        label: "Седан · 3 мм",
        sizeLabel: "6×3 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "SUV · 4 мм · масло",
        sizeLabel: "7×3.5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 5,
      },
    ]),
  },
  {
    name: "Ключодържател с рег. номер",
    slug: "avto-klyuchodarzhatel-nomer",
    category: "auto",
    description:
      "Мини табелка с ваш регистрационен номер или гаражен код. Гравиране по поръчка — ясен шрифт, чисти ръбове.",
    basePrice: 14,
    options: opts([
      {
        label: "Стандарт · 3 мм",
        sizeLabel: "5×2.5 см",
        thicknessMm: 3,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Премиум · двустранно",
        sizeLabel: "6×3 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        doubleSided: true,
        priceModifier: 7,
      },
    ]),
  },
  {
    name: "Ключодържател волан",
    slug: "avto-klyuchodarzhatel-volan",
    category: "auto",
    description:
      "Ажурен волан от шперплат — компактен аксесоар за ключове. Добавете инициали в центъра по желание.",
    basePrice: 12,
    options: opts([
      {
        label: "Стандартен · 3 мм",
        sizeLabel: "5×5 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С гравиране · масло",
        sizeLabel: "5.5×5.5 см",
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 6,
      },
    ]),
  },
  {
    name: "Табела за гараж",
    slug: "avto-tabela-garazh",
    category: "auto",
    description:
      "Стенна табела „Garage“ или с ваше име/номер на бокс. Подходяща за домашен гараж или работилница.",
    basePrice: 32,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "30×12 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · масло",
        sizeLabel: "40×15 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Паркинг табела с име",
    slug: "avto-parking-tabela",
    category: "auto",
    description:
      "Резервирано паркомясто с име или фамилия. Лазерно изрязан текст — ясно четим от разстояние.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "25×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм",
        sizeLabel: "35×12 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Стенен силует класическа кола",
    slug: "avto-siluet-klasika",
    category: "auto",
    description:
      "Декоративен силует на класически автомобил за стена в гараж, кабинет или шоурум. Чист контур, готов за окачване.",
    basePrice: 45,
    options: opts([
      {
        label: "Среден · 4 мм",
        sizeLabel: "40×15 см",
        thicknessMm: 4,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · масло",
        sizeLabel: "60×22 см",
        thicknessMm: 6,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 25,
      },
    ]),
  },
  {
    name: "Подложки за чаши — авто",
    slug: "avto-podlozhki-chashi",
    category: "auto",
    description:
      "Комплект подложки с автомобилни мотиви (волан, гуми, силуети). Практичен подарък за авто ентусиасти.",
    basePrice: 22,
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
        thicknessMm: 4,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 10,
      },
    ]),
  },
  {
    name: "Ключодържател за гараж — кука панел",
    slug: "avto-kuka-panel-klyuchove",
    category: "auto",
    description:
      "Стенен панел с куки за ключове от колата и къщата. Гравиран надпис по избор — „Keys“, „Garage“ или име.",
    basePrice: 36,
    options: opts([
      {
        label: "3 куки · 4 мм",
        sizeLabel: "25×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "5 куки · масло",
        sizeLabel: "35×12 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },
  {
    name: "Плакет „Първа кола“",
    slug: "avto-plaket-parva-kola",
    category: "auto",
    description:
      "Споменен плакет с дата и текст за първата кола или важна покупка. Подходящ подарък за шофьорски изпит или юбилей.",
    basePrice: 38,
    options: opts([
      {
        label: "Стандарт · 4 мм",
        sizeLabel: "20×15 см",
        thicknessMm: 4,
        laserType: "ENGRAVE",
        priceModifier: 0,
      },
      {
        label: "Премиум · рамка · масло",
        sizeLabel: "25×18 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 18,
      },
    ]),
  },
  {
    name: "Табела модел / двигател",
    slug: "avto-tabela-model-dvigatel",
    category: "auto",
    description:
      "Декоративна табела с модел, година или тип двигател — за стена до колекцията или в гаража. Текстът е по ваш макет.",
    basePrice: 34,
    options: opts([
      {
        label: "Средна · 4 мм",
        sizeLabel: "28×10 см",
        thicknessMm: 4,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "Голяма · 6 мм · масло",
        sizeLabel: "40×12 см",
        thicknessMm: 6,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 16,
      },
    ]),
  },

  // —— Хелоуин ——
  {
    name: "Хелоуин декорация „Вещица“",
    slug: "halloween-veshtica-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — весела вещица с шапка. От 3 мм шперплат, за рафт, маса или витрина. Идеална за Хелоуин и есенен декор.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Мумия“",
    slug: "halloween-mumiya-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — забавна мумия с големи очи. 3 мм шперплат, за Хелоуин парти и домашен декор.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Вампир“",
    slug: "halloween-vampyr-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — вампир с наметало. От 3 мм шперплат, със стойка; ярък акцент за Хелоуин.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Франкенщайн“",
    slug: "halloween-frankenstein-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — класически Франкенщайн. 3 мм шперплат, за рафт или празнична маса.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Зомби“",
    slug: "halloween-zombi-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — весел зомби. От 3 мм шперплат; подходяща за Хелоуин и колекционерски комплект.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Черна котка“",
    slug: "halloween-cherna-kotka-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — черна котка с вещическа шапка. 3 мм шперплат, за витрина или рафт.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Върколак“",
    slug: "halloween-varkolak-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — оранжев върколак. От 3 мм шперплат; част от серията „Весел и подвижен“.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Скелет“",
    slug: "halloween-skelet-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — усмихнат скелет. 3 мм шперплат, за Хелоуин и есенен интериор.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Тиква“",
    slug: "halloween-tikva-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — Jack-o'-lantern с костюм. От 3 мм шперплат; класически Хелоуин мотив.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },
  {
    name: "Хелоуин декорация „Плашило“",
    slug: "halloween-plashilo-wiggly",
    category: "halloween",
    description:
      "Подвижна лазерно изрязана декорация — плашило със сламена коса. 3 мм шперплат, за празнична маса или витрина.",
    basePrice: 28,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "12×18 см",
        thicknessMm: 3,
        laserType: "CUT",
        priceModifier: 0,
      },
      {
        label: "Голям · 4 мм · масло",
        sizeLabel: "16×24 см",
        thicknessMm: 4,
        laserType: "CUT",
        finish: "oil",
        priceModifier: 12,
      },
    ]),
  },

  // —— Новородени: гардероб-касетка ——
  {
    name: "Гардероб-касетка „Еленче“",
    slug: "baby-closet-elen",
    category: "newborn",
    description:
      "Лазерно изрязана касетка-гардеробче за бебешки подарък — флорален мотив и еленче. 3 мм шперплат, с релса за мини закачалки. Подходяща за бебешки душ и кръщене.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Луна и звезди“",
    slug: "baby-closet-luna",
    category: "newborn",
    description:
      "Бебешка касетка-гардероб с луна и звезди. Лазерно изрязана от 3 мм шперплат — идеален подарък за бебешки душ.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Мече“",
    slug: "baby-closet-mecho",
    category: "newborn",
    description:
      "Касетка-гардеробче с мече на предния панел и сърце-табелка на релсата. 3 мм шперплат — класика за новородено.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Влакче“",
    slug: "baby-closet-vlak",
    category: "newborn",
    description:
      "Бебешка касетка с мотив влакче — забавен подарък за момченце. Лазерно изрязана от 3 мм шперплат, с релса за дрехи.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Замък“",
    slug: "baby-closet-zamak",
    category: "newborn",
    description:
      "Приказна касетка-гардероб във форма на замък. 3 мм шперплат — ефектен бебешки подарък с място за дрехи и изненади.",
    basePrice: 52,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Балон“",
    slug: "baby-closet-balon",
    category: "newborn",
    description:
      "Нежна касетка с балон и облаци. Лазерно изрязана от 3 мм шперплат — подходяща за бебешки душ и детска стая.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Лъвче“",
    slug: "baby-closet-lav",
    category: "newborn",
    description:
      "Сафари касетка-гардероб с лъвче и лапички. 3 мм шперплат — персонализира се с име на бебето.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Тигърче“",
    slug: "baby-closet-tigar",
    category: "newborn",
    description:
      "Касетка с тигърче на предния панел. Лазерно изрязана от 3 мм шперплат — с релса за мини дрехи и място за подаръци.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Море“",
    slug: "baby-closet-more",
    category: "newborn",
    description:
      "Морска касетка-гардероб с корабче и котва. 3 мм шперплат — свеж бебешки подарък за душ или кръщене.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
  {
    name: "Гардероб-касетка „Слънце“",
    slug: "baby-closet-slantse",
    category: "newborn",
    description:
      "Весела касетка със слънце и облаци. Лазерно изрязана от 3 мм шперплат — персонализира се с име.",
    basePrice: 48,
    options: opts([
      {
        label: "Стандарт · 3 мм · изрязване",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        priceModifier: 0,
      },
      {
        label: "С име · гравиране · масло",
        sizeLabel: "20×15×12 см",
        thicknessMm: 3,
        laserType: "BOTH",
        finish: "oil",
        priceModifier: 14,
      },
    ]),
  },
];

export const CATALOG_PRODUCTS: SeedProduct[] = [
  ...pack(DRAFTS),
  ...pack(OCCASION_EXPANSION_DRAFTS),
];
