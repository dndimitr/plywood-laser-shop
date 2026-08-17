import { formatBgn } from "@/lib/pricing";
import { FREE_SHIPPING_MIN_EUR } from "@/lib/shop-config";

type Props = {
  subtotal: number;
  courier?: string;
};

export function FreeShippingBar({ subtotal, courier }: Props) {
  if (courier === "PICKUP") return null;

  const min = FREE_SHIPPING_MIN_EUR;
  const remaining = Math.max(0, Math.round((min - subtotal) * 100) / 100);
  const pct = Math.min(100, Math.round((subtotal / min) * 100));
  const met = remaining <= 0;

  return (
    <div className={`shipping-nudge${met ? " is-met" : ""}`}>
      <p>
        {met
          ? "Безплатна куриерска доставка"
          : `Още ${formatBgn(remaining)} до безплатна доставка`}
      </p>
      <div
        className="shipping-nudge-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={min}
        aria-valuenow={Math.min(subtotal, min)}
        aria-label="Прогрес към безплатна доставка"
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
