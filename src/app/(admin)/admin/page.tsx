import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMarketingSettings,
  getShippingFees,
  hasActiveMarketingScripts,
} from "@/lib/shop-settings";
import { formatMoney } from "@/lib/pricing";
import {
  orderStatusLabel,
  orderStatusTone,
  shortOrderId,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [
    orderCount,
    productCount,
    newOrders,
    pendingDesigns,
    inProduction,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { designReview: "PENDING" } }),
    prisma.order.count({ where: { status: "IN_PRODUCTION" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: true },
    }),
  ]);

  const fees = getShippingFees();
  const marketing = getMarketingSettings();
  const marketingOn = hasActiveMarketingScripts(marketing);
  const marketingBits = [
    marketing.gaMeasurementId && "GA4",
    marketing.googleAdsId && "Ads",
    marketing.gtmId && "GTM",
    marketing.metaPixelId && "Meta Pixel",
    marketing.metaPixelId && marketing.metaCapiAccessToken && "Meta CAPI",
  ].filter(Boolean);

  return (
    <div className="admin-panel">
      <div className="admin-page-head">
        <div>
          <h1>Табло</h1>
          <p className="muted" style={{ margin: 0 }}>
            {session.user.email}
          </p>
        </div>
        <Link href="/admin/orders?status=NEW" className="btn btn-primary">
          Нови поръчки
        </Link>
      </div>

      <div className="admin-stat-grid">
        <Link href="/admin/orders?status=NEW" className="admin-card admin-stat">
          <h3>Нови</h3>
          <p className="admin-stat-value">{newOrders}</p>
          <span>Чакат обработка</span>
        </Link>
        <Link
          href="/admin/orders?review=PENDING"
          className="admin-card admin-stat"
        >
          <h3>Макети</h3>
          <p className="admin-stat-value">{pendingDesigns}</p>
          <span>За преглед</span>
        </Link>
        <Link
          href="/admin/orders?status=IN_PRODUCTION"
          className="admin-card admin-stat"
        >
          <h3>Производство</h3>
          <p className="admin-stat-value">{inProduction}</p>
          <span>В работа</span>
        </Link>
        <Link href="/admin/orders" className="admin-card admin-stat">
          <h3>Всички поръчки</h3>
          <p className="admin-stat-value">{orderCount}</p>
          <span>Отвори списъка</span>
        </Link>
      </div>

      <div className="admin-grid admin-dash-grid">
        <div className="admin-card">
          <div className="admin-card-head">
            <h3>Последни поръчки</h3>
            <Link href="/admin/orders">Всички</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="muted">Все още няма поръчки.</p>
          ) : (
            <ul className="admin-order-feed">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`}>
                    <span className="admin-order-feed-id">
                      #{shortOrderId(order.id)}
                    </span>
                    <span className="admin-order-feed-name">
                      {order.customerName}
                    </span>
                    <span
                      className={`admin-pill admin-pill-${orderStatusTone(order.status)}`}
                    >
                      {orderStatusLabel[order.status] ?? order.status}
                    </span>
                    <span className="admin-order-feed-sum">
                      {formatMoney(Number(order.totalAmount))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Каталог</h3>
            <p>{productCount} продукта</p>
            <Link href="/admin/products">Редакция на продукти</Link>
          </div>
          <div className="admin-card">
            <h3>Доставка</h3>
            <p>
              Еконт {formatMoney(fees.ECONT)} · Speedy {formatMoney(fees.SPEEDY)}
            </p>
            <Link href="/admin/shipping">Коригирай таксите</Link>
          </div>
          <div className="admin-card">
            <h3>Маркетинг</h3>
            <p>
              {marketingOn ? marketingBits.join(" · ") : "Няма активни тагове"}
            </p>
            <Link href="/admin/marketing">Настройки</Link>
          </div>
          <div className="admin-card">
            <h3>Ценови правила</h3>
            <p>Калкулатор за къстъм поръчки</p>
            <Link href="/admin/pricing">Отвори</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
