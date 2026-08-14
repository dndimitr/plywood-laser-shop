import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  isLocalDbMode,
  readLocalDb,
  seedLocalDb,
} from "../src/lib/local-store";
import { CATALOG_PRODUCTS } from "../src/data/catalog-products";

async function seedNeon() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for seeding Neon");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@plywood.local";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: {
        email: adminEmail,
        passwordHash,
        name: "Администратор",
      },
    });

    await prisma.pricingRule.upsert({
      where: { name: "default-custom" },
      update: {
        pricePerCm2: 0.12,
        thicknessCoefficients: { "3": 1, "4": 1.15, "6": 1.35, default: 1.2 },
        complexityMultipliers: { simple: 1, medium: 1.25, complex: 1.6 },
        minPrice: 18,
        active: true,
      },
      create: {
        name: "default-custom",
        pricePerCm2: 0.12,
        thicknessCoefficients: { "3": 1, "4": 1.15, "6": 1.35, default: 1.2 },
        complexityMultipliers: { simple: 1, medium: 1.25, complex: 1.6 },
        minPrice: 18,
        active: true,
      },
    });

    for (const product of CATALOG_PRODUCTS) {
      const { options, ...data } = product;
      await prisma.product.upsert({
        where: { slug: data.slug },
        update: {
          name: data.name,
          description: data.description,
          category: data.category,
          basePrice: data.basePrice,
          imageUrl: data.imageUrl,
          galleryUrls: data.galleryUrls,
          cutFileUrl: data.cutFileUrl ?? null,
          active: true,
          options: {
            deleteMany: {},
            create: options,
          },
        },
        create: {
          ...data,
          options: { create: options },
        },
      });
    }

    console.log(`Seed complete (Neon) — ${CATALOG_PRODUCTS.length} products.`);
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  if (isLocalDbMode()) {
    await seedLocalDb(readLocalDb());
    console.log(
      `Seed complete (local JSON → data/local-db.json) — ${CATALOG_PRODUCTS.length} products.`,
    );
    console.log(
      `Admin: ${process.env.ADMIN_EMAIL ?? "admin@plywood.local"} / ${process.env.ADMIN_PASSWORD ?? "admin123"}`,
    );
    return;
  }
  await seedNeon();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
