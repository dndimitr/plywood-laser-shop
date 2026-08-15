import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata, hasMarketingScripts } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Поверителност",
  description:
    "Политика за поверителност на ЛазерШперплат — как обработваме лични данни, поръчки и маркетингови бисквитки.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  const marketing = hasMarketingScripts();

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
      {marketing ? (
        <>
          <h2>Аналитика и реклама</h2>
          <p className="muted">
            С ваше съгласие използваме Google Analytics 4 и/или Google Ads
            (включително през Google Tag Manager, ако е конфигуриран), за да
            измерваме посещения и ефективност на рекламите. До съгласие
            маркетинговите бисквитки са отказани чрез Google Consent Mode.
            Можете да промените избора си, като изтриете записаните данни на
            сайта в браузъра и презаредите страницата.
          </p>
        </>
      ) : null}
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
