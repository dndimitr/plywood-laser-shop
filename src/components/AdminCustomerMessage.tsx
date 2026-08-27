"use client";

import { useState } from "react";
import {
  TEMPLATE_KEYS,
  TEMPLATE_LABELS,
  type TemplateKey,
} from "@/lib/email-templates";

type Props = { orderId: string };

export function AdminCustomerMessage({ orderId }: Props) {
  const [key, setKey] = useState<TemplateKey>("shipped");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, note }),
      });
      const data = (await res.json()) as {
        error?: string;
        subject?: string;
        body?: string;
      };
      if (!res.ok) {
        if (data.body) {
          await navigator.clipboard.writeText(data.body);
          setMessage("Имейлът не е конфигуриран. Текстът е копиран за SMS.");
          return;
        }
        throw new Error(data.error ?? "Грешка");
      }
      setMessage(`Изпратено: ${data.subject}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Съобщение към клиента</h3>
      <label className="field">
        <span>Шаблон</span>
        <select
          value={key}
          onChange={(e) => setKey(e.target.value as TemplateKey)}
        >
          {TEMPLATE_KEYS.map((id) => (
            <option key={id} value={id}>
              {TEMPLATE_LABELS[id]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Допълнителна бележка</span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={pending}
        onClick={send}
      >
        {pending ? "Изпращане…" : "Изпрати имейл"}
      </button>
      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
