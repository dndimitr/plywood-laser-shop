"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBgn } from "@/lib/pricing";
import {
  COURIERS,
  FREE_SHIPPING_MIN_EUR,
  PRODUCTION_LEAD,
  productionLeadHelp,
  shippingFeeFor,
} from "@/lib/shop-config";

type Props = { subtotal: number };

export function CheckoutForm({ subtotal }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    courierOfficeCode: "",
    shippingNote: "",
    paymentMethod: "CASH_ON_DELIVERY",
    courier: "ECONT",
    rush: false,
    needInvoice: false,
    companyName: "",
    vatNumber: "",
    locale: "bg",
  });

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const shippingFee = shippingFeeFor(form.courier, subtotal);
  const estimatedTotal = Math.round((subtotal + shippingFee) * 100) / 100;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            publicToken: data.publicToken,
            amount: data.totalAmount,
          }),
        });
        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
          return;
        }
      }

      router.push(
        `/order/${data.orderId}/success?t=${encodeURIComponent(data.publicToken)}`,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <div className="checkout-steps" aria-label="Стъпки на поръчката">
        <span>1. Количка</span>
        <span className="active">2. Поръчка</span>
        <span>3. Готово</span>
      </div>
      <h1>Данни за доставка и плащане</h1>
      <p className="muted">
        Междинна сума: {formatBgn(subtotal)} · Доставка:{" "}
        {shippingFee === 0 && form.courier !== "PICKUP"
          ? "безплатна"
          : formatBgn(shippingFee)}{" "}
        · <strong>Общо ~ {formatBgn(estimatedTotal)}</strong>
        {subtotal < FREE_SHIPPING_MIN_EUR && form.courier !== "PICKUP" ? (
          <>
            <br />
            Безплатна куриерска доставка при поръчка над{" "}
            {formatBgn(FREE_SHIPPING_MIN_EUR)}.
          </>
        ) : null}
      </p>

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

      <label className="field">
        <span>Куриер</span>
        <select
          value={form.courier}
          onChange={(e) => update("courier", e.target.value)}
        >
          {COURIERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} ({formatBgn(c.fee)})
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>
          {form.courier === "PICKUP"
            ? "Адрес за бележка (по желание)"
            : "Адрес за доставка"}
        </span>
        <textarea
          required={form.courier !== "PICKUP"}
          rows={3}
          value={form.shippingAddress}
          onChange={(e) => update("shippingAddress", e.target.value)}
          placeholder={
            form.courier === "PICKUP"
              ? "По желание — бележка"
              : "Град, улица № / вход / етаж"
          }
        />
      </label>

      {form.courier !== "PICKUP" ? (
        <label className="field">
          <span>Код / име на офис на куриера (по желание)</span>
          <input
            value={form.courierOfficeCode}
            onChange={(e) => update("courierOfficeCode", e.target.value)}
            placeholder="Напр. код на офис Еконт или Speedy"
            maxLength={40}
          />
        </label>
      ) : null}

      <label className="field">
        <span>Бележка към куриера (по желание)</span>
        <input
          value={form.shippingNote}
          onChange={(e) => update("shippingNote", e.target.value)}
        />
      </label>

      <div className="rush-option">
        <label className="radio">
          <input
            type="checkbox"
            checked={form.rush}
            onChange={(e) => update("rush", e.target.checked)}
          />
          Ускорена изработка (+{PRODUCTION_LEAD.rushSurchargePercent}% върху
          изделията) — {PRODUCTION_LEAD.rushLabel}
        </label>
        <p className="muted rush-hint">{productionLeadHelp(form.rush)}</p>
      </div>

      <fieldset className="payment-methods firm-order-block">
        <legend>Фирмена поръчка</legend>
        <label className="radio">
          <input
            type="checkbox"
            checked={form.needInvoice}
            onChange={(e) => update("needInvoice", e.target.checked)}
          />
          Искам фактура за фирма
        </label>
        {form.needInvoice ? (
          <div className="grid-2" style={{ marginTop: "0.75rem" }}>
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
        ) : (
          <p className="muted" style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
            За заведения и фирми — маркирайте за фактура с ЕИК.
          </p>
        )}
      </fieldset>

      <fieldset className="payment-methods">
        <legend>Начин на плащане</legend>
        <label className="radio">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "CASH_ON_DELIVERY"}
            onChange={() => update("paymentMethod", "CASH_ON_DELIVERY")}
          />
          Наложен платеж
        </label>
        <label className="radio">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "BANK_TRANSFER"}
            onChange={() => update("paymentMethod", "BANK_TRANSFER")}
          />
          Банков превод
        </label>
        <label className="radio">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "CARD"}
            onChange={() => update("paymentMethod", "CARD")}
          />
          Карта онлайн (Stripe)
        </label>
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
  );
}
