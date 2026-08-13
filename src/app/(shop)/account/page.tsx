"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBgn } from "@/lib/pricing";
import { orderStatusLabel, paymentMethodLabel } from "@/lib/labels";

type OrderResult = {
  id: string;
  publicToken: string;
  status: string;
  paymentMethod: string;
  totalAmount: number | string;
  createdAt: string | Date;
};

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      setOrders(data.orders ?? []);
      if (!(data.orders ?? []).length) {
        setError("Няма намерени поръчки за този имейл.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container section">
      <h1 className="page-title">Моите поръчки</h1>
      <p className="section-lead">
        Въведете имейла от поръчката, за да видите историята (guest достъп).
      </p>
      <form className="admin-card" onSubmit={lookup} style={{ maxWidth: 480 }}>
        <label className="field">
          <span>Имейл</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Търсене…" : "Покажи поръчки"}
        </button>
      </form>

      {orders.length > 0 ? (
        <table className="admin-table" style={{ marginTop: "1.5rem" }}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Статус</th>
              <th>Сума</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  {new Date(o.createdAt).toLocaleString("bg-BG")}
                  <div className="muted">{o.id}</div>
                </td>
                <td>{orderStatusLabel[o.status] ?? o.status}</td>
                <td>
                  {formatBgn(Number(o.totalAmount))}
                  <div className="muted">
                    {paymentMethodLabel[o.paymentMethod] ?? o.paymentMethod}
                  </div>
                </td>
                <td>
                  <Link
                    href={`/order/${o.id}/success?t=${encodeURIComponent(o.publicToken)}`}
                  >
                    Отвори
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
