import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCustomerProfileForm } from "@/components/AdminCustomerProfileForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/pricing";
import { customerFlagLabel, shortOrderId } from "@/lib/labels";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminCustomersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const q = (await searchParams).q?.trim() ?? "";

  const [profiles, orders] = q.length >= 2
    ? await Promise.all([
        prisma.customerProfile.findMany({
          where: {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 20,
        }),
        prisma.order.findMany({
          where: {
            OR: [
              { customerEmail: { contains: q, mode: "insensitive" } },
              { customerPhone: { contains: q } },
              { customerName: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 40,
        }),
      ])
    : await Promise.all([
        prisma.customerProfile.findMany({
          orderBy: { updatedAt: "desc" },
          take: 30,
        }),
        Promise.resolve([]),
      ]);

  const flagged = profiles.filter((row) => row.flag !== "NONE");

  return (
    <div className="admin-panel">
      <h1>Клиенти</h1>
      <form className="admin-search" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Име, имейл или телефон"
        />
        <button type="submit" className="btn btn-ghost">
          Търси
        </button>
      </form>

      <div className="admin-grid admin-two">
        <div>
          <h2>Поръчки</h2>
          {orders.length === 0 ? (
            <p className="muted">
              {q.length >= 2 ? "Няма съвпадения." : "Въведете търсене."}
            </p>
          ) : (
            <ul className="admin-order-feed">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`}>
                    <span>#{shortOrderId(order.id)}</span>
                    <span>{order.customerName}</span>
                    <span>{formatMoney(Number(order.totalAmount))}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2>Флагове</h2>
          {flagged.length === 0 ? (
            <p className="muted">Няма маркирани клиенти.</p>
          ) : (
            <ul>
              {flagged.map((row) => (
                <li key={row.id}>
                  {row.email} · {customerFlagLabel[row.flag]}
                  {row.note ? ` — ${row.note}` : ""}
                </li>
              ))}
            </ul>
          )}
          <AdminCustomerProfileForm
            initial={{
              email:
                profiles[0]?.email ?? orders[0]?.customerEmail ?? q,
              phone:
                profiles[0]?.phone ?? orders[0]?.customerPhone ?? "",
              name: profiles[0]?.name ?? orders[0]?.customerName ?? "",
              flag: profiles[0]?.flag ?? "NONE",
              note: profiles[0]?.note ?? "",
            }}
          />
        </div>
      </div>
    </div>
  );
}
