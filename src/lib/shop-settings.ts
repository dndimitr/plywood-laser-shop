import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { bgnToEur } from "@/lib/currency";
import { FREE_SHIPPING_MIN_EUR } from "@/lib/shop-config";
import { getDataDir } from "@/lib/local-store";

export type ShippingFees = {
  ECONT: number;
  SPEEDY: number;
  PICKUP: number;
};

/** Admin-configurable marketing / tracking IDs (env used as fallback). */
export type MarketingSettings = {
  gaMeasurementId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
  gtmId: string;
  googleSiteVerification: string;
  metaPixelId: string;
  /** Публичен URL на Facebook страницата (за линк и споделяне) */
  facebookPageUrl: string;
  /** Показвай бутон „Сподели във Facebook“ на продуктовите страници */
  facebookShareEnabled: boolean;
};

export type ShopSettingsFile = {
  shippingFees?: Partial<ShippingFees>;
  marketing?: Partial<MarketingSettings>;
  updatedAt?: string;
};

const SETTINGS_FILE = "shop-settings.json";

function shippingDefaults(): ShippingFees {
  return {
    ECONT: Number(process.env.SHIPPING_FEE_ECONT) || bgnToEur(6.9),
    SPEEDY: Number(process.env.SHIPPING_FEE_SPEEDY) || bgnToEur(7.5),
    PICKUP: Number(process.env.SHIPPING_FEE_PICKUP) || 0,
  };
}

function marketingEnvDefaults(): MarketingSettings {
  return {
    gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "",
    googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() ?? "",
    googleAdsConversionLabel:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim() ?? "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "",
    googleSiteVerification:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ?? "",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "",
    facebookPageUrl: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL?.trim() ?? "",
    facebookShareEnabled: true,
  };
}

function settingsPath() {
  return path.join(getDataDir(), SETTINGS_FILE);
}

function readRaw(): ShopSettingsFile {
  const file = settingsPath();
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, "utf8")) as ShopSettingsFile;
  } catch {
    return {};
  }
}

