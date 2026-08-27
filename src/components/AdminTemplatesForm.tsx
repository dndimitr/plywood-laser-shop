"use client";

import { useState } from "react";
import { TEMPLATE_LABELS, type TemplateKey } from "@/lib/email-templates";

type Row = { key: string; subject: string; body: string };

export function AdminTemplatesForm({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function save(row: Row) {
    setPending(row.key);
    setError(null);
    setSaved(null);
    try {
      const res = await fetch("/api/admin/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Грешка");
      setSaved(row.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="admin-grid">
      {rows.map((row, index) => (
        <div key={row.key} className="admin-card">
          <h3>{TEMPLATE_LABELS[row.key as TemplateKey] ?? row.key}</h3>
          <p className="muted">
            Променливи: {"{{name}}"} {"{{orderId}}"} {"{{note}}"} {"{{orderUrl}}"}{" "}
            {"{{trackingUrl}}"} {"{{total}}"} {"{{bankDetails}}"}
          </p>
          <label className="field">
            <span>Тема</span>
            <input
              value={row.subject}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, subject: e.target.value } : item,
                  ),
                )
              }
            />
          </label>
          <label className="field">
            <span>Текст</span>
            <textarea
              rows={8}
              value={row.body}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((item, i) =>
                    i === index ? { ...item, body: e.target.value } : item,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending === row.key}
            onClick={() => save(row)}
          >
            {pending === row.key ? "Запис…" : "Запази шаблона"}
          </button>
          {saved === row.key ? <p className="success-text">Записано</p> : null}
        </div>
      ))}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
