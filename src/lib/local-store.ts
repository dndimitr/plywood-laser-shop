import { createHash, randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { bgnToEur, roundMoney } from "@/lib/currency";
import {
  CATALOG_PRICE_FACTOR,
  CATALOG_PRODUCTS,
  LOW_PRICE_BUMP_FACTOR,
} from "../data/catalog-products";

export type LocalLaserType = "ENGRAVE" | "CUT" | "BOTH";
export type LocalOrderStatus =
  | "NEW"
  | "AWAITING_DESIGN"
  | "DESIGN_APPROVED"
  | "DESIGN_REJECTED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DONE"
  | "CANCELLED";
export type LocalPaymentMethod = "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "CARD";
export type LocalPaymentStatus =
  | "PENDING"
  | "AWAITING_TRANSFER"
  | "PAID"
  | "REFUNDED";
export type LocalCourier = "ECONT" | "SPEEDY" | "PICKUP";
export type LocalDesignReview =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";
export type LocalOrderItemType = "TEMPLATE" | "CUSTOM";

export type LocalAdminUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalCustomer = {
  id: string;
  email: string;
  passwordHash: string | null;
  name: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalProductOption = {
  id: string;
  productId: string;
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: LocalLaserType;
  material: string;
  finish: string;
  doubleSided: boolean;
  priceModifier: number;
  createdAt: string;
  updatedAt: string;
};

export type LocalProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl: string | null;
  galleryUrls: string[];
  active: boolean;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "SEASONAL_PAUSE";
  createdAt: string;
  updatedAt: string;
};

export type LocalPricingRule = {
  id: string;
  name: string;
  pricePerCm2: number;
  thicknessCoefficients: Record<string, number>;
  complexityMultipliers: Record<string, number>;
  quantityDiscounts: { minQty: number; percentOff: number }[];
  rushMultiplier: number;
  minPrice: number;
  minOrderAmount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalUploadedDesign = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  widthCm: number | null;
  heightCm: number | null;
  createdAt: string;
};

export type LocalOrderItem = {
  id: string;
  orderId: string;
  type: LocalOrderItemType;
  productId: string | null;
  uploadedDesignId: string | null;
  adminDesignId?: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  personalization: Record<string, unknown>;
  sheetCount?: number | null;
  createdAt: string;
};

export type LocalOrder = {
  id: string;
  publicToken: string;
  status: LocalOrderStatus;
  designReview: LocalDesignReview;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string | null;
  vatNumber: string | null;
  needInvoice: boolean;
  shippingAddress: string;
  shippingDetails?: Record<string, unknown> | null;
  shippingNote: string | null;
  courier: LocalCourier;
  shippingFee: number;
  rush: boolean;
  paymentMethod: LocalPaymentMethod;
  paymentStatus: LocalPaymentStatus;
  subtotalAmount: number;
  totalAmount: number;
  econtShipmentNumber?: string | null;
  econtPdfUrl?: string | null;
  trackingUrl?: string | null;
  speedyShipmentNumber?: string | null;
  machineStatus?: "NONE" | "QUEUE" | "CUTTING" | "PACKING_READY";
  paidAt?: string | null;
  reminderSentAt?: string | null;
  designReviewNote?: string | null;
  adminNotes: string | null;
  locale: string;
  createdAt: string;
  updatedAt: string;
};

export type LocalReview = {
  id: string;
  productId: string | null;
  authorName: string;
  rating: number;
  body: string;
  published: boolean;
  createdAt: string;
};

export type LocalOrderEvent = {
  id: string;
  orderId: string;
  actorEmail: string | null;
  type: string;
  message: string;
  payload?: unknown;
  createdAt: string;
};

export type LocalCustomerProfile = {
  id: string;
  email: string;
  phone: string | null;
  name: string | null;
  flag: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocalMessageTemplate = {
  id: string;
  key: string;
  subject: string;
  body: string;
  updatedAt: string;
};

export type LocalDb = {
  adminUsers: LocalAdminUser[];
  customers: LocalCustomer[];
  products: LocalProduct[];
  productOptions: LocalProductOption[];
  pricingRules: LocalPricingRule[];
  uploadedDesigns: LocalUploadedDesign[];
  orders: LocalOrder[];
  orderItems: LocalOrderItem[];
  reviews: LocalReview[];
  orderEvents: LocalOrderEvent[];
  customerProfiles: LocalCustomerProfile[];
  messageTemplates: LocalMessageTemplate[];
};

const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "plywood-laser-shop-data")
    : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "local-db.json");

/** Writable data directory (project `data/` locally, `/tmp/...` on Vercel). */
export function getDataDir() {
  return DATA_DIR;
}

function nowIso() {
  return new Date().toISOString();
}

function emptyDb(): LocalDb {
  return {
    adminUsers: [],
    customers: [],
    products: [],
    productOptions: [],
    pricingRules: [],
    uploadedDesigns: [],
    orders: [],
    orderItems: [],
    reviews: [],
    orderEvents: [],
    customerProfiles: [],
    messageTemplates: [],
  };
}

