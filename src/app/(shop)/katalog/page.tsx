import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Готови модели за лазерно изрязване и гравиране — поводи, дом, бизнес и аксесоари.",
};

export default async function KatalogPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="section" style={{ paddingTop: "1.5rem" }}>
      <div className="container">
        <h1 className="page-title">Каталог</h1>
        <p className="section-lead">
          Готови модели по поводи, дом, бизнес и аксесоари.
        </p>
        <Suspense fallback={<p className="muted">Зареждане…</p>}>
          <CatalogBrowser
            basePath="/katalog"
            products={products.map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              description: p.description,
              category: p.category ?? "other",
              basePrice: Number(p.basePrice),
              imageUrl: p.imageUrl,
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
