import { redirect } from "next/navigation";
import { PricingRuleForm } from "@/components/PricingRuleForm";
import { ADMIN_CATALOG_PRICE_NOTES } from "@/lib/admin-changelog";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const rules = await prisma.pricingRule.findMany({ orderBy: { name: "asc" } });
  const { discountPercent, lowPriceBumpPercent, lowPriceMaxEur } =
    ADMIN_CATALOG_PRICE_NOTES;

  return (
    <div className="admin-panel">
      <h1>Ценови правила</h1>
      <p className="muted">
        Формула за къстъм: площ(см²) × цена/см² × коеф. дебелина × множител
        сложност. Каталожните цени се управляват от seed каталога (−
        {discountPercent}% базова корекция; +{lowPriceBumpPercent}% за
        продукти до {lowPriceMaxEur} €). Минимумите по-долу се синхронизират с
        тази политика.
      </p>
      <div className="admin-grid">
        {rules.map((rule) => (
          <PricingRuleForm
            key={rule.id}
            rule={{
              id: rule.id,
              name: rule.name,
              pricePerCm2: Number(rule.pricePerCm2),
              minPrice: Number(rule.minPrice),
              thicknessCoefficients:
                rule.thicknessCoefficients as Record<string, number>,
              complexityMultipliers:
                rule.complexityMultipliers as Record<string, number>,
              active: rule.active,
            }}
          />
        ))}
      </div>
    </div>
  );
}
