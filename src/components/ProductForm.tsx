"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FINISHES, MATERIALS } from "@/lib/shop-config";
import { DeleteProductButton } from "@/components/DeleteProductButton";
import { DuplicateProductButton } from "@/components/DuplicateProductButton";
import { availabilityLabel } from "@/lib/labels";

type OptionDraft = {
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: "ENGRAVE" | "CUT" | "BOTH";
  material: string;
  finish: string;
  doubleSided: boolean;
  priceModifier: number;
};

type ProductData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string | null;
  galleryUrls: string[];
  active: boolean;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "SEASONAL_PAUSE";
  options: OptionDraft[];
};

const emptyOption = (): OptionDraft => ({
  label: "Стандартен · 4 мм · гравиране",
  sizeLabel: "10×10 см",
  thicknessMm: 4,
  laserType: "ENGRAVE",
  material: "birch-plywood",
  finish: "raw",
  doubleSided: false,
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
      category: "other",
      basePrice: 20,
      imageUrl: "",
      galleryUrls: [],
      active: true,
      availability: "IN_STOCK",
      options: [emptyOption()],
    },
  );
  const [galleryText, setGalleryText] = useState(
    (initial?.galleryUrls ?? []).join("\n"),
  );

  function updateOption(index: number, patch: Partial<OptionDraft>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, ...patch } : opt,
      ),
    }));
  }

  function slugifyName(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const galleryUrls = galleryText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = { ...form, galleryUrls };
      const endpoint = form.id
        ? `/api/admin/products/${form.id}`
        : "/api/admin/products";
      const res = await fetch(endpoint, {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Грешка при запис — проверете полетата",
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
          onChange={(e) => {
            const name = e.target.value;
            setForm((prev) => ({
              ...prev,
              name,
              slug:
                !prev.id && (!prev.slug || prev.slug === slugifyName(prev.name))
                  ? slugifyName(name)
                  : prev.slug,
            }));
          }}
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
        <span>Категория</span>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
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
        <label className="field">
          <span>Наличност</span>
          <select
            value={form.availability}
            onChange={(e) =>
              setForm({
                ...form,
                availability: e.target.value as ProductData["availability"],
              })
            }
          >
            {Object.entries(availabilityLabel).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>URL / път на основно изображение</span>
        <input
          placeholder="/products/photos/slug.png"
          value={form.imageUrl ?? ""}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Галерия (по един URL/път на ред)</span>
        <textarea
          rows={3}
          value={galleryText}
          onChange={(e) => setGalleryText(e.target.value)}
          placeholder="/products/photos/slug.png"
        />
      </label>

      <h3>Опции</h3>
      {form.options.map((option, index) => (
        <div
          key={index}
          className="admin-card"
          style={{ marginBottom: "0.75rem" }}
        >
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
          <div className="grid-2">
            <label className="field">
              <span>Материал</span>
              <select
                value={option.material}
                onChange={(e) =>
                  updateOption(index, { material: e.target.value })
                }
              >
                {MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Покритие</span>
              <select
                value={option.finish}
                onChange={(e) =>
                  updateOption(index, { finish: e.target.value })
                }
              >
                {FINISHES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>Двустранно</span>
            <select
              value={option.doubleSided ? "1" : "0"}
              onChange={(e) =>
                updateOption(index, { doubleSided: e.target.value === "1" })
              }
            >
              <option value="0">Не</option>
              <option value="1">Да</option>
            </select>
          </label>
          {form.options.length > 1 ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  options: prev.options.filter((_, i) => i !== index),
                }))
              }
            >
              Премахни опция
            </button>
          ) : null}
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

      {form.id ? (
        <>
          <DuplicateProductButton productId={form.id} />
          <DeleteProductButton productId={form.id} productName={form.name} />
        </>
      ) : null}
    </form>
  );
}