function writeRaw(next: ShopSettingsFile) {
  const dir = getDataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    settingsPath(),
    JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

export function getShippingFees(): ShippingFees {
  const base = shippingDefaults();
  const raw = readRaw();
  let ECONT = Number(raw.shippingFees?.ECONT ?? base.ECONT);
  let SPEEDY = Number(raw.shippingFees?.SPEEDY ?? base.SPEEDY);
  const PICKUP = Number(raw.shippingFees?.PICKUP ?? base.PICKUP);

  // One-time migrate legacy BGN defaults persisted before EUR switch
  let dirty = false;
  if (ECONT === 6.9) {
    ECONT = base.ECONT;
    dirty = true;
  }
  if (SPEEDY === 7.5) {
    SPEEDY = base.SPEEDY;
    dirty = true;
  }
  if (dirty) {
    writeRaw({
      ...raw,
      shippingFees: { ECONT, SPEEDY, PICKUP },
    });
  }

  return { ECONT, SPEEDY, PICKUP };
}

export function setShippingFees(fees: ShippingFees) {
  const raw = readRaw();
  writeRaw({
    ...raw,
    shippingFees: {
      ECONT: Number(fees.ECONT),
      SPEEDY: Number(fees.SPEEDY),
      PICKUP: Number(fees.PICKUP),
    },
  });
}

export function shippingFeeFor(courier: string, subtotal = 0) {
  if (courier === "PICKUP") return 0;
  if (subtotal >= FREE_SHIPPING_MIN_EUR) return 0;
  const fees = getShippingFees();
  if (courier === "ECONT" || courier === "SPEEDY") {
    return fees[courier];
  }
  return fees.ECONT;
}

export function getCourierOptions() {
  const fees = getShippingFees();
  return [
    { id: "ECONT" as const, label: "Еконт", fee: fees.ECONT },
    { id: "SPEEDY" as const, label: "Speedy", fee: fees.SPEEDY },
    { id: "PICKUP" as const, label: "Лично получаване", fee: fees.PICKUP },
  ];
}

function normalizeMarketing(
  partial: Partial<MarketingSettings> | undefined,
  base: MarketingSettings,
): MarketingSettings {
  const pick = (key: keyof MarketingSettings) => {
    const fromFile = partial?.[key];
    if (typeof fromFile === "boolean") return fromFile;
    if (typeof fromFile === "string") return fromFile.trim();
    return base[key];
  };
  return {
    gaMeasurementId: String(pick("gaMeasurementId") ?? ""),
    googleAdsId: String(pick("googleAdsId") ?? ""),
    googleAdsConversionLabel: String(pick("googleAdsConversionLabel") ?? ""),
    gtmId: String(pick("gtmId") ?? ""),
    googleSiteVerification: String(pick("googleSiteVerification") ?? ""),
    metaPixelId: String(pick("metaPixelId") ?? ""),
    facebookPageUrl: String(pick("facebookPageUrl") ?? ""),
    facebookShareEnabled:
      typeof partial?.facebookShareEnabled === "boolean"
        ? partial.facebookShareEnabled
        : base.facebookShareEnabled,
  };
}

/**
 * Effective marketing config: admin file values override empty slots from env.
 * Non-empty admin fields win; empty admin field falls back to env default.
 */
export function getMarketingSettings(): MarketingSettings {
  const env = marketingEnvDefaults();
  const raw = readRaw().marketing;
  if (!raw) return env;

  const merged = normalizeMarketing(raw, env);
  // Explicit empty string in admin clears the value (allows disabling env)
  // If key missing from file, keep env — handled by normalize using base when undefined
  const fileKeys = raw as Record<string, unknown>;
  return {
    gaMeasurementId:
      "gaMeasurementId" in fileKeys
        ? String(raw.gaMeasurementId ?? "").trim()
        : env.gaMeasurementId,
    googleAdsId:
      "googleAdsId" in fileKeys
        ? String(raw.googleAdsId ?? "").trim()
        : env.googleAdsId,
    googleAdsConversionLabel:
      "googleAdsConversionLabel" in fileKeys
        ? String(raw.googleAdsConversionLabel ?? "").trim()
        : env.googleAdsConversionLabel,
    gtmId: "gtmId" in fileKeys ? String(raw.gtmId ?? "").trim() : env.gtmId,
    googleSiteVerification:
      "googleSiteVerification" in fileKeys
        ? String(raw.googleSiteVerification ?? "").trim()
        : env.googleSiteVerification,
    metaPixelId:
      "metaPixelId" in fileKeys
        ? String(raw.metaPixelId ?? "").trim()
        : env.metaPixelId,
    facebookPageUrl:
      "facebookPageUrl" in fileKeys
        ? String(raw.facebookPageUrl ?? "").trim()
        : env.facebookPageUrl,
    facebookShareEnabled:
      typeof raw.facebookShareEnabled === "boolean"
        ? raw.facebookShareEnabled
        : env.facebookShareEnabled,
  };
}

/** Raw admin form values (what is stored / edited), with env shown as placeholders via defaults. */
export function getMarketingSettingsForAdmin(): MarketingSettings {
  const env = marketingEnvDefaults();
  const raw = readRaw().marketing ?? {};
  return {
    gaMeasurementId: String(raw.gaMeasurementId ?? env.gaMeasurementId),
    googleAdsId: String(raw.googleAdsId ?? env.googleAdsId),
    googleAdsConversionLabel: String(
      raw.googleAdsConversionLabel ?? env.googleAdsConversionLabel,
    ),
    gtmId: String(raw.gtmId ?? env.gtmId),
    googleSiteVerification: String(
      raw.googleSiteVerification ?? env.googleSiteVerification,
    ),
    metaPixelId: String(raw.metaPixelId ?? env.metaPixelId),
    facebookPageUrl: String(raw.facebookPageUrl ?? env.facebookPageUrl),
    facebookShareEnabled:
      typeof raw.facebookShareEnabled === "boolean"
        ? raw.facebookShareEnabled
        : true,
  };
}

export function setMarketingSettings(input: MarketingSettings) {
  const raw = readRaw();
  writeRaw({
    ...raw,
    marketing: {
      gaMeasurementId: input.gaMeasurementId.trim(),
      googleAdsId: input.googleAdsId.trim(),
      googleAdsConversionLabel: input.googleAdsConversionLabel.trim(),
      gtmId: input.gtmId.trim(),
      googleSiteVerification: input.googleSiteVerification.trim(),
      metaPixelId: input.metaPixelId.trim(),
      facebookPageUrl: input.facebookPageUrl.trim(),
      facebookShareEnabled: Boolean(input.facebookShareEnabled),
    },
  });
}

export function hasActiveMarketingScripts(m = getMarketingSettings()): boolean {
  return Boolean(
    m.gaMeasurementId || m.googleAdsId || m.gtmId || m.metaPixelId,
  );
}

export function adsConversionSendTo(m = getMarketingSettings()): string | null {
  if (!m.googleAdsId || !m.googleAdsConversionLabel) return null;
  if (m.googleAdsConversionLabel.includes("/")) {
    return m.googleAdsConversionLabel;
  }
  return `${m.googleAdsId}/${m.googleAdsConversionLabel}`;
}
