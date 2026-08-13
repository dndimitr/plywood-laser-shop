import { IconPackage, IconTruck } from "@/components/Icons";

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
            Доставка <strong>Еконт / Speedy</strong>
          </span>
        </p>
      </div>
    </div>
  );
}
