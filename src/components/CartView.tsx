"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Cart } from "@/lib/cart";
import { formatBgn } from "@/lib/pricing";

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
          <Link href="/#katalog" className="btn btn-primary">
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

  return (
    <div className="cart-page">
      <div className="checkout-steps" aria-label="Стъпки на поръчката">
        <span className="active">1. Количка</span>
        <span>2. Поръчка</span>
        <span>3. Готово</span>
      </div>
      <h1 className="page-title">Количка</h1>
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
              {item.personalization.rush ? (
                <p className="muted" style={{ margin: "0.2rem 0" }}>
                  Ускорена изработка · 1–2 раб. дни
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
                  max={50}
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
                      quantity: Math.min(50, item.quantity + 1),
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
            <strong>{formatBgn(total || subtotal)}</strong>
          </p>
        </div>
        <div className="cta-row">
          <Link href="/#katalog" className="btn btn-ghost">
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
