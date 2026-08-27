import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBatchEcont } from "@/components/AdminBatchEcont";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";
import { shortOrderId } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminTodayPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [fresh, design, cutting, packing] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["NEW", "AWAITING_DESIGN"] } },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    prisma.order.findMany({
      where: { designReview: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    prisma.order.findMany({
      where: { machineStatus: { in: ["QUEUE", "CUTTING"] } },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
    prisma.order.findMany({
      where: {
        machineStatus: "PACKING_READY",
        courier: "ECONT",
        econtShipmentNumber: null,
      },
      orderBy: { createdAt: "asc" },
      take: 40,
    }),
  ]);

  return (
    <div className="admin-panel">
      <div className="admin-page-head">
        <h1>Днес</h1>
        <AdminBatchEcont ids={packing.map((order) => order.id)} />
      </div>
      <div className="admin-queue-grid">
        <QueueColumn title="Нови / чакат макет" orders={fresh} />
        <QueueColumn title="Макет за преглед" orders={design} />
        <QueueColumn title="Рязане" orders={cutting} />
        <QueueColumn title="Готови за Еконт" orders={packing} />
      </div>
    </div>
  );
}

function QueueColumn({
  title,
  orders,
}: {
  title: string;
  orders: Array<{
    id: string;
    customerName: string;
    rush: boolean;
    totalAmount: { toString(): string } | number;
  }>;
}) {
  return (
    <section className="admin-card">
      <h3>
        {title} <span className="muted">{orders.length}</span>
      </h3>
      {orders.length === 0 ? (
        <p className="muted">Празно</p>
      ) : (
        <ul className="admin-order-feed">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/orders/${order.id}`}>
                <span className="admin-order-feed-id">
                  #{shortOrderId(order.id)}
                </span>
                <span className="admin-order-feed-name">
                  {order.customerName}
                  {order.rush ? " · ускорена" : ""}
                </span>
                <span className="admin-order-feed-sum">
                  {formatMoney(Number(order.totalAmount))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