export function isLocalDbMode() {
  const url = process.env.DATABASE_URL?.trim();
  return !url || url === "local" || url.startsWith("file:local");
}

export function readLocalDb(): LocalDb {
  if (!existsSync(DB_PATH)) return emptyDb();
  const raw = JSON.parse(readFileSync(DB_PATH, "utf8")) as Partial<LocalDb>;
  return {
    ...emptyDb(),
    ...raw,
    customers: raw.customers ?? [],
    reviews: raw.reviews ?? [],
    orders: (raw.orders ?? []).map((order) => ({
      ...order,
      shippingDetails: order.shippingDetails ?? null,
      econtShipmentNumber: order.econtShipmentNumber ?? null,
      econtPdfUrl: order.econtPdfUrl ?? null,
      trackingUrl: order.trackingUrl ?? null,
      speedyShipmentNumber: order.speedyShipmentNumber ?? null,
      machineStatus: order.machineStatus ?? "NONE",
      paidAt: order.paidAt ?? null,
      reminderSentAt: order.reminderSentAt ?? null,
      designReviewNote: order.designReviewNote ?? null,
    })),
    orderItems: (raw.orderItems ?? []).map((item) => ({
      ...item,
      adminDesignId: item.adminDesignId ?? null,
      sheetCount: item.sheetCount ?? null,
    })),
    products: (raw.products ?? []).map((product) => ({
      ...product,
      availability: product.availability ?? "IN_STOCK",
    })),
    orderEvents: raw.orderEvents ?? [],
    customerProfiles: raw.customerProfiles ?? [],
    messageTemplates: raw.messageTemplates ?? [],
  };
}

export function writeLocalDb(db: LocalDb) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export function cuid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

/** Deterministic 24-char ids so every serverless instance shares the same catalog keys. */
export function stableId(namespace: string, key: string) {
  return createHash("sha256")
    .update(`${namespace}:${key}`)
    .digest("hex")
    .slice(0, 24);
}

function syncCatalogFromSource(db: LocalDb, ts = nowIso()) {
  const prevBySlug = new Map(db.products.map((p) => [p.slug, p]));
  db.products = [];
  db.productOptions = [];

  for (const product of CATALOG_PRODUCTS) {
    const { options, ...data } = product;
    const prev = prevBySlug.get(data.slug);
    const productId = stableId("product", data.slug);
    db.products.push({
      id: productId,
      ...data,
      active: true,
      createdAt: prev?.createdAt ?? ts,
      updatedAt: ts,
    });

    options.forEach((opt, index) => {
      db.productOptions.push({
        id: stableId("option", `${data.slug}:${index}:${opt.label}`),
        productId,
        ...opt,
        createdAt: ts,
        updatedAt: ts,
      });
    });
  }
}

