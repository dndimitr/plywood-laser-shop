import { prisma } from "@/lib/db";
import { catalogProductWhere } from "@/lib/catalog-where";
import {
  categoryById,
  FREE_SHIPPING_MIN_EUR,
  type CategoryId,
} from "@/lib/shop-config";
import { shippingFeeFor } from "@/lib/shipping-settings";
import {
  absoluteAssetUrl,
  absoluteUrl,
  SITE_NAME,
  truncateMeta,
} from "@/lib/seo";

/** Meta Commerce catalog feed columns (CSV/TSV). */
export const FACEBOOK_CATALOG_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "additional_image_link",
  "product_type",
  "google_product_category",
  "fb_product_category",
  "custom_label_0",
  "mpn",
  "quantity_to_sell_on_facebook",
  "shipping",
] as const;

export type FacebookCatalogColumn = (typeof FACEBOOK_CATALOG_COLUMNS)[number];

export type FacebookCatalogRow = Record<FacebookCatalogColumn, string>;

/** Rough Google product taxonomy IDs for plywood gifts / decor. */
const GOOGLE_CATEGORY_BY_SHOP: Partial<Record<CategoryId, string>> = {
  wedding: "536", // Arts & Entertainment > Party & Celebration > Wedding Ceremony Supplies
  birthday: "5709", // Party Supplies
  newborn: "537",
  baptism: "537",
  anniversary: "696",
  valentines: "696",
  christmas: "5709",
  halloween: "5709",
  school: "1239",
  newyear: "5709",
  spring: "696",
  gifts: "696",
  decor: "696", // Home & Garden > Decor
  panels: "696",
  ornaments: "696",
  kitchen: "638",
  nursery: "1239", // Toys & Games
  signs: "696",
  venues: "696",
  corporate: "111",
  keychains: "6551",
  jewelry: "188",
  pets: "1",
  auto: "5613",
  other: "696",
};

const FB_CATEGORY_BY_SHOP: Partial<Record<CategoryId, string>> = {
  wedding: "home > home decor",
  birthday: "home > home decor",
  newborn: "baby & toddler > nursery decor",
  baptism: "home > home decor",
  nursery: "toys & games > educational toys",
  decor: "home > home decor",
  panels: "home > home decor",
  ornaments: "home > home decor",
  kitchen: "home > kitchen & dining",
  keychains: "apparel & accessories > handbags, wallets & cases",
  jewelry: "apparel & accessories > jewelry",
  signs: "home > home decor",
  gifts: "home > home decor",
  other: "home > home decor",
};

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function tsvEscape(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formatPriceEur(amount: number): string {
  return `${amount.toFixed(2)} EUR`;
}

/** Meta shipping: COUNTRY:REGION:SERVICE:PRICE — BG nationwide via Econt default. */
function shippingForPrice(basePrice: number): string {
  const fee = shippingFeeFor("ECONT", basePrice);
  return `BG:::${fee.toFixed(2)} EUR`;
}

function productTitle(name: string): string {
  const base = name.trim();
  if (base.length <= 150) return base;
  return `${base.slice(0, 147).trimEnd()}…`;
}

/**
 * Load active products and map them to Meta Commerce catalog rows.
 * Uses product slug as stable id (required: ids must not change across uploads).
 */
export async function buildFacebookCatalogRows(): Promise<FacebookCatalogRow[]> {
  const products = await prisma.product.findMany({
    where: { ...catalogProductWhere },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      category: true,
      basePrice: true,
      imageUrl: true,
      galleryUrls: true,
    },
  });

  const rows: FacebookCatalogRow[] = [];

  for (const product of products) {
    const image = absoluteAssetUrl(product.imageUrl);
    if (!image) continue; // Meta requires image_link

    const gallery = Array.isArray(product.galleryUrls)
      ? (product.galleryUrls as unknown[])
          .filter((u): u is string => typeof u === "string" && u.length > 0)
          .map((u) => absoluteAssetUrl(u))
          .filter((u): u is string => Boolean(u) && u !== image)
      : [];

    const catId = product.category as CategoryId;
    const cat = categoryById(catId);
    const description = truncateMeta(
      stripHtml(product.description || product.name),
      5000,
    );
    const price = Number(product.basePrice);

    rows.push({
      id: product.slug,
      title: productTitle(product.name),
      description: description || product.name,
      availability: "in stock",
      condition: "new",
      price: formatPriceEur(price),
      link: absoluteUrl(`/products/${product.slug}`),
      image_link: image,
      brand: SITE_NAME,
      additional_image_link: gallery.slice(0, 10).join(","),
      product_type: cat?.label ?? product.category,
      google_product_category: GOOGLE_CATEGORY_BY_SHOP[catId] ?? "696",
      fb_product_category: FB_CATEGORY_BY_SHOP[catId] ?? "home > home decor",
      custom_label_0: product.category,
      mpn: product.slug,
      quantity_to_sell_on_facebook: "100",
      // Hint for Meta: free shipping applies from FREE_SHIPPING_MIN_EUR cart total
      shipping:
        price >= FREE_SHIPPING_MIN_EUR
          ? "BG:::0.00 EUR"
          : shippingForPrice(price),
    });
  }

  return rows;
}

