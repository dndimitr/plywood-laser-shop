import { MarketingSettingsForm } from "@/components/MarketingSettingsForm";
import { auth } from "@/lib/auth";
import { getMarketingSettingsForAdmin } from "@/lib/shop-settings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const marketing = getMarketingSettingsForAdmin();

  return (
    <div className="admin-panel">
      <h1>Маркетинг и аналитика</h1>
      <p className="muted" style={{ maxWidth: "40rem" }}>
        Настройки за Google Analytics, Google Ads, Meta Pixel + CAPI и
        споделяне на продукти във Facebook. Можете да ги променяте тук без
        redeploy (env стойностите служат като начални стойности, ако файлът е
        празен).
      </p>
      <MarketingSettingsForm initial={marketing} />
    </div>
  );
}
