import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { createLocalPrisma } from "@/lib/local-prisma";
import { isLocalDbMode } from "@/lib/local-store";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | ReturnType<typeof createLocalPrisma> | undefined;
  localDbMode?: boolean;
};

function createPrismaClient() {
  if (isLocalDbMode()) {
    console.info("[db] Using local JSON fallback (data/local-db.json)");
    return createLocalPrisma();
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL липсва. Добави Neon connection string в .env",
    );
  }

  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrisma() {
  const local = isLocalDbMode();
  if (!globalForPrisma.prisma || globalForPrisma.localDbMode !== local) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.localDbMode = local;
  }
  return globalForPrisma.prisma;
}

/** Lazy proxy so importing this module does not require DATABASE_URL at build time */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});

export { isLocalDbMode };
