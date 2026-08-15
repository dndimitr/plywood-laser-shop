import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Рекламации и връщане",
  description:
    "Условия за рекламации и връщане на персонализирани лазерни изделия от ЛазерШперплат.",
  path: "/legal/returns",
});

export default function ReturnsPage() {
  return (
    <div className="container section">
      <h1 className="page-title">Рекламации и връщане</h1>
      <p className="section-lead">
        Персонализираните лазерни изделия се изработват по поръчка.
      </p>
      <h2>Персонализирани продукти</h2>
      <p className="muted">
        Съгласно практиката за стоки по индивидуална спецификация, връщане без
        дефект обикновено не се прилага. При производствен брак ще предложим
        преизработка или решение по споразумение.
      </p>
      <h2>Как подавате рекламация</h2>
      <p className="muted">
        Пишете ни с номера на поръчката и снимки на проблема в рамките на 7 дни
        след получаване.
      </p>
      <Link href="/" className="btn btn-ghost">
        Назад
      </Link>
    </div>
  );
}
