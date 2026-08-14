import { IconPackage, IconTruck } from "@/components/Icons";
import { FREE_SHIPPING_MIN_EUR, PRODUCTION_LEAD } from "@/lib/shop-config";

export function TopInfoBar() {
  return (
    <div className="top-info-bar" role="region" aria-label="Доставка и изработка">
      <div className="container top-info-bar-inner">
        <p className="top-info-item">
          <IconPackage size={15} aria-hidden />
          <span>
            Изработка <strong>{PRODUCTION_LEAD.standardLabel}</strong>
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
          <span>
            Безплатна доставка над <strong>{FREE_SHIPPING_MIN_EUR} €</strong>
          </span>
        </p>
      </div>
    </div>
  );
}
