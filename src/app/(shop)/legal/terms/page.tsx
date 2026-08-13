import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Общи условия" };

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
