import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBgn } from "@/lib/pricing";
import {
  designReviewLabel,
  orderStatusLabel,
  paymentMethodLabel,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; review?: string }>;
};

const statusFilters = [
  { id: "", label: "Всички" },
  { id: "NEW", label: "Нови" },
  { id: "AWAITING_DESIGN", label: "Чакат макет" },
  { id: "IN_PRODUCTION", label: "В производство" },
  { id: "SHIPPED", label: "Изпратени" },
  { id: "DONE", label: "Завършени" },
  { id: "CANCELLED", label: "Отказани" },
];

const reviewFilters = [
  { id: "", label: "Всички макети" },
  { id: "PENDING", label: "За преглед" },
  { id: "APPROVED", label: "Одобрени" },
  { id: "REJECTED", label: "Отказани" },
];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const sp = await searchParams;
  const status = sp.status?.trim() || undefined;
  const review = sp.review?.trim() || undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(review ? { designReview: review as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { uploadedDesign: true } },
    },
  });

  function href(next: { status?: string; review?: string }) {
    const params = new URLSearchParams();
    const s = next.status ?? status ?? "";
    const r = next.review ?? review ?? "";
    if (s) params.set("status", s);
    if (r) params.set("review", r);
    const q = params.toString();
    return q ? `/admin/orders?${q}` : "/admin/orders";
  }

  return (
    <div className="admin-panel">
      <h1>Поръчки</h1>

      <div className="admin-filters" aria-label="Филтър по статус">
        {statusFilters.map((f) => (
          <Link
            key={f.id || "all"}
            href={href({ status: f.id, review })}
            className={
              (status ?? "") === f.id
                ? "admin-filter-chip is-active"
                : "admin-filter-chip"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>
      <div className="admin-filters" aria-label="Филтър по макет">
        {reviewFilters.map((f) => (
          <Link
            key={f.id || "all-review"}
            href={href({ status, review: f.id })}
            className={
              (review ?? "") === f.id
                ? "admin-filter-chip is-active"
                : "admin-filter-chip"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="muted">Няма поръчки за този филтър.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Сума</th>
              <th>Статус</th>
              <th>Макет</th>
              <th>Плащане</th>
              <th>Файлове</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const files = order.items.filter((i) => i.uploadedDesign).length;
              return (
                <tr key={order.id}>
                  <td>
                    {order.createdAt.toLocaleString("bg-BG")}
                    {order.rush ? (
                      <div className="badge-rush">Ускорена</div>
                    ) : null}
                  </td>
                  <td>
                    {order.customerName}
                    <div className="muted">{order.customerEmail}</div>
                  </td>
                  <td>{formatBgn(Number(order.totalAmount))}</td>
                  <td>{orderStatusLabel[order.status] ?? order.status}</td>
                  <td>
                    {designReviewLabel[order.designReview] ??
                      order.designReview}
                  </td>
                  <td>
                    {paymentMethodLabel[order.paymentMethod] ??
                      order.paymentMethod}
                  </td>
                  <td>{files > 0 ? `${files} файл(а)` : "—"}</td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>Детайли</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
