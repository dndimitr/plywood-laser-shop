import { z } from "zod";
import { MACHINE_BED_MAX_CM, MAX_LINE_QTY } from "@/lib/shop-config";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Въведете име"),
  customerEmail: z.string().email("Невалиден имейл"),
  customerPhone: z.string().min(6, "Въведете телефон"),
  shippingAddress: z.string().min(5, "Въведете адрес или офис на куриер"),
  shippingNote: z.string().optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "CASH_ON_DELIVERY", "CARD"]),
  courier: z.enum(["ECONT", "SPEEDY", "PICKUP"]).default("ECONT"),
  rush: z.boolean().default(false),
  needInvoice: z.boolean().default(false),
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  locale: z.enum(["bg", "en"]).default("bg"),
});

export const customQuoteSchema = z.object({
  widthCm: z.coerce
    .number()
    .positive()
    .max(
      MACHINE_BED_MAX_CM,
      `Максималният размер е ${MACHINE_BED_MAX_CM}×${MACHINE_BED_MAX_CM} см`,
    ),
  heightCm: z.coerce
    .number()
    .positive()
    .max(
      MACHINE_BED_MAX_CM,
      `Максималният размер е ${MACHINE_BED_MAX_CM}×${MACHINE_BED_MAX_CM} см`,
    ),
  thicknessMm: z.coerce.number().int().positive(),
  complexity: z.enum(["simple", "medium", "complex"]),
  notes: z.string().max(1000).optional(),
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QTY).default(1),
  rush: z.boolean().optional(),
  doubleSided: z.boolean().optional(),
});

export const addTemplateCartSchema = z.object({
  productId: z.string().min(1),
  optionId: z.string().min(1),
  engravingText: z.string().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
  rush: z.boolean().optional(),
});

const mediaPath = z
  .string()
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v),
    "Невалиден път или URL",
  );

export const productOptionFormSchema = z.object({
  label: z.string().min(1),
  sizeLabel: z.string().min(1),
  thicknessMm: z.coerce.number().int().positive(),
  laserType: z.enum(["ENGRAVE", "CUT", "BOTH"]),
  material: z.string().default("birch-plywood"),
  finish: z.string().default("raw"),
  doubleSided: z.boolean().default(false),
  priceModifier: z.coerce.number(),
});

export const productFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  category: z.string().default("other"),
  basePrice: z.coerce.number().positive(),
  imageUrl: mediaPath.optional().or(z.literal("")),
  galleryUrls: z.array(mediaPath).optional(),
  active: z.boolean().default(true),
  options: z.array(productOptionFormSchema).optional(),
});

export const shippingFeesSchema = z.object({
  ECONT: z.coerce.number().min(0),
  SPEEDY: z.coerce.number().min(0),
  PICKUP: z.coerce.number().min(0),
});

export const marketingSettingsSchema = z.object({
  gaMeasurementId: z.string().max(40).optional().default(""),
  googleAdsId: z.string().max(40).optional().default(""),
  googleAdsConversionLabel: z.string().max(80).optional().default(""),
  gtmId: z.string().max(40).optional().default(""),
  googleSiteVerification: z.string().max(120).optional().default(""),
  metaPixelId: z
    .string()
    .max(40)
    .regex(/^(\d{5,20})?$/, "Meta Pixel ID е само цифри")
    .optional()
    .default(""),
  /** Full token, masked •••• value (keep existing), or empty to clear. */
  metaCapiAccessToken: z.string().max(512).optional().default(""),
  metaCapiTestEventCode: z.string().max(64).optional().default(""),
  facebookPageUrl: z
    .string()
    .max(300)
    .refine(
      (v) =>
        !v ||
        /^https?:\/\/(www\.)?(facebook|fb)\.com\//i.test(v) ||
        /^https?:\/\/(www\.)?fb\.me\//i.test(v),
      "Въведете валиден Facebook URL или оставете празно",
    )
    .optional()
    .default(""),
  facebookShareEnabled: z.boolean().optional().default(true),
});

export const reviewSchema = z.object({
  authorName: z.string().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10).max(1000),
  productId: z.string().optional(),
});
