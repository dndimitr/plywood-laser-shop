import {
  cuid,
  ensureLocalDb,
  readLocalDb,
  writeLocalDb,
  type LocalCourier,
  type LocalDb,
  type LocalDesignReview,
  type LocalOrder,
  type LocalOrderItem,
  type LocalPaymentStatus,
  type LocalPricingRule,
  type LocalProduct,
  type LocalProductOption,
  type LocalReview,
  type LocalUploadedDesign,
} from "@/lib/local-store";

function toDate<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  for (const key of Object.keys(out)) {
    if (
      (key.endsWith("At") || key === "createdAt" || key === "updatedAt") &&
      typeof out[key] === "string"
    ) {
      out[key] = new Date(out[key] as string);
    }
  }
  return out as T;
}

function sortBy<T>(items: T[], orderBy?: Record<string, "asc" | "desc">): T[] {
  if (!orderBy) return items;
  const [key, dir] = Object.entries(orderBy)[0] ?? [];
  if (!key) return items;
  return [...items].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : 1;
    return dir === "desc" ? -cmp : cmp;
  });
}

function withProductDefaults(product: LocalProduct) {
  return {
    ...product,
    category: product.category ?? "other",
    galleryUrls: product.galleryUrls ?? [],
    availability: product.availability ?? "IN_STOCK",
    shortTitle: product.shortTitle ?? null,
  };
}

function withOptionDefaults(option: LocalProductOption) {
  return {
    ...option,
    material: option.material ?? "birch-plywood",
    finish: option.finish ?? "raw",
    doubleSided: option.doubleSided ?? false,
  };
}

function withPricingDefaults(rule: LocalPricingRule) {
  return {
    ...rule,
    quantityDiscounts: rule.quantityDiscounts ?? [],
    rushMultiplier: rule.rushMultiplier ?? 1.5,
    minOrderAmount: rule.minOrderAmount ?? 0,
  };
}

function withOptions(db: LocalDb, product: LocalProduct) {
  return toDate({
    ...withProductDefaults(product),
    options: sortBy(
      db.productOptions.filter((o) => o.productId === product.id),
      { priceModifier: "asc" },
    ).map((o) => toDate(withOptionDefaults(o))),
  });
}

function withOrderRelations(db: LocalDb, order: LocalOrder) {
  const items = db.orderItems
    .filter((i) => i.orderId === order.id)
    .map((item) => {
      const uploadedDesign = item.uploadedDesignId
        ? db.uploadedDesigns.find((d) => d.id === item.uploadedDesignId) ?? null
        : null;
      const adminDesign = item.adminDesignId
        ? db.uploadedDesigns.find((d) => d.id === item.adminDesignId) ?? null
        : null;
      const product = item.productId
        ? db.products.find((p) => p.id === item.productId) ?? null
        : null;
      return toDate({
        ...item,
        uploadedDesign: uploadedDesign ? toDate(uploadedDesign) : null,
        adminDesign: adminDesign ? toDate(adminDesign) : null,
        product: product ? toDate(withProductDefaults(product)) : null,
      });
    });
  return toDate({
    ...order,
    items,
    events: (db.orderEvents ?? [])
      .filter((event) => event.orderId === order.id)
      .map((event) => toDate(event)),
  });
}

function mutate(fn: (db: LocalDb) => unknown) {
  const db = readLocalDb();
  const result = fn(db);
  writeLocalDb(db);
  return result;
}

type ProductOptionCreate = {
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: LocalProductOption["laserType"];
  priceModifier: number;
  material?: string;
  finish?: string;
  doubleSided?: boolean;
};

type ProductWhere = {
  active?: boolean;
  category?: string;
  name?: { contains?: string; mode?: string };
  OR?: Array<{
    name?: { contains?: string; mode?: string };
    description?: { contains?: string; mode?: string };
    slug?: { contains?: string; mode?: string };
  }>;
};

