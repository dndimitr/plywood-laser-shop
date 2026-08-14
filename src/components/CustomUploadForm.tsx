"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AddToCartToast } from "@/components/AddToCartToast";
import { formatBgn } from "@/lib/pricing";
import { complexityLabel } from "@/lib/labels";
import {
  MACHINE_BED_MAX_CM,
  MAX_LINE_QTY,
  PRODUCTION_LEAD,
  QUOTE_QTY_THRESHOLD,
} from "@/lib/shop-config";

export function CustomUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [widthCm, setWidthCm] = useState(20);
  const [heightCm, setHeightCm] = useState(20);
  const [thicknessMm, setThicknessMm] = useState(4);
  const [complexity, setComplexity] = useState("medium");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [doubleSided, setDoubleSided] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const closeToast = useCallback(() => setToastOpen(false), []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/pricing/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            widthCm,
            heightCm,
            thicknessMm,
            complexity,
            quantity,
            rush: false,
            doubleSided,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        setPrice(data.price);
      } catch {
        /* ignore preview errors */
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [widthCm, heightCm, thicknessMm, complexity, quantity, doubleSided]);

  async function submit() {
    if (!file) {
      setError("Изберете файл с макет");
      return;
    }
    if (price == null) {
      setError("Изчакайте изчислението на цената");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error ?? "Грешка при качване");
      }

      const cartRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_custom",
          uploadedDesignId: uploadData.id,
          title: `Изработка по файл · ${file.name}`,
          widthCm,
          heightCm,
          thicknessMm,
          complexity,
          quantity,
          rush: false,
          doubleSided,
          notes,
        }),
      });
      if (!cartRes.ok) {
        const data = await cartRes.json();
        throw new Error(
          typeof data.error === "string" ? data.error : "Грешка при количката",
        );
      }

      setToastOpen(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="configurator">
      <label className="field">
        <span>Файл с макет (SVG, PNG, PDF, JPG)</span>
        <input
          type="file"
          accept=".svg,.png,.pdf,.jpg,.jpeg,image/svg+xml,image/png,application/pdf,image/jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="grid-2">
        <label className="field">
          <span>Ширина (см)</span>
          <input
            type="number"
            min={1}
            max={MACHINE_BED_MAX_CM}
            value={widthCm}
            onChange={(e) =>
              setWidthCm(
                Math.max(
                  1,
                  Math.min(MACHINE_BED_MAX_CM, Number(e.target.value) || 1),
                ),
              )
            }
          />
        </label>
        <label className="field">
          <span>Височина (см)</span>
          <input
            type="number"
            min={1}
            max={MACHINE_BED_MAX_CM}
            value={heightCm}
            onChange={(e) =>
              setHeightCm(
                Math.max(
                  1,
                  Math.min(MACHINE_BED_MAX_CM, Number(e.target.value) || 1),
                ),
              )
            }
          />
        </label>
      </div>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: "-0.35rem" }}>
        Максимален размер на парче: {MACHINE_BED_MAX_CM}×{MACHINE_BED_MAX_CM} см
        (работна площ на машината).
      </p>

      <label className="field">
        <span>Дебелина на шперплата (мм)</span>
        <select
          value={thicknessMm}
          onChange={(e) => setThicknessMm(Number(e.target.value))}
        >
          <option value={3}>3 мм</option>
          <option value={4}>4 мм</option>
          <option value={6}>6 мм</option>
        </select>
      </label>

      <label className="field">
        <span>Сложност на контура</span>
        <select
          value={complexity}
          onChange={(e) => setComplexity(e.target.value)}
        >
          {Object.entries(complexityLabel).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Количество</span>
        <input
          type="number"
          min={1}
          max={MAX_LINE_QTY}
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Math.min(MAX_LINE_QTY, Number(e.target.value) || 1)),
            )
          }
        />
        <span className="muted" style={{ fontSize: "0.85rem" }}>
          До {MAX_LINE_QTY} бр. Над {QUOTE_QTY_THRESHOLD} бр. —{" "}
          <Link href="/za-biznes#oferta">заявка за оферта</Link>.
        </span>
      </label>

      <label className="radio">
        <input
          type="checkbox"
          checked={doubleSided}
          onChange={(e) => setDoubleSided(e.target.checked)}
        />
        Двустранна обработка
      </label>

      <p className="muted rush-hint">
        Срок: {PRODUCTION_LEAD.standardLabel}. Ускорено (+
        {PRODUCTION_LEAD.rushSurchargePercent}%) се избира при поръчката.
      </p>

      <label className="field">
        <span>Бележки</span>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Материал, посока на влакната, предпочитан срок…"
        />
      </label>

      <p className="price-line" aria-live="polite">
        Ориентировъчна цена:{" "}
        <strong>{price != null ? formatBgn(price) : "…"}</strong>
      </p>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn-primary"
        disabled={pending}
        onClick={submit}
        style={{ width: "100%" }}
      >
        {pending ? "Обработка…" : "Добави в количката"}
      </button>

      <AddToCartToast open={toastOpen} onClose={closeToast} />
    </div>
  );
}
