"use client";

import { useState } from "react";
import type { ShippingFees } from "@/lib/shipping-settings";

type Props = { initial: ShippingFees };

export function ShippingFeesForm({ initial }: Props) {
  const [fees, setFees] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fees),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Грешка при запис",
        );
      }
      setFees(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save} style={{ maxWidth: 420 }}>
      <label className="field">
        <span>Еконт (лв.)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={fees.ECONT}
          onChange={(e) =>
            setFees({ ...fees, ECONT: Number(e.target.value) })
          }
        />
      </label>
      <label className="field">
        <span>Speedy (лв.)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={fees.SPEEDY}
          onChange={(e) =>
            setFees({ ...fees, SPEEDY: Number(e.target.value) })
          }
        />
      </label>
      <label className="field">
        <span>Лично получаване (лв.)</span>
        <input
          type="number"
          min={0}
          step="0.01"
          value={fees.PICKUP}
          onChange={(e) =>
            setFees({ ...fees, PICKUP: Number(e.target.value) })
          }
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      {saved ? <p className="success-text">Запазено.</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Запис…" : "Запази цени за доставка"}
      </button>
    </form>
  );
}
