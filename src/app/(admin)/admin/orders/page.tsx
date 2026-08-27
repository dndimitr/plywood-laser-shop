import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";
import {
  courierLabel,
  designReviewLabel,
  orderStatusLabel,
  orderStatusTone,
  paymentMethodLabel,
  shortOrderId,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string; review?: string; q?: string }>;
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
  const q = sp.q?.trim() || undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(review ? { designReview: review as never } : {}),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q, mode: "insensitive" } },
              { customerEmail: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q, mode: "insensitive" } },
              { id: { contains: q, mode: "insensitive" } },
              { shippingAddress: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { uploadedDesign: true } },
    },
  });

  function href(next: { status?: string; review?: string; q?: string }) {
    const params = new URLSearchParams();
    const s = next.status ?? status ?? "";
    const r = next.review ?? review ?? "";
    const query = next.q ?? q ?? "";
    if (s) params.set("status", s);
    if (r) params.set("review", r);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }

  return (
    <div className="admin-panel">
      <div className="admin-page-head">
        <h1>Поръчки</h1>
        <form className="admin-search" action="/admin/orders" method="get">
          {status ? <input type="hidden" name="status" value={status} /> : null}
          {review ? <input type="hidden" name="review" value={review} /> : null}
          <label className="sr-only" htmlFor="admin-order-q">
            Търсене
          </label>
          <input
            id="admin-order-q"
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Име, имейл, телефон или номер"
          />
          <button type="submit" className="btn btn-ghost">
            Търси
          </button>
        </form>
      </div>

      <div className="admin-filters" aria-label="Филтър по статус">
        {statusFilters.map((f) => (
          <Link
            key={f.id || "all"}
            href={href({ status: f.id, review, q })}
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
            href={href({ status, review: f.id, q })}
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
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Клиент</th>
                <th>Куриер</th>
                <th>Сума</th>
                <th>Статус</th>
                <th>Макет</th>
                <th>Плащане</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>
                      #{shortOrderId(order.id)}
                    </Link>
                    {order.rush ? (
                      <div className="badge-rush">Ускорена</div>
                    ) : null}
                  </td>
                  <td>
                    {order.createdAt.toLocaleString("bg-BG", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>
                    {order.customerName}
                    <div className="muted">{order.customerPhone}</div>
                  </td>
                  <td>{courierLabel[order.courier] ?? order.courier}</td>
                  <td>{formatMoney(Number(order.totalAmount))}</td>
                  <td>
                    <span
                      className={`admin-pill admin-pill-${orderStatusTone(order.status)}`}
                    >
                      {orderStatusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td>
                    {designReviewLabel[order.designReview] ??
                      order.designReview}
                  </td>
                  <td>
                    {paymentMethodLabel[order.paymentMethod] ??
                      order.paymentMethod}
                  </td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>Отвори</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
