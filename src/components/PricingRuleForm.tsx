"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Rule = {
  id: string;
  name: string;
  pricePerCm2: number | string;
  minPrice: number | string;
  thicknessCoefficients: Record<string, number>;
  complexityMultipliers: Record<string, number>;
  active: boolean;
};

export function PricingRuleForm({ rule }: { rule: Rule }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: rule.id,
    pricePerCm2: Number(rule.pricePerCm2),
    minPrice: Number(rule.minPrice),
    thicknessCoefficients: JSON.stringify(rule.thicknessCoefficients, null, 2),
    complexityMultipliers: JSON.stringify(rule.complexityMultipliers, null, 2),
    active: rule.active,
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          pricePerCm2: form.pricePerCm2,
          minPrice: form.minPrice,
          thicknessCoefficients: JSON.parse(form.thicknessCoefficients),
          complexityMultipliers: JSON.parse(form.complexityMultipliers),
          active: form.active,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Грешка");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save}>
      <h3>{rule.name}</h3>
      <div className="grid-2">
        <label className="field">
          <span>Цена на см² (€)</span>
          <input
            type="number"
            step="0.0001"
            value={form.pricePerCm2}
            onChange={(e) =>
              setForm({ ...form, pricePerCm2: Number(e.target.value) })
            }
          />
        </label>
        <label className="field">
          <span>Минимална цена (€)</span>
          <input
            type="number"
            step="0.01"
            value={form.minPrice}
            onChange={(e) =>
              setForm({ ...form, minPrice: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <label className="field">
        <span>Коефициенти по дебелина (JSON)</span>
        <textarea
          rows={5}
          value={form.thicknessCoefficients}
          onChange={(e) =>
            setForm({ ...form, thicknessCoefficients: e.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Множители по сложност (JSON)</span>
        <textarea
          rows={5}
          value={form.complexityMultipliers}
          onChange={(e) =>
            setForm({ ...form, complexityMultipliers: e.target.value })
          }
        />
      </label>
      <label className="field">
        <span>Активно</span>
        <select
          value={form.active ? "1" : "0"}
          onChange={(e) => setForm({ ...form, active: e.target.value === "1" })}
        >
          <option value="1">Да</option>
          <option value="0">Не</option>
        </select>
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Запис..." : "Запази"}
      </button>
    </form>
  );
}
