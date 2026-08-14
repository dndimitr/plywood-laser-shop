"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatBgn } from "@/lib/pricing";
import { complexityLabel } from "@/lib/labels";
import { PRODUCTION_LEAD, productionLeadHelp } from "@/lib/shop-config";

export function CustomUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [widthCm, setWidthCm] = useState(20);
  const [heightCm, setHeightCm] = useState(20);
  const [thicknessMm, setThicknessMm] = useState(4);
  const [complexity, setComplexity] = useState("medium");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rush, setRush] = useState(false);
  const [doubleSided, setDoubleSided] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            rush,
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
  }, [widthCm, heightCm, thicknessMm, complexity, quantity, rush, doubleSided]);

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
          rush,
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

      router.push("/cart");
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
            max={200}
            value={widthCm}
            onChange={(e) => setWidthCm(Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>Височина (см)</span>
          <input
            type="number"
            min={1}
            max={200}
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
          />
        </label>
      </div>

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
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
        />
      </label>

      <label className="radio">
        <input
          type="checkbox"
          checked={doubleSided}
          onChange={(e) => setDoubleSided(e.target.checked)}
        />
        Двустранна обработка
      </label>
      <div className="rush-option">
        <label className="radio">
          <input
            type="checkbox"
            checked={rush}
            onChange={(e) => setRush(e.target.checked)}
          />
          Ускорена изработка (+{PRODUCTION_LEAD.rushSurchargePercent}%) —{" "}
          {PRODUCTION_LEAD.rushLabel}
        </label>
        <p className="muted rush-hint">{productionLeadHelp(rush)}</p>
      </div>

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
    </div>
  );
}
