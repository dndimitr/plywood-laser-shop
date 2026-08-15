import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Общи условия",
  description:
    "Общи условия за поръчки за лазерно гравиране и изрязване на шперплат чрез ЛазерШперплат.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <div className="container section">
      <h1 className="page-title">Общи условия</h1>
      <p className="section-lead">
        Настоящите условия уреждат поръчките за лазерно гравиране и изрязване на
        шперплат чрез ЛазерШперплат.
      </p>
      <h2>Поръчки и макети</h2>
      <p className="muted">
        При поръчка по файл клиентът носи отговорност за правата върху дизайна.
        Започваме производство след потвърждение на макета при нужда.
      </p>
      <h2>Цени и плащане</h2>
      <p className="muted">
        Цените са в лева. Приемаме наложен платеж, банков превод и онлайн карта
        (когато е активирана). Минимална стойност може да се прилага според
        ценовите правила.
      </p>
      <h2>Срокове и доставка</h2>
      <p className="muted">
        Стандартният срок за изработка е 2–5 работни дни, освен при ускорена
        поръчка. Доставката се извършва с избран куриер или лично получаване.
      </p>
      <Link href="/" className="btn btn-ghost">
        Назад
      </Link>
    </div>
  );
}
