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

type Props = { searchParams: Promise<{ cat?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { cat: catRaw } = await searchParams;
  const catFilter =
    catRaw && CATEGORIES.some((c) => c.id === catRaw) ? catRaw : null;

  const products = await prisma.product.findMany({
    where: catFilter ? { category: catFilter } : undefined,
    include: { options: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const personalizedTotal = await prisma.product.count({
    where: { category: "personalized" },
  });

  return (
    <div className="admin-panel">
      <div className="header-inner" style={{ paddingTop: 0 }}>
        <h1>Продукти</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          Нов продукт
        </Link>
      </div>

      <p className="muted">
        {products.length} показани
        {catFilter
          ? ` · филтър: ${categoryLabel[catFilter] ?? catFilter}`
          : ` · ${personalizedTotal} в „Персонализирани“`}
        {" · "}
        Категорията се избира от същия списък като в магазина (вкл.
        Персонализирани).
      </p>

      <div className="admin-filters">
        <Link
          href="/admin/products"
          className={!catFilter ? "admin-filter-chip is-active" : "admin-filter-chip"}
        >
          Всички
        </Link>
        {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
          <Link
            key={c.id}
            href={`/admin/products?cat=${c.id}`}
            className={
              catFilter === c.id
                ? "admin-filter-chip is-active"
                : "admin-filter-chip"
            }
          >
            {c.label}
          </Link>
        ))}
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
              product.name,
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
                    FB линк
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
