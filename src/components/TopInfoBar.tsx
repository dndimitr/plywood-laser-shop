import {
  IconFacebook,
  IconPackage,
  IconPhone,
  IconTruck,
  IconViber,
} from "@/components/Icons";
import {
  FREE_SHIPPING_MIN_EUR,
  getShopFacebookUrl,
  getShopPhone,
  getShopPhoneHref,
  getShopViberHref,
  PRODUCTION_LEAD,
} from "@/lib/shop-config";

export function TopInfoBar() {
  const phone = getShopPhone();
  const phoneHref = getShopPhoneHref();
  const viberHref = getShopViberHref();
  const facebookUrl = getShopFacebookUrl();

  return (
    <div className="top-info-bar" role="region" aria-label="Доставка и изработка">
      <div className="container top-info-bar-inner">
        <p className="top-info-item">
          <IconPackage size={15} aria-hidden />
          <span>
            <span className="top-info-lead">Изработка </span>
            <strong>{PRODUCTION_LEAD.standardLabel}</strong>
            <span className="top-info-rush">
              {" "}
              · ускорена <strong>{PRODUCTION_LEAD.rushLabel}</strong>
            </span>
          </span>
        </p>
        <span className="top-info-sep" aria-hidden>
          ·
        </span>
        <p className="top-info-item">
          <IconTruck size={15} aria-hidden />
          <span className="top-info-ship-full">
            Безплатна доставка над <strong>{FREE_SHIPPING_MIN_EUR} €</strong>
          </span>
          <span className="top-info-ship-short">
            Над <strong>{FREE_SHIPPING_MIN_EUR} €</strong> безплатно
          </span>
        </p>
        <span className="top-info-sep top-info-sep-phone" aria-hidden>
          ·
        </span>
        <p className="top-info-item top-info-phone">
          <IconPhone size={15} aria-hidden />
          <a href={phoneHref}>{phone}</a>
        </p>
        <span className="top-info-sep top-info-sep-social" aria-hidden>
          ·
        </span>
        <p className="top-info-item top-info-social">
          <a
            href={viberHref}
            className="top-info-icon-link"
            aria-label="Поръчай по Viber"
          >
            <IconViber size={15} aria-hidden />
            <span>Viber</span>
          </a>
          <a
            href={facebookUrl}
            className="top-info-icon-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <IconFacebook size={15} aria-hidden />
            <span className="top-info-fb-label">Facebook</span>
          </a>
        </p>
      </div>
    </div>
  );
}
