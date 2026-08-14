"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Cart } from "@/lib/cart";
import { formatBgn } from "@/lib/pricing";
import { FREE_SHIPPING_MIN_EUR, MAX_LINE_QTY } from "@/lib/shop-config";

type Props = { initialCart: Cart; subtotal: number };

export function CartView({ initialCart, subtotal }: Props) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [pending, setPending] = useState(false);

  async function mutate(body: Record<string, unknown>) {
    setPending(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <div className="checkout-steps" aria-hidden>
          <span className="active">1. Количка</span>
          <span>2. Поръчка</span>
          <span>3. Готово</span>
        </div>
        <h1 className="page-title">Количката е празна</h1>
        <p className="muted">
          Разгледайте каталога с готови модели или качете файл за изработка.
        </p>
        <div className="cta-row" style={{ marginTop: "1.25rem" }}>
          <Link href="/katalog" className="btn btn-primary">
            Към каталога
          </Link>
          <Link href="/custom" className="btn btn-ghost">
            Поръчка по файл
          </Link>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const shown = total || subtotal;
  const remaining = Math.max(0, Math.round((FREE_SHIPPING_MIN_EUR - shown) * 100) / 100);
  const progress = Math.min(100, Math.round((shown / FREE_SHIPPING_MIN_EUR) * 100));

  return (
    <div className="cart-page">
      <div className="checkout-steps" aria-label="Стъпки на поръчката">
        <span className="active">1. Количка</span>
        <span>2. Поръчка</span>
        <span>3. Готово</span>
      </div>
      <h1 className="page-title">Количка</h1>

      <div className="free-ship-progress" aria-live="polite">
        {remaining > 0 ? (
          <p className="muted" style={{ margin: "0 0 0.45rem" }}>
            Остават <strong>{formatBgn(remaining)}</strong> до безплатна
            куриерска доставка
          </p>
        ) : (
          <p className="muted" style={{ margin: "0 0 0.45rem" }}>
            Поздравления — куриерската доставка е <strong>безплатна</strong>
          </p>
        )}
        <div
          className="free-ship-bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul className="cart-list">
        {cart.items.map((item) => (
          <li key={item.id} className="cart-item">
            <div>
              <h3 style={{ margin: "0 0 0.35rem", fontFamily: "var(--font-display), Georgia, serif" }}>
                {item.title}
              </h3>
              <p className="muted" style={{ margin: "0 0 0.35rem" }}>
                {item.type === "TEMPLATE" ? "Готов модел" : "По файл"} ·{" "}
                {formatBgn(item.unitPrice)} / бр.
              </p>
              {item.personalization.engravingText ? (
                <p style={{ margin: "0.2rem 0" }}>
                  Текст: {item.personalization.engravingText}
                </p>
              ) : null}
              {item.personalization.optionLabel ? (
                <p className="muted" style={{ margin: "0.2rem 0" }}>
                  {item.personalization.optionLabel}
                </p>
              ) : null}
              {item.personalization.widthCm ? (
                <p className="muted" style={{ margin: "0.2rem 0" }}>
                  {item.personalization.widthCm}×{item.personalization.heightCm}{" "}
                  см · {item.personalization.thicknessMm} мм
                </p>
              ) : null}
            </div>
            <div className="cart-item-actions">
              <div className="qty-control">
                <button
                  type="button"
                  aria-label="Намали"
                  disabled={pending}
                  onClick={() =>
                    mutate({
                      action: "update_qty",
                      id: item.id,
                      quantity: Math.max(1, item.quantity - 1),
                    })
                  }
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={MAX_LINE_QTY}
                  value={item.quantity}
                  disabled={pending}
                  aria-label={`Количество за ${item.title}`}
                  onChange={(e) =>
                    mutate({
                      action: "update_qty",
                      id: item.id,
                      quantity: Number(e.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  aria-label="Увеличи"
                  disabled={pending}
                  onClick={() =>
                    mutate({
                      action: "update_qty",
                      id: item.id,
                      quantity: Math.min(MAX_LINE_QTY, item.quantity + 1),
                    })
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pending}
                onClick={() => mutate({ action: "remove", id: item.id })}
              >
                Премахни
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div>
          <p style={{ margin: 0 }} className="muted">
            Междинна сума
          </p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "1.35rem" }}>
            <strong>{formatBgn(shown)}</strong>
          </p>
        </div>
        <div className="cta-row">
          <Link href="/katalog" className="btn btn-ghost">
            Продължете пазаруването
          </Link>
          <Link href="/checkout" className="btn btn-primary">
            Към данни за доставка
          </Link>
        </div>
      </div>
    </div>
  );
}
