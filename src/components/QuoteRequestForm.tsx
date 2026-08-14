"use client";

import { useState } from "react";

type Props = {
  defaultSource?: "business" | "custom" | "product";
  productSlug?: string;
  title?: string;
  lead?: string;
};

export function QuoteRequestForm({
  defaultSource = "business",
  productSlug,
  title = "Заявка за оферта",
  lead = "За големи количества, лого или фирмена поръчка — опишете нуждите и ще ви върнем с оферта.",
}: Props) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    companyName: "",
    quantity: "",
    message: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: form.quantity ? Number(form.quantity) : undefined,
          source: defaultSource,
          productSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Неуспешно изпращане — опитайте отново",
        );
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="quote-form quote-form-success">
        <h2>{title}</h2>
        <p>
          Благодарим! Получихме заявката и ще се свържем на посочения имейл или
          телефон.
        </p>
      </div>
    );
  }

  return (
    <form className="quote-form" onSubmit={submit}>
      <h2>{title}</h2>
      <p className="muted">{lead}</p>

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
      <div className="grid-2">
        <label className="field">
          <span>Фирма (по желание)</span>
          <input
            autoComplete="organization"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
          />
        </label>
        <label className="field">
          <span>Приблизително количество</span>
          <input
            type="number"
            min={1}
            placeholder="напр. 100"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </label>
      </div>
      <label className="field">
        <span>Описание на нуждите</span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Лого, размери, материал, срок, адрес на обекта…"
        />
      </label>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Изпращане…" : "Изпрати заявката"}
      </button>
    </form>
  );
}
