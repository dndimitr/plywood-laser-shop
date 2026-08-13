import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [orderCount, productCount, newOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div className="admin-panel">
      <h1>Табло</h1>
      <p className="muted">Здравей, {session.user.email}</p>
      <div className="admin-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="admin-card">
          <h3>Поръчки</h3>
          <p>{orderCount} общо · {newOrders} нови</p>
          <Link href="/admin/orders">Отвори</Link>
        </div>
        <div className="admin-card">
          <h3>Продукти</h3>
          <p>{productCount}</p>
          <Link href="/admin/products">Отвори</Link>
        </div>
        <div className="admin-card">
          <h3>Ценови правила</h3>
          <p>Калкулатор за къстъм</p>
          <Link href="/admin/pricing">Отвори</Link>
        </div>
      </div>
    </div>
  );
}
