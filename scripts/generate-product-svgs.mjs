/**
 * Generates simple branded product placeholder SVGs for the catalog.
 * Run: node scripts/generate-product-svgs.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "products");
mkdirSync(outDir, { recursive: true });

const tones = [
  { bg: "#c4a574", grain: "#a67c52", ink: "#3d2b1f", accent: "#8b5a2b" },
  { bg: "#d2b48c", grain: "#b8956c", ink: "#2c2118", accent: "#6b4423" },
  { bg: "#c9a66b", grain: "#9e7b4f", ink: "#3a2a1c", accent: "#7a5230" },
  { bg: "#b8956c", grain: "#8f6b45", ink: "#24180f", accent: "#5c3d24" },
  { bg: "#e0c9a0", grain: "#c4a574", ink: "#3d2b1f", accent: "#8b6914" },
];

const categories = {
  keychains: "Ключодържател",
  signs: "Табела",
  decor: "Декор",
  wedding: "Сватба",
  nursery: "Детска",
  ornaments: "Орнамент",
  kitchen: "Кухня",
  jewelry: "Бижу",
  pets: "Любимец",
  auto: "Авто",
  corporate: "Корпоративно",
  gifts: "Подарък",
  other: "Модел",
};

/** @type {Array<{slug:string,name:string,category:string}>} */
const products = [
  { slug: "klyuchodarzhatel-ime", name: "Ключодържател с име", category: "keychains" },
  { slug: "klyuchodarzhatel-sarce", name: "Ключодържател сърце", category: "keychains" },
  { slug: "klyuchodarzhatel-reg-nomer", name: "Рег. номер", category: "keychains" },
  { slug: "klyuchodarzhatel-zodiya", name: "Зодия", category: "keychains" },
  { slug: "klyuchodarzhatel-kashta", name: "Къща с адрес", category: "keychains" },
  { slug: "klyuchodarzhatel-lubimets", name: "Любимец", category: "keychains" },
  { slug: "klyuchodarzhatel-qr", name: "QR код", category: "keychains" },
  { slug: "komplekt-klyuchodarzhateli-gosti", name: "Комплект гости", category: "keychains" },
  { slug: "tabela-vrata", name: "Табела за врата", category: "signs" },
  { slug: "semeina-tabela-familiya", name: "Семейна табела", category: "signs" },
  { slug: "welcome-tabela", name: "Welcome", category: "signs" },
  { slug: "tabela-kabinet", name: "Кабинет / офис", category: "signs" },
  { slug: "adresna-tabela", name: "Адресна табела", category: "signs" },
  { slug: "tabela-otvoreno-zatvoreno", name: "Отворено/Затворено", category: "signs" },
  { slug: "tabela-wc", name: "WC / баня", category: "signs" },
  { slug: "tabela-obuvki", name: "Свалете обувките", category: "signs" },
  { slug: "dekorativen-ornament", name: "Ажурен елемент", category: "decor" },
  { slug: "geometrichen-stenen-panel", name: "Геометричен панел", category: "decor" },
  { slug: "mandala-stenen-dekor", name: "Мандала", category: "decor" },
  { slug: "karta-bulgaria", name: "Карта България", category: "decor" },
  { slug: "sloesta-karta-svyat", name: "Карта на света", category: "decor" },
  { slug: "stenen-chasovnik", name: "Стенен часовник", category: "decor" },
  { slug: "azhurna-ramka", name: "Ажурна рамка", category: "decor" },
  { slug: "kutiya-klyuchove", name: "Кутия за ключове", category: "decor" },
  { slug: "sloen-peizazh-3d", name: "Слоен пейзаж", category: "decor" },
  { slug: "siluet-grad", name: "Силует град", category: "decor" },
  { slug: "dekorativen-nadpis", name: "Надпис Home/Love", category: "decor" },
  { slug: "stoika-saksiya", name: "Стойка саксия", category: "decor" },
  { slug: "cake-topper-imena", name: "Cake topper", category: "wedding" },
  { slug: "svatbena-welcome", name: "Сватбена Welcome", category: "wedding" },
  { slug: "place-cards-svatba", name: "Place cards", category: "wedding" },
  { slug: "kutiya-halki", name: "Кутия за халки", category: "wedding" },
  { slug: "nomer-masa", name: "Номер на маса", category: "wedding" },
  { slug: "guestbook-darvo", name: "Guestbook", category: "wedding" },
  { slug: "ime-bebe-stena", name: "Име за стена", category: "nursery" },
  { slug: "milestone-kartichki", name: "Milestone карти", category: "nursery" },
  { slug: "mobile-zhivotni", name: "Мобиле животни", category: "nursery" },
  { slug: "rastezhen-metar", name: "Растежен метър", category: "nursery" },
  { slug: "ramka-otpechatak", name: "Рамка отпечатък", category: "nursery" },
  { slug: "tabela-bebe-spi", name: "Бебе спи", category: "nursery" },
  { slug: "koledna-topka-ime", name: "Коледна топка", category: "ornaments" },
  { slug: "parva-koleda", name: "Първа Коледа", category: "ornaments" },
  { slug: "azhurna-snezhinka", name: "Снежинка", category: "ornaments" },
  { slug: "angelche-ornament", name: "Ангелче", category: "ornaments" },
  { slug: "velikdensko-yaitse", name: "Великденско яйце", category: "ornaments" },
  { slug: "valentinsko-sarce", name: "Валентинско сърце", category: "ornaments" },
  { slug: "semeen-komplekt-ornamenti", name: "Семеен комплект", category: "ornaments" },
  { slug: "podlozhki-chashi", name: "Подложки чаши", category: "kitchen" },
  { slug: "podstavka-goreshto", name: "Подставка горещо", category: "kitchen" },
  { slug: "kutiya-retsepti", name: "Кутия рецепти", category: "kitchen" },
  { slug: "tabela-coffee-bar", name: "Coffee Bar", category: "kitchen" },
  { slug: "stoika-salfetki", name: "Стойка салфетки", category: "kitchen" },
  { slug: "servirashta-daska", name: "Сервираща дъска", category: "kitchen" },
  { slug: "obeci-geometrichni", name: "Обеци геометрични", category: "jewelry" },
  { slug: "obeci-list", name: "Обеци лист", category: "jewelry" },
  { slug: "kolie-medalion", name: "Колие медальон", category: "jewelry" },
  { slug: "broshka-pin", name: "Брошка / пин", category: "jewelry" },
  { slug: "medalion-lubimets", name: "Медальон любимец", category: "pets" },
  { slug: "tabela-kucheshka-kashta", name: "Кучешка къщичка", category: "pets" },
  { slug: "siluet-po-snimka", name: "Силует по снимка", category: "pets" },
  { slug: "etiket-lakomstva", name: "Етикет лакомства", category: "pets" },
  { slug: "darven-vizitnik", name: "Визитник", category: "corporate" },
  { slug: "tabela-logo-firma", name: "Фирмено лого", category: "corporate" },
  { slug: "plaket-nagrada", name: "Плакет", category: "corporate" },
  { slug: "imenen-beidzh", name: "Именен бейдж", category: "corporate" },
  { slug: "usb-kutiika", name: "USB кутийка", category: "corporate" },
  { slug: "korporativen-komplekt", name: "Корп. комплект", category: "corporate" },
  { slug: "knigorzazdelitel", name: "Книгоразделител", category: "gifts" },
  { slug: "magnet-hladilnik", name: "Магнит", category: "gifts" },
  { slug: "kutiya-bizhuta", name: "Кутия бижута", category: "gifts" },
  { slug: "organaizer-byuro", name: "Органайзер бюро", category: "gifts" },
  { slug: "stoika-telefon", name: "Стойка телефон", category: "gifts" },
  { slug: "vechen-kalendar", name: "Вечен календар", category: "gifts" },
  { slug: "personaliziran-pazel", name: "Пъзел", category: "gifts" },
  { slug: "led-noshtna-lampa", name: "LED лампа", category: "gifts" },
  { slug: "kutiya-spomen", name: "Кутия спомен", category: "gifts" },
  { slug: "poshtenska-kartichka", name: "Дървена картичка", category: "gifts" },
  { slug: "avto-klyuchodarzhatel-kola", name: "Силует кола", category: "auto" },
  { slug: "avto-klyuchodarzhatel-nomer", name: "Рег. номер авто", category: "auto" },
  { slug: "avto-klyuchodarzhatel-volan", name: "Волан", category: "auto" },
  { slug: "avto-tabela-garazh", name: "Табела гараж", category: "auto" },
  { slug: "avto-parking-tabela", name: "Паркинг табела", category: "auto" },
  { slug: "avto-siluet-klasika", name: "Класическа кола", category: "auto" },
  { slug: "avto-podlozhki-chashi", name: "Подложки авто", category: "auto" },
  { slug: "avto-kuka-panel-klyuchove", name: "Кука панел", category: "auto" },
  { slug: "avto-plaket-parva-kola", name: "Първа кола", category: "auto" },
  { slug: "avto-tabela-model-dvigatel", name: "Модел / двигател", category: "auto" },
];

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(name, max = 22) {
  if (name.length <= max) return [name];
  const words = name.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const t = tones[i % tones.length];
  const cat = categories[p.category] ?? "Модел";
  const lines = wrapTitle(p.name);
  const titleY = 430;
  const titleSvg = lines
    .map(
      (line, li) =>
        `<text x="400" y="${titleY + li * 36}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="${t.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="640" viewBox="0 0 800 640">
  <defs>
    <pattern id="grain${i}" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="${t.bg}"/>
      <path d="M0 10 H40 M0 30 H40" stroke="${t.grain}" stroke-width="1" opacity="0.35"/>
      <path d="M0 20 H40" stroke="${t.accent}" stroke-width="0.6" opacity="0.25"/>
    </pattern>
    <linearGradient id="shade${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
    </linearGradient>
  </defs>
  <rect width="800" height="640" fill="#f3efe8"/>
  <rect x="48" y="48" width="704" height="544" rx="8" fill="url(#grain${i})" stroke="${t.accent}" stroke-width="3"/>
  <rect x="48" y="48" width="704" height="544" rx="8" fill="url(#shade${i})"/>
  <circle cx="400" cy="250" r="110" fill="none" stroke="${t.ink}" stroke-width="2.5" opacity="0.55"/>
  <path d="M340 250 H460 M400 190 V310" stroke="${t.ink}" stroke-width="2" opacity="0.4"/>
  <path d="M355 215 L400 285 L445 215" fill="none" stroke="${t.ink}" stroke-width="2" opacity="0.45"/>
  <text x="400" y="120" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" letter-spacing="3" fill="${t.accent}">ЛАЗЕРШПЕРПЛАТ</text>
  <text x="400" y="395" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="${t.accent}">${escapeXml(cat)}</text>
  ${titleSvg}
  <text x="400" y="555" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="${t.ink}" opacity="0.7">лазерно изрязване · гравиране</text>
</svg>
`;
  writeFileSync(join(outDir, `${p.slug}.svg`), svg, "utf8");
}

console.log(`Generated ${products.length} SVGs → public/products/`);