function matchesContains(
  value: string,
  filter?: { contains?: string; mode?: string },
) {
  if (!filter?.contains) return true;
  const hay = filter.mode === "insensitive" ? value.toLowerCase() : value;
  const needle =
    filter.mode === "insensitive"
      ? filter.contains.toLowerCase()
      : filter.contains;
  return hay.includes(needle);
}

function filterProducts(products: LocalProduct[], where?: ProductWhere) {
  if (!where) return products;
  return products.filter((p) => {
    if (where.active != null && p.active !== where.active) return false;
    if (where.category != null && p.category !== where.category) return false;
    if (where.name && !matchesContains(p.name, where.name)) return false;
    if (where.OR?.length) {
      const ok = where.OR.some((clause) => {
        if (clause.name && matchesContains(p.name, clause.name)) return true;
        if (
          clause.description &&
          matchesContains(p.description, clause.description)
        )
          return true;
        if (clause.slug && matchesContains(p.slug, clause.slug)) return true;
        return false;
      });
      if (!ok) return false;
    }
    return true;
  });
}

export function createLocalPrisma() {
  return {
    async $disconnect() {
      /* no-op */
    },

    adminUser: {
      async findUnique(args: { where: { email?: string; id?: string } }) {
        await ensureLocalDb();
        const db = readLocalDb();
        const user = db.adminUsers.find(
          (u) =>
            (args.where.email && u.email === args.where.email) ||
            (args.where.id && u.id === args.where.id),
        );
        return user ? toDate(user) : null;
      },
    },

    product: {
      async findMany(args?: {
        where?: ProductWhere;
        include?: { options?: boolean };
        orderBy?: Record<string, "asc" | "desc">;
        take?: number;
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        let products = filterProducts(db.products, args?.where);
        products = sortBy(products, args?.orderBy ?? { name: "asc" });
        if (args?.take != null) products = products.slice(0, args.take);
        if (args?.include?.options) {
          return products.map((p) => withOptions(db, p));
        }
        return products.map((p) => toDate(withProductDefaults(p)));
      },

      async findUnique(args: {
        where: { id?: string; slug?: string };
        include?: { options?: boolean };
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        const product = db.products.find(
          (p) =>
            (args.where.id && p.id === args.where.id) ||
            (args.where.slug && p.slug === args.where.slug),
        );
        if (!product) return null;
        return args.include?.options
          ? withOptions(db, product)
          : toDate(withProductDefaults(product));
      },

      async findFirst(args: {
        where: { id?: string; slug?: string; active?: boolean };
        include?: {
          options?: boolean | { orderBy?: Record<string, "asc" | "desc"> };
        };
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        const product = db.products.find((p) => {
          if (args.where.id && p.id !== args.where.id) return false;
          if (args.where.slug && p.slug !== args.where.slug) return false;
          if (args.where.active != null && p.active !== args.where.active)
            return false;
          return true;
        });
        if (!product) return null;
        if (args.include?.options) {
          const withOpts = withOptions(db, product);
          if (
            typeof args.include.options === "object" &&
            args.include.options.orderBy
          ) {
            withOpts.options = sortBy(
              withOpts.options as LocalProductOption[],
              args.include.options.orderBy,
            );
          }
          return withOpts;
        }
        return toDate(withProductDefaults(product));
      },

      async count() {
        await ensureLocalDb();
        return readLocalDb().products.length;
      },

      async create(args: {
        data: {
          name: string;
          slug: string;
          shortTitle?: string | null;
          description: string;
          category?: string;
          basePrice: number;
          imageUrl?: string | null;
          galleryUrls?: string[];
          active?: boolean;
          availability?: LocalProduct["availability"];
          options?: { create: ProductOptionCreate[] };
        };
        include?: { options?: boolean };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const ts = new Date().toISOString();
          const product: LocalProduct = {
            id: cuid(),
            name: args.data.name,
            slug: args.data.slug,
            shortTitle: args.data.shortTitle ?? null,
            description: args.data.description,
            category: args.data.category ?? "other",
            basePrice: Number(args.data.basePrice),
            imageUrl: args.data.imageUrl ?? null,
            galleryUrls: args.data.galleryUrls ?? [],
            active: args.data.active ?? true,
            createdAt: ts,
            updatedAt: ts,
          };
          db.products.push(product);
          for (const opt of args.data.options?.create ?? []) {
            db.productOptions.push({
              id: cuid(),
              productId: product.id,
              label: opt.label,
              sizeLabel: opt.sizeLabel,
              thicknessMm: Number(opt.thicknessMm),
              laserType: opt.laserType,
              material: opt.material ?? "birch-plywood",
              finish: opt.finish ?? "raw",
              doubleSided: opt.doubleSided ?? false,
              priceModifier: Number(opt.priceModifier),
              createdAt: ts,
              updatedAt: ts,
            });
          }
          return args.include?.options
            ? withOptions(db, product)
            : toDate(withProductDefaults(product));
        });
      },

      async update(args: {
        where: { id: string };
        data: {
          name?: string;
          slug?: string;
          shortTitle?: string | null;
          description?: string;
          category?: string;
          basePrice?: number;
          imageUrl?: string | null;
          galleryUrls?: string[];
          active?: boolean;
          availability?: LocalProduct["availability"];
          options?: {
            deleteMany?: Record<string, never>;
            create?: ProductOptionCreate[];
          };
        };
        include?: { options?: boolean };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const product = db.products.find((p) => p.id === args.where.id);
          if (!product) throw new Error("Product not found");
          const ts = new Date().toISOString();
          if (args.data.name != null) product.name = args.data.name;
          if (args.data.slug != null) product.slug = args.data.slug;
          if (args.data.shortTitle !== undefined)
            product.shortTitle = args.data.shortTitle;
          if (args.data.description != null)
            product.description = args.data.description;
          if (args.data.category != null) product.category = args.data.category;
          if (args.data.basePrice != null)
            product.basePrice = Number(args.data.basePrice);
          if (args.data.imageUrl !== undefined)
            product.imageUrl = args.data.imageUrl;
          if (args.data.galleryUrls !== undefined)
            product.galleryUrls = args.data.galleryUrls;
          if (args.data.active != null) product.active = args.data.active;
          if (args.data.availability != null)
            product.availability = args.data.availability as LocalProduct["availability"];
          product.updatedAt = ts;

          if (args.data.options?.deleteMany) {
            db.productOptions = db.productOptions.filter(
              (o) => o.productId !== product.id,
            );
          }
          for (const opt of args.data.options?.create ?? []) {
            db.productOptions.push({
              id: cuid(),
              productId: product.id,
              label: opt.label,
              sizeLabel: opt.sizeLabel,
              thicknessMm: Number(opt.thicknessMm),
              laserType: opt.laserType,
              material: opt.material ?? "birch-plywood",
              finish: opt.finish ?? "raw",
              doubleSided: opt.doubleSided ?? false,
              priceModifier: Number(opt.priceModifier),
              createdAt: ts,
              updatedAt: ts,
            });
          }
          return args.include?.options
            ? withOptions(db, product)
            : toDate(withProductDefaults(product));
        });
      },

      async delete(args: { where: { id: string } }) {
        await ensureLocalDb();
        return mutate((db) => {
          const idx = db.products.findIndex((p) => p.id === args.where.id);
          if (idx < 0) throw new Error("Product not found");
          const [product] = db.products.splice(idx, 1);
          db.productOptions = db.productOptions.filter(
            (o) => o.productId !== args.where.id,
          );
          return toDate(withProductDefaults(product));
        });
      },

      async updateMany(args: {
        where: { id?: { in: string[] } };
        data: Record<string, unknown>;
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const ids = new Set(args.where.id?.in ?? []);
          let count = 0;
          for (const product of db.products) {
            if (!ids.has(product.id)) continue;
            Object.assign(product, args.data);
            product.updatedAt = new Date().toISOString();
            count += 1;
          }
          return { count };
        });
      },
    },

    pricingRule: {
      async findFirst(args?: {
        where?: { active?: boolean };
        orderBy?: Record<string, "asc" | "desc">;
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        let rules = db.pricingRules;
        if (args?.where?.active != null) {
          rules = rules.filter((r) => r.active === args.where!.active);
        }
        rules = sortBy(rules, args?.orderBy ?? { createdAt: "asc" });
        return rules[0] ? toDate(withPricingDefaults(rules[0])) : null;
      },

      async findMany(args?: { orderBy?: Record<string, "asc" | "desc"> }) {
        await ensureLocalDb();
        const db = readLocalDb();
        return sortBy(db.pricingRules, args?.orderBy ?? { name: "asc" }).map(
          (r) => toDate(withPricingDefaults(r)),
        );
      },

      async update(args: {
        where: { id: string };
        data: {
          pricePerCm2?: number;
          minPrice?: number;
          thicknessCoefficients?: Record<string, number>;
          complexityMultipliers?: Record<string, number>;
          quantityDiscounts?: { minQty: number; percentOff: number }[];
          rushMultiplier?: number;
          minOrderAmount?: number;
          active?: boolean;
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const rule = db.pricingRules.find((r) => r.id === args.where.id);
          if (!rule) throw new Error("Pricing rule not found");
          if (args.data.pricePerCm2 != null)
            rule.pricePerCm2 = Number(args.data.pricePerCm2);
          if (args.data.minPrice != null)
            rule.minPrice = Number(args.data.minPrice);
          if (args.data.thicknessCoefficients)
            rule.thicknessCoefficients = args.data.thicknessCoefficients;
          if (args.data.complexityMultipliers)
            rule.complexityMultipliers = args.data.complexityMultipliers;
          if (args.data.quantityDiscounts != null)
            rule.quantityDiscounts = args.data.quantityDiscounts;
          if (args.data.rushMultiplier != null)
            rule.rushMultiplier = Number(args.data.rushMultiplier);
          if (args.data.minOrderAmount != null)
            rule.minOrderAmount = Number(args.data.minOrderAmount);
          if (args.data.active != null) rule.active = args.data.active;
          rule.updatedAt = new Date().toISOString();
          return toDate(withPricingDefaults(rule));
        });
      },
    },

    uploadedDesign: {
      async create(args: {
        data: {
          url: string;
          originalName: string;
          mimeType: string;
          sizeBytes: number;
          widthCm?: number | null;
          heightCm?: number | null;
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const design: LocalUploadedDesign = {
            id: cuid(),
            url: args.data.url,
            originalName: args.data.originalName,
            mimeType: args.data.mimeType,
            sizeBytes: args.data.sizeBytes,
            widthCm: args.data.widthCm ?? null,
            heightCm: args.data.heightCm ?? null,
            createdAt: new Date().toISOString(),
          };
          db.uploadedDesigns.push(design);
          return toDate(design);
        });
      },

      async findUnique(args: { where: { id: string } }) {
        await ensureLocalDb();
        const design = readLocalDb().uploadedDesigns.find(
          (d) => d.id === args.where.id,
        );
        return design ? toDate(design) : null;
      },

      async findMany(args?: {
        where?: { id?: { in?: string[] } };
      }) {
        await ensureLocalDb();
        let designs = readLocalDb().uploadedDesigns;
        if (args?.where?.id?.in) {
          const set = new Set(args.where.id.in);
          designs = designs.filter((d) => set.has(d.id));
        }
        return designs.map((d) => toDate(d));
      },
    },

    order: {
      async create(args: {
        data: {
          publicToken?: string;
          status?: LocalOrder["status"];
          designReview?: LocalDesignReview;
          customerId?: string | null;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
          companyName?: string | null;
          vatNumber?: string | null;
          needInvoice?: boolean;
          shippingAddress: string;
          shippingDetails?: Record<string, unknown> | null;
          shippingNote?: string | null;
          courier?: LocalCourier;
          shippingFee?: number;
          rush?: boolean;
          paymentMethod: LocalOrder["paymentMethod"];
          paymentStatus?: LocalPaymentStatus;
          subtotalAmount?: number;
          totalAmount: number;
          econtShipmentNumber?: string | null;
          econtPdfUrl?: string | null;
          adminNotes?: string | null;
          locale?: string;
          items?: {
            create: Array<{
              type: LocalOrderItem["type"];
              productId?: string | null;
              uploadedDesignId?: string | null;
              product?: { connect?: { id: string } };
              uploadedDesign?: { connect?: { id: string } };
              title: string;
              quantity: number;
              unitPrice: number;
              personalization: Record<string, unknown>;
            }>;
          };
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const ts = new Date().toISOString();
          const order: LocalOrder = {
            id: cuid(),
            publicToken: args.data.publicToken ?? cuid(),
            status: args.data.status ?? "NEW",
            designReview: args.data.designReview ?? "NOT_REQUIRED",
            customerId: args.data.customerId ?? null,
            customerName: args.data.customerName,
            customerEmail: args.data.customerEmail,
            customerPhone: args.data.customerPhone,
            companyName: args.data.companyName ?? null,
            vatNumber: args.data.vatNumber ?? null,
            needInvoice: args.data.needInvoice ?? false,
            shippingAddress: args.data.shippingAddress,
            shippingDetails: args.data.shippingDetails ?? null,
            shippingNote: args.data.shippingNote ?? null,
            courier: args.data.courier ?? "ECONT",
            shippingFee: Number(args.data.shippingFee ?? 0),
            rush: args.data.rush ?? false,
            paymentMethod: args.data.paymentMethod,
            paymentStatus: args.data.paymentStatus ?? "PENDING",
            subtotalAmount: Number(
              args.data.subtotalAmount ?? args.data.totalAmount,
            ),
            totalAmount: Number(args.data.totalAmount),
            econtShipmentNumber: args.data.econtShipmentNumber ?? null,
            econtPdfUrl: args.data.econtPdfUrl ?? null,
            adminNotes: args.data.adminNotes ?? null,
            locale: args.data.locale ?? "bg",
            createdAt: ts,
            updatedAt: ts,
          };
          db.orders.push(order);
          for (const item of args.data.items?.create ?? []) {
            db.orderItems.push({
              id: cuid(),
              orderId: order.id,
              type: item.type,
              productId:
                item.productId ?? item.product?.connect?.id ?? null,
              uploadedDesignId:
                item.uploadedDesignId ??
                item.uploadedDesign?.connect?.id ??
                null,
              title: item.title,
              quantity: item.quantity,
              unitPrice: Number(item.unitPrice),
              personalization: item.personalization,
              createdAt: ts,
            });
          }
          return toDate(order);
        });
      },

      async findUnique(args: {
        where: { id?: string; publicToken?: string };
        include?: {
          items?:
            | boolean
            | { include?: { uploadedDesign?: boolean; product?: boolean } };
        };
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        const order = db.orders.find(
          (o) =>
            (args.where.id && o.id === args.where.id) ||
            (args.where.publicToken &&
              o.publicToken === args.where.publicToken),
        );
        if (!order) return null;
        if (args.include?.items) return withOrderRelations(db, order);
        return toDate(order);
      },

      async findMany(args?: {
        where?: {
          status?: LocalOrder["status"];
          designReview?: LocalDesignReview;
        };
        orderBy?: Record<string, "asc" | "desc">;
        include?: {
          items?:
            | boolean
            | { include?: { uploadedDesign?: boolean; product?: boolean } };
        };
        take?: number;
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        let orders = db.orders;
        if (args?.where?.status) {
          orders = orders.filter((o) => o.status === args.where!.status);
        }
        if (args?.where?.designReview) {
          orders = orders.filter(
            (o) => o.designReview === args.where!.designReview,
          );
        }
        orders = sortBy(orders, args?.orderBy ?? { createdAt: "desc" });
        if (args?.take != null) orders = orders.slice(0, args.take);
        if (args?.include?.items) {
          return orders.map((o) => withOrderRelations(db, o));
        }
        return orders.map((o) => toDate(o));
      },

      async update(args: {
        where: { id: string };
        data: Record<string, unknown>;
        include?: {
          items?:
            | boolean
            | { include?: { uploadedDesign?: boolean; product?: boolean } };
          events?: boolean | { orderBy?: unknown; take?: number };
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const order = db.orders.find((o) => o.id === args.where.id);
          if (!order) throw new Error("Order not found");
          Object.assign(order, args.data);
          order.updatedAt = new Date().toISOString();
          if (args.include?.items) return withOrderRelations(db, order);
          return toDate(order);
        });
      },

      async count(args?: {
        where?: {
          status?: LocalOrder["status"];
          designReview?: LocalDesignReview;
        };
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        let orders = db.orders;
        if (args?.where?.status) {
          orders = orders.filter((o) => o.status === args.where!.status);
        }
        if (args?.where?.designReview) {
          orders = orders.filter(
            (o) => o.designReview === args.where!.designReview,
          );
        }
        return orders.length;
      },
    },

    review: {
      async findMany(args?: {
        where?: { published?: boolean; productId?: string | null };
        include?: { product?: boolean | { select?: { name?: boolean; slug?: boolean } } };
        orderBy?: Record<string, "asc" | "desc">;
        take?: number;
      }) {
        await ensureLocalDb();
        const db = readLocalDb();
        let reviews = db.reviews ?? [];
        if (args?.where?.published != null) {
          reviews = reviews.filter((r) => r.published === args.where!.published);
        }
        if (args?.where && "productId" in args.where) {
          reviews = reviews.filter(
            (r) => r.productId === args.where!.productId,
          );
        }
        reviews = sortBy(reviews, args?.orderBy ?? { createdAt: "desc" });
        if (args?.take != null) reviews = reviews.slice(0, args.take);
        return reviews.map((r) => {
          const row = toDate(r) as LocalReview & {
            product?: { name: string; slug: string } | null;
          };
          if (args?.include?.product) {
            const product = r.productId
              ? db.products.find((p) => p.id === r.productId)
              : null;
            row.product = product
              ? { name: product.name, slug: product.slug }
              : null;
          }
          return row;
        });
      },

      async create(args: {
        data: {
          productId?: string | null;
          authorName: string;
          rating: number;
          body: string;
          published?: boolean;
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          if (!db.reviews) db.reviews = [];
          const review: LocalReview = {
            id: cuid(),
            productId: args.data.productId ?? null,
            authorName: args.data.authorName,
            rating: Number(args.data.rating),
            body: args.data.body,
            published: args.data.published ?? false,
            createdAt: new Date().toISOString(),
          };
          db.reviews.push(review);
          return toDate(review);
        });
      },
    },

    orderEvent: {
      async create(args: {
        data: {
          orderId: string;
          type: string;
          message: string;
          actorEmail?: string | null;
          payload?: unknown;
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          if (!db.orderEvents) db.orderEvents = [];
          const event = {
            id: cuid(),
            orderId: args.data.orderId,
            type: args.data.type,
            message: args.data.message,
            actorEmail: args.data.actorEmail ?? null,
            payload: args.data.payload,
            createdAt: new Date().toISOString(),
          };
          db.orderEvents.push(event);
          return toDate(event);
        });
      },
      async findMany(args: {
        where?: { orderId?: string };
        orderBy?: Record<string, "asc" | "desc">;
        take?: number;
      }) {
        await ensureLocalDb();
        let rows = readLocalDb().orderEvents ?? [];
        if (args.where?.orderId) {
          rows = rows.filter((row) => row.orderId === args.where?.orderId);
        }
        rows = sortBy(rows, args.orderBy ?? { createdAt: "desc" });
        if (args.take != null) rows = rows.slice(0, args.take);
        return rows.map((row) => toDate(row));
      },
    },

    customerProfile: {
      async findUnique(args: { where: { email: string } }) {
        await ensureLocalDb();
        const row = readLocalDb().customerProfiles.find(
          (item) => item.email === args.where.email,
        );
        return row ? toDate(row) : null;
      },
      async findMany(args?: {
        where?: { OR?: unknown; flag?: string };
        orderBy?: Record<string, "asc" | "desc">;
        take?: number;
      }) {
        await ensureLocalDb();
        let rows = readLocalDb().customerProfiles ?? [];
        rows = sortBy(rows, args?.orderBy ?? { updatedAt: "desc" });
        if (args?.take != null) rows = rows.slice(0, args.take);
        return rows.map((row) => toDate(row));
      },
      async upsert(args: {
        where: { email: string };
        update: Record<string, unknown>;
        create: {
          email: string;
          phone?: string | null;
          name?: string | null;
          flag?: string;
          note?: string | null;
        };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          if (!db.customerProfiles) db.customerProfiles = [];
          const idx = db.customerProfiles.findIndex(
            (row) => row.email === args.where.email,
          );
          const now = new Date().toISOString();
          if (idx >= 0) {
            db.customerProfiles[idx] = {
              ...db.customerProfiles[idx],
              ...args.update,
              updatedAt: now,
            } as (typeof db.customerProfiles)[number];
            return toDate(db.customerProfiles[idx]);
          }
          const row = {
            id: cuid(),
            email: args.create.email,
            phone: args.create.phone ?? null,
            name: args.create.name ?? null,
            flag: args.create.flag ?? "NONE",
            note: args.create.note ?? null,
            createdAt: now,
            updatedAt: now,
          };
          db.customerProfiles.push(row);
          return toDate(row);
        });
      },
    },

    messageTemplate: {
      async findMany() {
        await ensureLocalDb();
        return (readLocalDb().messageTemplates ?? []).map((row) => toDate(row));
      },
      async findUnique(args: { where: { key: string } }) {
        await ensureLocalDb();
        const row = (readLocalDb().messageTemplates ?? []).find(
          (item) => item.key === args.where.key,
        );
        return row ? toDate(row) : null;
      },
      async create(args: {
        data: { key: string; subject: string; body: string };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          if (!db.messageTemplates) db.messageTemplates = [];
          const row = {
            id: cuid(),
            key: args.data.key,
            subject: args.data.subject,
            body: args.data.body,
            updatedAt: new Date().toISOString(),
          };
          db.messageTemplates.push(row);
          return toDate(row);
        });
      },
      async upsert(args: {
        where: { key: string };
        update: { subject: string; body: string };
        create: { key: string; subject: string; body: string };
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          if (!db.messageTemplates) db.messageTemplates = [];
          const idx = db.messageTemplates.findIndex(
            (row) => row.key === args.where.key,
          );
          const now = new Date().toISOString();
          if (idx >= 0) {
            db.messageTemplates[idx] = {
              ...db.messageTemplates[idx],
              ...args.update,
              updatedAt: now,
            };
            return toDate(db.messageTemplates[idx]);
          }
          const row = {
            id: cuid(),
            ...args.create,
            updatedAt: now,
          };
          db.messageTemplates.push(row);
          return toDate(row);
        });
      },
    },

    orderItem: {
      async findFirst(args: { where: { id: string; orderId: string } }) {
        await ensureLocalDb();
        const item = readLocalDb().orderItems.find(
          (row) =>
            row.id === args.where.id && row.orderId === args.where.orderId,
        );
        return item ? toDate(item) : null;
      },
      async update(args: {
        where: { id: string };
        data: Record<string, unknown>;
      }) {
        await ensureLocalDb();
        return mutate((db) => {
          const item = db.orderItems.find((row) => row.id === args.where.id);
          if (!item) throw new Error("Order item not found");
          Object.assign(item, args.data);
          return toDate(item);
        });
      },
    },
  };
}

export type LocalPrisma = ReturnType<typeof createLocalPrisma>;
