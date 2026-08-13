import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Поверителност" };

export default function PrivacyPage() {
  return (
    <div className="container section">
      <h1 className="page-title">Политика за поверителност</h1>
      <p className="section-lead">
        Обработваме лични данни единствено за изпълнение на поръчки и връзка с
        вас.
      </p>
      <h2>Какви данни събираме</h2>
      <p className="muted">
        Име, телефон, имейл, адрес за доставка, данни за фактура (при заявка) и
        качени производствени файлове.
      </p>
      <h2>Съхранение и достъп</h2>
      <p className="muted">
        Поръчките са достъпни чрез защитен линк с токен. Не публикуваме лични
        данни на отворени URL адреси без токен.
      </p>
      <h2>Права</h2>
      <p className="muted">
        Можете да поискате достъп, корекция или изтриване на данни чрез имейл
        към администратора на магазина.
      </p>
      <Link href="/" className="btn btn-ghost">
        Назад
      </Link>
    </div>
  );
}
