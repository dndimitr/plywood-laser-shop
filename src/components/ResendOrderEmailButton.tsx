"use client";

import { useState } from "react";

type Props = { orderId: string };

export function ResendOrderEmailButton({ orderId }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/email`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Грешка",
        );
      }
      setMessage("Имейлите са изпратени към клиента и админа.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Имейл</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Изпраща потвърждение към клиента и известие към админа.
      </p>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={pending}
        onClick={send}
      >
        {pending ? "Изпращане…" : "Изпрати отново"}
      </button>
      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
