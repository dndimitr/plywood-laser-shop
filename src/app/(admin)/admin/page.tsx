import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  ADMIN_CATALOG_PRICE_NOTES,
  latestAdminChangelog,
} from "@/lib/admin-changelog";
import { prisma } from "@/lib/db";
import {
  getMarketingSettings,
  getShippingFees,
  hasActiveMarketingScripts,
} from "@/lib/shop-settings";
import { formatBgn } from "@/lib/pricing";
import { CATEGORIES } from "@/lib/shop-config";

export const dynamic = "force-dynamic";

function formatBgDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function AdminHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [
    orderCount,
    productCount,
    newOrders,
    pendingDesigns,
    personalizedCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { designReview: "PENDING" } }),
    prisma.product.count({ where: { category: "personalized" } }),
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
    marketing.facebookShareEnabled && "FB споделяне",
  ].filter(Boolean);

  const changelog = latestAdminChangelog(5);
  const categoryCount = CATEGORIES.length;
  const { discountPercent, lowPriceBumpPercent, lowPriceMaxEur } =
    ADMIN_CATALOG_PRICE_NOTES;

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
          <p>
            {productCount} общо · {personalizedCount} персонализирани ·{" "}
            {categoryCount} категории
          </p>
          <Link href="/admin/products">Отвори</Link>
        </div>
        <div className="admin-card">
          <h3>Ценови правила</h3>
          <p>
            Къстъм калкулатор · каталог −{discountPercent}% · +
            {lowPriceBumpPercent}% до {lowPriceMaxEur} €
          </p>
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
            {marketingOn || marketing.facebookShareEnabled
              ? marketingBits.join(" · ")
              : "Няма активни тагове"}
          </p>
          <Link href="/admin/marketing">Настройки</Link>
        </div>
      </div>

      <section
        className="admin-card admin-changelog"
        style={{ marginTop: "1.25rem" }}
      >
        <h2 style={{ marginTop: 0 }}>Промени в магазина</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Отразени тук: каталог, категории, цени и маркетинг. Списъкът с
          продукти се синхронизира автоматично от каталога при зареждане.
        </p>
        {changelog.map((entry) => (
          <div key={entry.date} className="admin-changelog-entry">
            <h3>
              {formatBgDate(entry.date)} — {entry.title}
            </h3>
            <ul>
              {entry.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <p className="muted" style={{ marginBottom: 0 }}>
          Бързи връзки:{" "}
          <Link href="/admin/products?cat=personalized">
            Персонализирани продукти
          </Link>
          {" · "}
          <Link href="/admin/marketing">Facebook споделяне</Link>
          {" · "}
          <Link href="/kategoriya/personalizirani" target="_blank">
            Категорията в магазина
          </Link>
        </p>
      </section>
    </div>
  );
}
