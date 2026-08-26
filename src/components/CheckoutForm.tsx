"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FreeShippingBar } from "@/components/FreeShippingBar";
import type { CartItem } from "@/lib/cart";
import { cartItemImage } from "@/lib/cart-image";
import { formatBgn } from "@/lib/pricing";
import { FREE_SHIPPING_MIN_EUR } from "@/lib/shop-config";

type CourierOption = { id: string; label: string; fee: number };

type Props = {
  subtotal: number;
  couriers: CourierOption[];
  items: CartItem[];
};

export function CheckoutForm({ subtotal, couriers, items }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingNote: "",
    paymentMethod: "CASH_ON_DELIVERY",
    courier: couriers[0]?.id ?? "ECONT",
    rush: false,
    needInvoice: false,
    companyName: "",
    vatNumber: "",
    locale: "bg",
  });

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const baseFee = couriers.find((c) => c.id === form.courier)?.fee ?? 0;
  const shippingFee =
    form.courier === "PICKUP" || subtotal >= FREE_SHIPPING_MIN_EUR
      ? 0
      : baseFee;
  const estimatedTotal = Math.round((subtotal + shippingFee) * 100) / 100;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      let data: {
        error?: unknown;
        orderId?: string;
        publicToken?: string;
        totalAmount?: number;
      } = {};
      if (text) {
        try {
          data = JSON.parse(text) as typeof data;
        } catch {
          throw new Error("Поръчката не можа да се запише. Опитайте отново.");
        }
      }
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Проверете данните във формата",
        );
      }

      if (form.paymentMethod === "CARD") {
        const stripeRes = await fetch("/api/payments/stripe", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            publicToken: data.publicToken,
            amount: data.totalAmount,
          }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.assign(stripeData.url);
          return;
        }
      }

      if (!data.orderId || !data.publicToken) {
        throw new Error("Поръчката не можа да се запише. Опитайте отново.");
      }

      window.location.assign(
        `/order/${data.orderId}/success?t=${encodeURIComponent(data.publicToken)}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="checkout-layout">
      <form className="checkout-form checkout-form-col" onSubmit={submit}>
        <div className="checkout-steps" aria-label="Стъпки на поръчката">
          <span>1. Количка</span>
          <span className="active">2. Поръчка</span>
          <span>3. Готово</span>
        </div>
        <h1>Данни за доставка и плащане</h1>

        <label className="field">
          <span>Име и фамилия</span>
          <input
            required
            autoComplete="name"
            value={form.customerName}
            onChange={(e) => update("customerName", e.target.value)}
          />
        </label>
        <div className="grid-2">
          <label className="field">
            <span>Имейл</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.customerEmail}
              onChange={(e) => update("customerEmail", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Телефон</span>
            <input
              required
              autoComplete="tel"
              value={form.customerPhone}
              onChange={(e) => update("customerPhone", e.target.value)}
            />
          </label>
        </div>

        <fieldset className="field">
          <legend>Куриер</legend>
          <div className="choice-grid">
            {couriers.map((c) => {
              const fee =
                c.id === "PICKUP" || subtotal >= FREE_SHIPPING_MIN_EUR
                  ? 0
                  : c.fee;
              const selected = form.courier === c.id;
              return (
                <label
                  key={c.id}
                  className={`choice-card${selected ? " is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="courier"
                    value={c.id}
                    checked={selected}
                    onChange={() => update("courier", c.id)}
                  />
                  <span className="choice-card-label">{c.label}</span>
                  <span className="choice-card-meta">
                    {fee === 0 && c.id !== "PICKUP"
                      ? "безплатна"
                      : c.id === "PICKUP"
                        ? "без такса"
                        : formatBgn(fee)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field">
          <span>Адрес / офис на куриер</span>
          <textarea
            required
            rows={3}
            value={form.shippingAddress}
            onChange={(e) => update("shippingAddress", e.target.value)}
            placeholder="Град, улица № или офис на Еконт / Speedy"
          />
        </label>
        <label className="field">
          <span>Бележка към куриера (по желание)</span>
          <input
            value={form.shippingNote}
            onChange={(e) => update("shippingNote", e.target.value)}
          />
        </label>

        <label className="radio">
          <input
            type="checkbox"
            checked={form.rush}
            onChange={(e) => update("rush", e.target.checked)}
          />
          <span>Ускорена изработка (+50% върху изделията)</span>
        </label>

        <label className="radio">
          <input
            type="checkbox"
            checked={form.needInvoice}
            onChange={(e) => update("needInvoice", e.target.checked)}
          />
          <span>Искам фактура</span>
        </label>

        {form.needInvoice ? (
          <div className="grid-2">
            <label className="field">
              <span>Фирма</span>
              <input
                required={form.needInvoice}
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            </label>
            <label className="field">
              <span>ЕИК / ДДС номер</span>
              <input
                required={form.needInvoice}
                value={form.vatNumber}
                onChange={(e) => update("vatNumber", e.target.value)}
              />
            </label>
          </div>
        ) : null}

        <fieldset className="field payment-methods">
          <legend>Начин на плащане</legend>
          <div className="choice-grid">
            <label
              className={`choice-card${form.paymentMethod === "CASH_ON_DELIVERY" ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="CASH_ON_DELIVERY"
                checked={form.paymentMethod === "CASH_ON_DELIVERY"}
                onChange={() => update("paymentMethod", "CASH_ON_DELIVERY")}
              />
              <span className="choice-card-label">Наложен платеж</span>
              <span className="choice-card-meta">При получаване</span>
            </label>
            <label
              className={`choice-card${form.paymentMethod === "BANK_TRANSFER" ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={form.paymentMethod === "BANK_TRANSFER"}
                onChange={() => update("paymentMethod", "BANK_TRANSFER")}
              />
              <span className="choice-card-label">Банков превод</span>
              <span className="choice-card-meta">По сметка</span>
            </label>
            <label
              className={`choice-card${form.paymentMethod === "CARD" ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="payment"
                value="CARD"
                checked={form.paymentMethod === "CARD"}
                onChange={() => update("paymentMethod", "CARD")}
              />
              <span className="choice-card-label">Карта онлайн</span>
              <span className="choice-card-meta">Stripe</span>
            </label>
          </div>
        </fieldset>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Изпращане…" : "Изпрати поръчката"}
        </button>
      </form>

      <aside className="checkout-summary" aria-label="Обобщение на поръчката">
        <h2>Вашата поръчка</h2>
        <ul className="checkout-summary-list">
          {items.map((item) => {
            const image = cartItemImage(item);
            return (
              <li key={item.id} className="checkout-summary-item">
                <div className="cart-item-media checkout-summary-thumb">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="56px"
                      style={{ objectFit: "contain" }}
                      unoptimized={image.endsWith(".svg")}
                    />
                  ) : (
                    <div className="product-card-placeholder" aria-hidden />
                  )}
                </div>
                <div>
                  <p className="checkout-summary-title">{item.title}</p>
                  <p className="muted">
                    {item.quantity} × {formatBgn(item.unitPrice)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <FreeShippingBar subtotal={subtotal} courier={form.courier} />
        <p className="muted">
          Междинна сума: {formatBgn(subtotal)}
          <br />
          Доставка:{" "}
          {shippingFee === 0 && form.courier !== "PICKUP"
            ? "безплатна"
            : formatBgn(shippingFee)}
        </p>
        <p className="checkout-summary-total">
          Общо <strong>{formatBgn(estimatedTotal)}</strong>
        </p>
        <p>
          <Link href="/cart" className="muted">
            Редактирай количката
          </Link>
        </p>
      </aside>
    </div>
  );
}
