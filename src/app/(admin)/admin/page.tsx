import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getMarketingSettings,
  getShippingFees,
  hasActiveMarketingScripts,
} from "@/lib/shop-settings";
import { formatBgn } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [orderCount, productCount, newOrders, pendingDesigns] =
    await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count({ where: { designReview: "PENDING" } }),
    ]);

  const fees = getShippingFees();
  const marketing = getMarketingSettings();
  const marketingOn = hasActiveMarketingScripts(marketing);
  const marketingBits = [
    marketing.gaMeasurementId && "GA4",
    marketing.googleAdsId && "Ads",
    marketing.gtmId && "GTM",
    marketing.metaPixelId && "Meta Pixel",
    marketing.metaPixelId &&
      marketing.metaCapiAccessToken &&
      "Meta CAPI",
  ].filter(Boolean);

  return (
    <div className="admin-panel">
      <h1>Табло</h1>
      <p className="muted">Здравей, {session.user.email}</p>
      <div
        className="admin-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}
      >
        <div className="admin-card">
          <h3>Поръчки</h3>
          <p>
            {orderCount} общо · {newOrders} нови
            {pendingDesigns > 0
              ? ` · ${pendingDesigns} макета за преглед`
              : ""}
          </p>
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
        <div className="admin-card">
          <h3>Доставка</h3>
          <p>
            Еконт {formatBgn(fees.ECONT)} · Speedy {formatBgn(fees.SPEEDY)}
          </p>
          <Link href="/admin/shipping">Коригирай</Link>
        </div>
        <div className="admin-card">
          <h3>Маркетинг</h3>
          <p>
            {marketingOn ? marketingBits.join(" · ") : "Няма активни тагове"}
          </p>
          <Link href="/admin/marketing">Настройки</Link>
        </div>
      </div>
    </div>
  );
}
