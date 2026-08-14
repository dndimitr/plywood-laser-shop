import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";

export const metadata: Metadata = {
  title: "Любими",
  description: "Запазени продукти от каталога на ЛазерШперплат.",
};

export default function FavoritesPage() {
  return (
    <div className="container product-detail">
      <FavoritesView />
    </div>
  );
}
