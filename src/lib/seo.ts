import type { Metadata } from "next";
import { CATEGORIES, type CategoryId, categoryById } from "@/lib/shop-config";
import {
  adsConversionSendTo,
  getMarketingSettings,
  hasActiveMarketingScripts,
} from "@/lib/shop-settings";

/** Brand & site-wide SEO defaults (Bulgarian storefront) */
export const SITE_NAME = "ЛазерШперплат";
export const SITE_NAME_LEGAL = "ЛазерШперплат ЕООД";
export const SITE_TAGLINE =
  "Лазерно изрязване и гравиране на шперплат";
export const DEFAULT_DESCRIPTION =
  "Лазерно гравиране и изрязване на шперплат по готов модел или ваш файл. Персонализация, ясна цена и доставка с Еконт или Speedy в цяла България.";

export const SEO_KEYWORDS = [
  "лазерно изрязване",
  "лазерно гравиране",
  "шперплат",
  "ключодържатели",
  "сватбени табели",
  "персонализирани подаръци",
  "лазер шперплат България",
  "поръчка по SVG",
] as const;

const META_DESCRIPTION_MAX = 160;

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Resolve relative/public asset to absolute URL for OG/Twitter */
export function absoluteAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return absoluteUrl(url.startsWith("/") ? url : `/${url}`);
}

export function truncateMeta(
  text: string,
  max = META_DESCRIPTION_MAX,
): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

export type AnalyticsConfig = {
  gaMeasurementId: string | null;
  googleAdsId: string | null;
  /** Full send_to value e.g. AW-XXX/abcDEFgh or just the label part */
  googleAdsConversionLabel: string | null;
  gtmId: string | null;
  googleSiteVerification: string | null;
  metaPixelId: string | null;
  facebookPageUrl: string | null;
  facebookShareEnabled: boolean;
};

function nonEmpty(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/** Effective analytics config from admin settings (env fallback). */
export function getAnalyticsConfig(): AnalyticsConfig {
  const m = getMarketingSettings();
  return {
    gaMeasurementId: nonEmpty(m.gaMeasurementId),
    googleAdsId: nonEmpty(m.googleAdsId),
    googleAdsConversionLabel: nonEmpty(m.googleAdsConversionLabel),
    gtmId: nonEmpty(m.gtmId),
    googleSiteVerification: nonEmpty(m.googleSiteVerification),
    metaPixelId: nonEmpty(m.metaPixelId),
    facebookPageUrl: nonEmpty(m.facebookPageUrl),
    facebookShareEnabled: m.facebookShareEnabled !== false,
  };
}

export function hasMarketingScripts(): boolean {
  return hasActiveMarketingScripts();
}

/** Conversion send_to for gtag (AW-XXX/label) */
export function getAdsConversionSendTo(): string | null {
  return adsConversionSendTo();
}

export function categorySeo(catId: string | undefined): {
  title: string;
  description: string;
  path: string;
} | null {
  if (!catId) return null;
  const cat = categoryById(catId as CategoryId);
  if (!cat) return null;
  return {
    title: `${cat.label} от шперплат`,
    description: truncateMeta(
      `Лазерно изрязани и гравирани продукти в категория „${cat.label}“ — персонализация, ясна цена и доставка в България от ${SITE_NAME}.`,
    ),
    path: `/?cat=${encodeURIComponent(cat.id)}`,
  };
}

export function buildPageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
}): Metadata {
  const title = opts.title;
  const description = truncateMeta(opts.description ?? DEFAULT_DESCRIPTION);
  const url = absoluteUrl(opts.path ?? "/");
  const image = absoluteAssetUrl(opts.image) ?? absoluteUrl("/opengraph-image");
  const noIndex = opts.noIndex ?? false;

  return {
    title,
    description,
    keywords: [...SEO_KEYWORDS],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: opts.type === "article" ? "article" : "website",
      locale: "bg_BG",
      url,
      siteName: SITE_NAME,
      title: title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title ? `${title} — ${SITE_NAME}` : SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export function rootMetadata(): Metadata {
  const { googleSiteVerification } = getAnalyticsConfig();
  const base = getSiteUrl();

  return {
    metadataBase: new URL(base),
    title: {
      default: `${SITE_NAME} — ${SITE_TAGLINE}`,
      template: `%s · ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME_LEGAL }],
    creator: SITE_NAME,
    publisher: SITE_NAME_LEGAL,
    category: "ecommerce",
    keywords: [...SEO_KEYWORDS],
    formatDetection: {
      telephone: true,
      email: true,
      address: false,
    },
    alternates: {
      canonical: absoluteUrl("/"),
      languages: {
        "bg-BG": absoluteUrl("/"),
      },
    },
    openGraph: {
      type: "website",
      locale: "bg_BG",
      url: absoluteUrl("/"),
      siteName: SITE_NAME,
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — лазерно изрязване на шперплат`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [absoluteUrl("/opengraph-image")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: googleSiteVerification
      ? { google: googleSiteVerification }
      : undefined,
    other: {
      "geo.region": "BG",
    },
  };
}

export function organizationJsonLd() {
  const phone = process.env.NEXT_PUBLIC_SHOP_PHONE?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_NAME_LEGAL,
    url: getSiteUrl(),
    logo: absoluteUrl("/opengraph-image"),
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "BG",
    },
    ...(phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            telephone: phone,
            contactType: "customer service",
            availableLanguage: ["Bulgarian"],
            areaServed: "BG",
          },
        }
      : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    inLanguage: "bg-BG",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getSiteUrl()}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(
  items: Array<{ q: string; a: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(opts: {
  name: string;
  description: string;
  slug: string;
  imageUrl?: string | null;
  price: number;
  currency?: string;
  category?: string;
}) {
  const images = opts.imageUrl
    ? [absoluteAssetUrl(opts.imageUrl)!].filter(Boolean)
    : [absoluteUrl("/opengraph-image")];
  const cat = opts.category
    ? CATEGORIES.find((c) => c.id === opts.category)?.label
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    image: images,
    sku: opts.slug,
    category: cat,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${opts.slug}`),
      priceCurrency: opts.currency ?? "BGN",
      price: opts.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  };
}

export {
  CONSENT_STORAGE_KEY,
  facebookShareUrl,
  type ConsentChoice,
} from "@/lib/seo-client";
