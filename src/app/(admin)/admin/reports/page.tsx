import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ from?: string; to?: string }> };

export default async function AdminReportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const sp = await searchParams;
  const to = sp.to ? new Date(sp.to) : new Date();
  const from = sp.from
    ? new Date(sp.from)
    : new Date(to.getTime() - 13 * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      status: { not: "CANCELLED" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const turnover = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const unpaid = orders.filter(
    (order) =>
      order.paymentStatus === "PENDING" ||
      order.paymentStatus === "AWAITING_TRANSFER",
  );
  const unpaidSum = unpaid.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const cod = orders.filter((order) => order.paymentMethod === "CASH_ON_DELIVERY");
  const codSum = cod.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const byDay = new Map<string, number>();
  for (const order of orders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + Number(order.totalAmount));
  }

  const sold = new Map<string, { title: string; qty: number; sum: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productId ?? item.title;
      const current = sold.get(key) ?? { title: item.title, qty: 0, sum: 0 };
      current.qty += item.quantity;
      current.sum += Number(item.unitPrice) * item.quantity;
      sold.set(key, current);
    }
  }
  const top = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  const fromValue = from.toISOString().slice(0, 10);
  const toValue = to.toISOString().slice(0, 10);

  return (
    <div className="admin-panel">
      <h1>Справки</h1>
      <form className="admin-search" method="get">
        <label className="field">
          <span>От</span>
          <input type="date" name="from" defaultValue={fromValue} />
        </label>
        <label className="field">
          <span>До</span>
          <input type="date" name="to" defaultValue={toValue} />
        </label>
        <button type="submit" className="btn btn-ghost">
          Покажи
        </button>
      </form>

      <div className="admin-stat-grid">
        <div className="admin-card admin-stat">
          <h3>Оборот</h3>
          <p className="admin-stat-value">{formatMoney(turnover)}</p>
          <span>{orders.length} поръчки</span>
        </div>
        <div className="admin-card admin-stat">
          <h3>Неплатени</h3>
          <p className="admin-stat-value">{formatMoney(unpaidSum)}</p>
          <span>{unpaid.length} броя</span>
        </div>
        <div className="admin-card admin-stat">
          <h3>Наложен платеж</h3>
          <p className="admin-stat-value">{formatMoney(codSum)}</p>
          <span>{cod.length} за предаване</span>
        </div>
      </div>

      <div className="admin-grid admin-two">
        <div className="admin-card">
          <h3>По дни</h3>
          <ul>
            {[...byDay.entries()].map(([day, sum]) => (
              <li key={day}>
                {day}: {formatMoney(sum)}
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card">
          <h3>Най-продавани</h3>
          {top.length === 0 ? (
            <p className="muted">Няма данни за периода.</p>
          ) : (
            <ol>
              {top.map((row) => (
                <li key={row.title}>
                  {row.title} · {row.qty} бр. · {formatMoney(row.sum)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
