"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerFlagLabel } from "@/lib/labels";

type Profile = {
  email: string;
  phone?: string | null;
  name?: string | null;
  flag: string;
  note?: string | null;
};

export function AdminCustomerProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>Бележка / флаг</h3>
      <label className="field">
        <span>Имейл</span>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Флаг</span>
        <select
          value={form.flag}
          onChange={(e) => setForm({ ...form, flag: e.target.value })}
        >
          {Object.entries(customerFlagLabel).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Вътрешна бележка</span>
        <textarea
          rows={3}
          value={form.note ?? ""}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={save}
      >
        {pending ? "Запис…" : "Запази"}
      </button>
    </div>
  );
}
