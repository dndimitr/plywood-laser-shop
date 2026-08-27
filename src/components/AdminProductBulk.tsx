"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/shop-config";
import { availabilityLabel } from "@/lib/labels";

export function AdminProductBulk({
  products,
}: {
  products: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id],
    );
  }

  async function apply() {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected,
          ...(category ? { category } : {}),
          ...(availability ? { availability } : {}),
        }),
      });
      const data = (await res.json()) as { error?: string; count?: number };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      setMessage(`Обновени: ${data.count}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Масова промяна</h3>
      <p className="muted">Маркирайте продуктите в таблицата, после категория или наличност.</p>
      <div className="admin-bulk-ids">
        {products.map((product) => (
          <label key={product.id} className="field checkbox">
            <input
              type="checkbox"
              checked={selected.includes(product.id)}
              onChange={() => toggle(product.id)}
            />
            <span>{product.name}</span>
          </label>
        ))}
      </div>
      <div className="grid-2">
        <label className="field">
          <span>Категория</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Без промяна</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Наличност</span>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Без промяна</option>
            {Object.entries(availabilityLabel).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}
      <button
        type="button"
        className="btn btn-ghost"
        disabled={pending || selected.length === 0}
        onClick={apply}
      >
        {pending ? "Запис…" : `Приложи към ${selected.length}`}
      </button>
    </div>
  );
}
