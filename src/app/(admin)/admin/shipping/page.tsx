import { ShippingFeesForm } from "@/components/ShippingFeesForm";
import { auth } from "@/lib/auth";
import { getShippingFees } from "@/lib/shipping-settings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const fees = getShippingFees();

  return (
    <div className="admin-panel">
      <h1>Цени на доставка</h1>
      <p className="muted">
        Тези суми се показват в касата и се добавят към поръчката при поръчване.
      </p>
      <ShippingFeesForm initial={fees} />
    </div>
  );
}