export async function seedLocalDb(db: LocalDb): Promise<LocalDb> {
  const bcrypt = await import("bcryptjs");
  const ts = nowIso();
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@plywood.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminIdx = db.adminUsers.findIndex((u) => u.email === adminEmail);
  const admin: LocalAdminUser = {
    id: adminIdx >= 0 ? db.adminUsers[adminIdx].id : stableId("admin", adminEmail),
    email: adminEmail,
    passwordHash,
    name: "Администратор",
    createdAt: adminIdx >= 0 ? db.adminUsers[adminIdx].createdAt : ts,
    updatedAt: ts,
  };
  if (adminIdx >= 0) db.adminUsers[adminIdx] = admin;
  else db.adminUsers.push(admin);

  const ruleData = {
    name: "default-custom",
    pricePerCm2: roundMoney(
      bgnToEur(0.12 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    ),
    thicknessCoefficients: { "3": 1, "4": 1.15, "6": 1.35, default: 1.2 },
    complexityMultipliers: { simple: 1, medium: 1.25, complex: 1.6 },
    quantityDiscounts: [
      { minQty: 5, percentOff: 5 },
      { minQty: 10, percentOff: 10 },
      { minQty: 25, percentOff: 15 },
    ],
    rushMultiplier: 1.5,
    minPrice: roundMoney(
      bgnToEur(18 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    ),
    minOrderAmount: roundMoney(
      bgnToEur(12 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    ),
    active: true,
  };
  const ruleIdx = db.pricingRules.findIndex((r) => r.name === ruleData.name);
  if (ruleIdx >= 0) {
    db.pricingRules[ruleIdx] = {
      ...db.pricingRules[ruleIdx],
      ...ruleData,
      updatedAt: ts,
    };
  } else {
    db.pricingRules.push({
      id: stableId("pricing", ruleData.name),
      ...ruleData,
      createdAt: ts,
      updatedAt: ts,
    });
  }

  syncCatalogFromSource(db, ts);

  const weddingId =
    db.products.find((p) => p.category === "wedding")?.id ?? null;
  db.reviews = [
    {
      id: stableId("review", "maria-k"),
      productId: db.products[0]?.id ?? null,
      authorName: "Мария К.",
      rating: 5,
      body: "Чисти ръбове и точно гравиране. Получих ключодържателите за 4 дни.",
      published: true,
      createdAt: ts,
    },
    {
      id: stableId("review", "ivan-p"),
      productId: db.products[1]?.id ?? null,
      authorName: "Иван П.",
      rating: 5,
      body: "Табелата за офиса изглежда професионално. Добра комуникация за макета.",
      published: true,
      createdAt: ts,
    },
    {
      id: stableId("review", "nikoleta-d"),
      productId: weddingId,
      authorName: "Николета Д.",
      rating: 5,
      body: "Топерът за тортата и картичките за местата бяха хитови на сватбата. Препоръчвам.",
      published: true,
      createdAt: ts,
    },
    {
      id: stableId("review", "georgi-s"),
      productId: null,
      authorName: "Георги С.",
      rating: 4,
      body: "Качих SVG и цената съвпадна с калкулатора. Добра опция за къстъм поръчки.",
      published: true,
      createdAt: ts,
    },
  ];

  writeLocalDb(db);
  return db;
}

function catalogNeedsSync(db: LocalDb) {
  if (db.products.length !== CATALOG_PRODUCTS.length) return true;
  if (
    db.productOptions.length !==
    CATALOG_PRODUCTS.reduce((n, p) => n + p.options.length, 0)
  ) {
    return true;
  }
  for (const product of CATALOG_PRODUCTS) {
    const expectedId = stableId("product", product.slug);
    const row = db.products.find((p) => p.slug === product.slug);
    if (!row || row.id !== expectedId) return true;
    if (Number(row.basePrice) !== Number(product.basePrice)) return true;

    for (let index = 0; index < product.options.length; index++) {
      const opt = product.options[index];
      const expectedOptId = stableId(
        "option",
        `${product.slug}:${index}:${opt.label}`,
      );
      const optRow = db.productOptions.find((o) => o.id === expectedOptId);
      if (!optRow || optRow.productId !== expectedId) return true;
      if (Number(optRow.priceModifier) !== Number(opt.priceModifier)) return true;
    }
  }
  return false;
}

export async function ensureLocalDb(): Promise<LocalDb> {
  let db = readLocalDb();
  if (db.adminUsers.length === 0) {
    db = await seedLocalDb(db);
  } else if (catalogNeedsSync(db)) {
    // Re-sync catalog with stable ids (fixes cross-instance /tmp drift on Vercel)
    syncCatalogFromSource(db);
    writeLocalDb(db);
  }
  // migrate older local DBs missing new arrays/fields
  let dirty = false;
  if (!db.reviews) {
    db.reviews = [];
    dirty = true;
  }
  if (!db.customers) {
    db.customers = [];
    dirty = true;
  }
  for (const p of db.products) {
    if (!p.category) {
      p.category = "other";
      dirty = true;
    }
    if (!p.galleryUrls) {
      p.galleryUrls = p.imageUrl ? [p.imageUrl] : [];
      dirty = true;
    }
  }
  for (const o of db.productOptions) {
    if (!o.material) {
      o.material = "birch-plywood";
      dirty = true;
    }
    if (!o.finish) {
      o.finish = "raw";
      dirty = true;
    }
    if (o.doubleSided == null) {
      o.doubleSided = false;
      dirty = true;
    }
  }
  for (const rule of db.pricingRules) {
    const nextPerCm2 = roundMoney(
      bgnToEur(0.12 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    );
    const nextMinPrice = roundMoney(
      bgnToEur(18 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    );
    const nextMinOrder = roundMoney(
      bgnToEur(12 * CATALOG_PRICE_FACTOR) * LOW_PRICE_BUMP_FACTOR,
    );
    // Legacy BGN → EUR one-time migrate
    if (Number(rule.pricePerCm2) === 0.12) {
      rule.pricePerCm2 = nextPerCm2;
      dirty = true;
    }
    if (Number(rule.minPrice) === 18) {
      rule.minPrice = nextMinPrice;
      dirty = true;
    }
    if (Number(rule.minOrderAmount) === 12) {
      rule.minOrderAmount = nextMinOrder;
      dirty = true;
    }
    // Keep custom pricing aligned with catalog price factor + low-price bump
    if (
      rule.name === "default-custom" &&
      (Number(rule.pricePerCm2) !== nextPerCm2 ||
        Number(rule.minPrice) !== nextMinPrice ||
        Number(rule.minOrderAmount) !== nextMinOrder)
    ) {
      rule.pricePerCm2 = nextPerCm2;
      rule.minPrice = nextMinPrice;
      rule.minOrderAmount = nextMinOrder;
      dirty = true;
    }
  }
  if (dirty) writeLocalDb(db);
  return db;
}