export function rowsToCsv(rows: FacebookCatalogRow[]): string {
  const header = FACEBOOK_CATALOG_COLUMNS.join(",");
  const lines = rows.map((row) =>
    FACEBOOK_CATALOG_COLUMNS.map((col) => csvEscape(row[col] ?? "")).join(","),
  );
  return `\uFEFF${[header, ...lines].join("\n")}\n`;
}

export function rowsToTsv(rows: FacebookCatalogRow[]): string {
  const header = FACEBOOK_CATALOG_COLUMNS.join("\t");
  const lines = rows.map((row) =>
    FACEBOOK_CATALOG_COLUMNS.map((col) => tsvEscape(row[col] ?? "")).join("\t"),
  );
  return `${[header, ...lines].join("\n")}\n`;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function xmlTag(name: string, value: string, cdata = false): string {
  if (!value) return "";
  if (cdata) {
    const safe = value.replace(/]]>/g, "]]]]><![CDATA[>");
    return `      <${name}><![CDATA[${safe}]]></${name}>\n`;
  }
  return `      <${name}>${xmlEscape(value)}</${name}>\n`;
}

/**
 * Meta Commerce Manager XML (RSS 2.0 + Google namespace).
 * Use as scheduled fetch URL — Facebook pulls updates automatically.
 */
export function rowsToXml(rows: FacebookCatalogRow[]): string {
  const site = absoluteUrl("/");
  const items = rows
    .map((row) => {
      const extraImages = row.additional_image_link
        ? row.additional_image_link
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean)
            .map(
              (u) =>
                `      <g:additional_image_link>${xmlEscape(u)}</g:additional_image_link>\n`,
            )
            .join("")
        : "";

      return `    <item>
${xmlTag("g:id", row.id)}${xmlTag("g:title", row.title, true)}${xmlTag("g:description", row.description, true)}${xmlTag("g:link", row.link)}${xmlTag("g:image_link", row.image_link)}${extraImages}${xmlTag("g:availability", row.availability)}${xmlTag("g:condition", row.condition)}${xmlTag("g:price", row.price)}${xmlTag("g:brand", row.brand)}${xmlTag("g:mpn", row.mpn)}${xmlTag("g:product_type", row.product_type, true)}${xmlTag("g:google_product_category", row.google_product_category)}${xmlTag("g:custom_label_0", row.custom_label_0)}${xmlTag("g:quantity_to_sell_on_facebook", row.quantity_to_sell_on_facebook)}${xmlTag("g:shipping", row.shipping)}    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${xmlEscape(SITE_NAME)} — Facebook Catalog</title>
    <link>${xmlEscape(site)}</link>
    <description>Product catalog feed for Meta Commerce Manager (${rows.length} items)</description>
${items}
  </channel>
</rss>
`;
}

