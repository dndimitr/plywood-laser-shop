import { z } from "zod";
import { MACHINE_BED_MAX_CM, MAX_LINE_QTY } from "@/lib/shop-config";

export const checkoutSchema = z
  .object({
    customerName: z.string().min(2, "Въведете име"),
    customerEmail: z.string().email("Невалиден имейл"),
    customerPhone: z.string().min(6, "Въведете телефон"),
    shippingAddress: z.string().optional().default(""),
    courierOfficeCode: z.string().max(40).optional(),
    shippingNote: z.string().optional(),
    paymentMethod: z.enum(["BANK_TRANSFER", "CASH_ON_DELIVERY", "CARD"]),
    courier: z.enum(["ECONT", "SPEEDY", "PICKUP"]).default("ECONT"),
    rush: z.boolean().default(false),
    needInvoice: z.boolean().default(false),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
    locale: z.enum(["bg", "en"]).default("bg"),
  })
  .superRefine((data, ctx) => {
    if (data.courier !== "PICKUP" && (data.shippingAddress?.trim().length ?? 0) < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Въведете адрес или офис на куриер",
        path: ["shippingAddress"],
      });
    }
    if (data.needInvoice) {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Въведете фирма",
          path: ["companyName"],
        });
      }
      if (!data.vatNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Въведете ЕИК / ДДС",
          path: ["vatNumber"],
        });
      }
    }
  });

export const customQuoteSchema = z.object({
  widthCm: z.coerce.number().positive().max(MACHINE_BED_MAX_CM),
  heightCm: z.coerce.number().positive().max(MACHINE_BED_MAX_CM),
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
  quantity: z.coerce.number().int().min(1).max(MAX_LINE_QTY).default(1),
  rush: z.boolean().optional(),
});

export const quoteRequestSchema = z.object({
  customerName: z.string().min(2, "Въведете име"),
  customerEmail: z.string().email("Невалиден имейл"),
  customerPhone: z.string().min(6, "Въведете телефон"),
  companyName: z.string().max(120).optional(),
  quantity: z.coerce.number().int().min(1).max(10000).optional(),
  message: z.string().min(10, "Опишете накратко нуждите").max(2000),
  source: z.enum(["business", "custom", "product"]).default("business"),
  productSlug: z.string().max(120).optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  category: z.string().default("other"),
  basePrice: z.coerce.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  galleryUrls: z.array(z.string().url()).optional(),
  active: z.boolean().default(true),
});

export const reviewSchema = z.object({
  authorName: z.string().min(2).max(80),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10).max(1000),
  productId: z.string().optional(),
});
