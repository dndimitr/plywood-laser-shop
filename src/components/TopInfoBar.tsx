import { IconPackage, IconTruck } from "@/components/Icons";
import { FREE_SHIPPING_MIN_EUR } from "@/lib/shop-config";

export function TopInfoBar() {
  return (
    <div className="top-info-bar" role="region" aria-label="Доставка и изработка">
      <div className="container top-info-bar-inner">
        <p className="top-info-item">
          <IconPackage size={15} aria-hidden />
          <span>
            Изработка <strong>2–5 раб. дни</strong>
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
