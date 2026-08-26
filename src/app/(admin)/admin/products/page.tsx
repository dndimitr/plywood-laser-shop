import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import { absoluteUrl, facebookShareUrl } from "@/lib/seo";
import { CATEGORIES } from "@/lib/shop-config";

export const dynamic = "force-dynamic";

const categoryLabel = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
);

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const products = await prisma.product.findMany({
    include: { options: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="admin-panel">
      <div className="header-inner" style={{ paddingTop: 0 }}>
        <h1>Продукти</h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <a
            className="btn btn-ghost"
            href="/feeds/facebook-catalog.csv?download=1"
          >
            Facebook каталог CSV
          </a>
          <Link href="/admin/products/new" className="btn btn-primary">
            Нов продукт
          </Link>
        </div>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Име</th>
            <th>Категория</th>
            <th>Цена</th>
            <th>Опции</th>
            <th>Статус</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const share = facebookShareUrl(
              absoluteUrl(`/products/${product.slug}`),
            );
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>
                  {categoryLabel[product.category] ?? product.category ?? "—"}
                </td>
                <td>{formatBgn(Number(product.basePrice))}</td>
                <td>{product.options.length}</td>
                <td>{product.active ? "Активен" : "Скрит"}</td>
                <td>
                  <Link href={`/admin/products/${product.id}`}>Редакция</Link>
                </td>
                <td>
                  <a href={share} target="_blank" rel="noopener noreferrer">
                    FB пост
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
