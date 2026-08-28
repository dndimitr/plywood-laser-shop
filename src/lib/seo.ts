import type { Metadata } from "next";
import {
  categoryLandingById,
  categoryLandingPath,
  genericCategoryMeta,
} from "@/lib/category-landings";
import { occasionByCategoryId, occasionPath } from "@/lib/occasions";
import { CATEGORIES, type CategoryId, categoryById } from "@/lib/shop-config";
import {
  adsConversionSendTo,
  getMarketingSettings,
  hasActiveMarketingScripts,
} from "@/lib/shop-settings";

/** Brand & site-wide SEO defaults (Bulgarian storefront) */
export const SITE_NAME = "Studio Breza";
/** Legal / bank entity — keep until company rename is registered */
export const SITE_NAME_LEGAL = "ЛазерШперплат ЕООД";
export const SITE_TAGLINE = "Подаръци с име и гравиране";
export const DEFAULT_DESCRIPTION =
  "Подарък с име, дата или послание — за сватба, рожден ден и кръщене. Лазерно гравиране от Studio Breza във Варна. Готов модел или ваш дизайн. 2–5 дни, доставка в цяла България.";
export const BRAND_LOGO_PATH = "/brand/studio-breza-logo-header.png";
export const BRAND_MARK_PATH = "/brand/studio-breza-mark-512.png";

/** Public storefront domain (custom domain on Vercel). */
export const CANONICAL_SITE_URL = "https://studiobreza.eu";

export const SEO_KEYWORDS = [
  "персонализирани подаръци",
  "подарък с име",
  "гравирани подаръци",
  "лазерно гравиране Варна",
  "сватбени украси",
  "подарък за рожден ден",
  "подарък за кръщене",
  "персонализирана декорация",
  "украси по поръчка",
  "гравиране България",
] as const;

const META_DESCRIPTION_MAX = 160;

/** Hosts that must never appear in OG / share / canonical URLs. */
const DEAD_PUBLIC_HOSTS = new Set([
  "plywood-laser-shop.vercel.app",
]);

function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) return CANONICAL_SITE_URL;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (
      DEAD_PUBLIC_HOSTS.has(url.hostname) ||
      (process.env.VERCEL_ENV === "production" &&
        url.hostname.endsWith(".vercel.app"))
    ) {
      return CANONICAL_SITE_URL;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return CANONICAL_SITE_URL;
  }
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return normalizeSiteUrl(fromEnv);

  // Production: always the custom domain — never VERCEL_PROJECT_PRODUCTION_URL
  // (that alias can 404 / DEPLOYMENT_NOT_FOUND and breaks Facebook previews).
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_URL;
  }

  // Preview / branch deploys
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeSiteUrl(`https://${vercelUrl}`);

  return "http://localhost:3000";
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
  const occasion = occasionByCategoryId(catId);
  if (occasion) {
    return {
      title: occasion.title,
      description: truncateMeta(occasion.description),
      path: occasionPath(occasion.slug),
    };
  }
  const landing = categoryLandingById(catId);
  if (landing) {
    return {
      title: landing.title,
      description: truncateMeta(landing.description),
      path: categoryLandingPath(landing.slug),
    };
  }
  const fallback = genericCategoryMeta(catId);
  const cat = categoryById(catId as CategoryId);
  if (!fallback || !cat) return null;
  return {
    title: fallback.title,
    description: truncateMeta(fallback.description),
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
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: DEFAULT_DESCRIPTION,
      images: [absoluteUrl("/opengraph-image")],
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: BRAND_MARK_PATH, sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon.ico",
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
  const { facebookPageUrl } = getMarketingSettings();
  const sameAs = [facebookPageUrl.trim()].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_NAME_LEGAL,
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(BRAND_MARK_PATH),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(BRAND_LOGO_PATH),
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "BG",
    },
    ...(sameAs.length ? { sameAs } : {}),
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
        urlTemplate: `${getSiteUrl()}/katalog?q={search_term_string}`,
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
  const url = absoluteUrl(`/products/${opts.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: opts.name,
    description: opts.description,
    image: images,
    sku: opts.slug,
    mpn: opts.slug,
    category: cat,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: opts.currency ?? "EUR",
      price: opts.price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
        .toISOString()
        .slice(0, 10),
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
        url: getSiteUrl(),
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BG",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
    },
  };
}

/** Sitewide AggregateRating from published reviews (LocalBusiness). */
export function aggregateRatingJsonLd(
  reviews: Array<{ rating: number }>,
) {
  if (!reviews.length) return null;
  const count = reviews.length;
  const sum = reviews.reduce((s, r) => s + Number(r.rating || 0), 0);
  const ratingValue = Math.round((sum / count) * 10) / 10;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: getSiteUrl(),
    image: absoluteUrl(BRAND_LOGO_PATH),
    address: {
      "@type": "PostalAddress",
      addressCountry: "BG",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      reviewCount: String(count),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export {
  CONSENT_STORAGE_KEY,
  facebookShareUrl,
  type ConsentChoice,
} from "@/lib/seo-client";
