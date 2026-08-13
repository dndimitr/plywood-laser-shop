"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OptionDraft = {
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: "ENGRAVE" | "CUT" | "BOTH";
  priceModifier: number;
};

type ProductData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl?: string | null;
  active: boolean;
  options: OptionDraft[];
};

const emptyOption = (): OptionDraft => ({
  label: "Стандартен · 4 мм · гравиране",
  sizeLabel: "10×10 см",
  thicknessMm: 4,
  laserType: "ENGRAVE",
  priceModifier: 0,
});

type Props = {
  initial?: ProductData;
};

export function ProductForm({ initial }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductData>(
    initial ?? {
      name: "",
      slug: "",
      description: "",
      basePrice: 20,
      imageUrl: "",
      active: true,
      options: [emptyOption()],
    },
  );

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, ...patch } : opt,
      ),
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const endpoint = form.id
        ? `/api/admin/products/${form.id}`
        : "/api/admin/products";
      const res = await fetch(endpoint, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Грешка при запис",
        );
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save}>
      <label className="field">
        <span>Име</span>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Slug</span>
        <input
          required
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Описание</span>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </label>
      <div className="grid-2">
        <label className="field">
          <span>Базова цена</span>
          <input
            type="number"
            min={1}
            step="0.01"
            value={form.basePrice}
            onChange={(e) =>
              setForm({ ...form, basePrice: Number(e.target.value) })
            }
          />
        </label>
        <label className="field">
          <span>Активен</span>
          <select
            value={form.active ? "1" : "0"}
            onChange={(e) =>
              setForm({ ...form, active: e.target.value === "1" })
            }
          >
            <option value="1">Да</option>
            <option value="0">Не</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span>URL на изображение</span>
        <input
          value={form.imageUrl ?? ""}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </label>

      <h3>Опции</h3>
      {form.options.map((option, index) => (
        <div key={index} className="admin-card" style={{ marginBottom: "0.75rem" }}>
          <label className="field">
            <span>Етикет</span>
            <input
              value={option.label}
              onChange={(e) => updateOption(index, { label: e.target.value })}
            />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Размер</span>
              <input
                value={option.sizeLabel}
                onChange={(e) =>
                  updateOption(index, { sizeLabel: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Дебелина мм</span>
              <input
                type="number"
                value={option.thicknessMm}
                onChange={(e) =>
                  updateOption(index, { thicknessMm: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div className="grid-2">
            <label className="field">
              <span>Тип лазер</span>
              <select
                value={option.laserType}
                onChange={(e) =>
                  updateOption(index, {
                    laserType: e.target.value as OptionDraft["laserType"],
                  })
                }
              >
                <option value="ENGRAVE">Гравиране</option>
                <option value="CUT">Изрязване</option>
                <option value="BOTH">И двете</option>
              </select>
            </label>
            <label className="field">
              <span>Модификатор цена</span>
              <input
                type="number"
                step="0.01"
                value={option.priceModifier}
                onChange={(e) =>
                  updateOption(index, {
                    priceModifier: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
        </div>
      ))}

      <div className="cta-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              options: [...prev.options, emptyOption()],
            }))
          }
        >
          Добави опция
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Запис..." : "Запази"}
      </button>
    </form>
  );
}
