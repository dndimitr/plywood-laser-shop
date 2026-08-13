import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="admin-panel">
      <h1>Поръчки</h1>
      {orders.length === 0 ? (
        <p className="muted">Няма поръчки все още.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Плащане</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.createdAt.toLocaleString("bg-BG")}</td>
                <td>
                  {order.customerName}
                  <div className="muted">{order.customerEmail}</div>
                </td>
                <td>{formatBgn(Number(order.totalAmount))}</td>
                <td>{orderStatusLabel[order.status] ?? order.status}</td>
                <td>
                  {paymentMethodLabel[order.paymentMethod] ??
                    order.paymentMethod}
                </td>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>Детайли</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
