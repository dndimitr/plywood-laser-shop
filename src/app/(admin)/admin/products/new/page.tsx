import { redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { auth } from "@/lib/auth";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="admin-panel">
      <h1>Нов продукт</h1>
      <ProductForm />
    </div>
  );
}
