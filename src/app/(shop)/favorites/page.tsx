import type { Metadata } from "next";
import { FavoritesView } from "@/components/FavoritesView";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Любими",
  description: "Запазени продукти от каталога на ЛазерШперплат.",
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return (
    <div className="container product-detail">
      <FavoritesView />
    </div>
  );
}
