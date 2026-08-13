"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBgn } from "@/lib/pricing";
import { COURIERS } from "@/lib/shop-config";

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
    shippingNote: "",
    paymentMethod: "CASH_ON_DELIVERY",
    courier: "ECONT",
    rush: false,
    needInvoice: false,
    companyName: "",
    vatNumber: "",
    locale: "bg",
  });

  const isPickup = form.courier === "PICKUP";
  const codAvailable = !isPickup;

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (isPickup && form.paymentMethod === "CASH_ON_DELIVERY") {
      setForm((prev) => ({ ...prev, paymentMethod: "BANK_TRANSFER" }));
    }
  }, [isPickup, form.paymentMethod]);

  const shippingFee =
    COURIERS.find((c) => c.id === form.courier)?.fee ?? 0;
  const estimatedTotal = Math.round((subtotal + shippingFee) * 100) / 100;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (form.paymentMethod === "CASH_ON_DELIVERY" && isPickup) {
        throw new Error(
          "Наложеният платеж е само при доставка с куриер. Изберете Еконт или Speedy.",
        );
      }

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
            : data?.details?.fieldErrors?.paymentMethod?.[0] ??
                "Проверете данните във формата",
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
        Междинна сума: {formatBgn(subtotal)} · Доставка: {formatBgn(shippingFee)} ·{" "}
        <strong>Общо ~ {formatBgn(estimatedTotal)}</strong>
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
          {isPickup ? "Адрес / място за получаване" : "Адрес / офис на куриер"}
        </span>
        <textarea
          required
          rows={3}
          value={form.shippingAddress}
          onChange={(e) => update("shippingAddress", e.target.value)}
          placeholder={
            isPickup
              ? "Къде ще получите поръчката"
              : "Град, улица № или офис на Еконт / Speedy"
          }
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
        Ускорена изработка (+50% върху изделията)
      </label>

      <label className="radio">
        <input
          type="checkbox"
          checked={form.needInvoice}
          onChange={(e) => update("needInvoice", e.target.checked)}
        />
        Искам фактура
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

        <label className={`payment-option${codAvailable ? "" : " is-disabled"}`}>
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "CASH_ON_DELIVERY"}
            disabled={!codAvailable}
            onChange={() => update("paymentMethod", "CASH_ON_DELIVERY")}
          />
          <span className="payment-option-body">
            <strong>Наложен платеж при доставка</strong>
            <span className="muted">
              {codAvailable
                ? "Плащате в брой или с карта на куриера при получаване на пратката."
                : "Наличен само при доставка с Еконт или Speedy."}
            </span>
          </span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "BANK_TRANSFER"}
            onChange={() => update("paymentMethod", "BANK_TRANSFER")}
          />
          <span className="payment-option-body">
            <strong>Банков превод</strong>
            <span className="muted">
              Ще получите IBAN и основание след потвърждение на поръчката.
            </span>
          </span>
        </label>

        <label className="payment-option">
          <input
            type="radio"
            name="payment"
            checked={form.paymentMethod === "CARD"}
            onChange={() => update("paymentMethod", "CARD")}
          />
          <span className="payment-option-body">
            <strong>Карта онлайн</strong>
            <span className="muted">Плащане чрез Stripe (ако е активирано).</span>
          </span>
        </label>
      </fieldset>

      {form.paymentMethod === "CASH_ON_DELIVERY" && codAvailable ? (
        <p className="payment-hint muted" role="note">
          Сумата от {formatBgn(estimatedTotal)} се дължи при получаване от{" "}
          {form.courier === "SPEEDY" ? "Speedy" : "Еконт"}.
        </p>
      ) : null}

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
