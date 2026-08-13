import { z } from "zod";

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
  widthCm: z.coerce.number().positive().max(200),
  heightCm: z.coerce.number().positive().max(200),
  thicknessMm: z.coerce.number().int().positive(),
  complexity: z.enum(["simple", "medium", "complex"]),
  notes: z.string().max(1000).optional(),
  quantity: z.coerce.number().int().min(1).max(50).default(1),
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
