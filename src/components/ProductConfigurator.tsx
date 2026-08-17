"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCart } from "@/components/Icons";
import { calculateTemplatePrice, formatBgn } from "@/lib/pricing";
import { laserTypeLabel } from "@/lib/labels";
import { trackAddToCart } from "@/lib/tracking-client";

type Option = {
  id: string;
  label: string;
  sizeLabel: string;
  thicknessMm: number;
  laserType: string;
  priceModifier: number | string;
  material?: string;
  finish?: string;
  doubleSided?: boolean;
  materialLabel?: string;
  finishLabel?: string;
};

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
  basePrice: number;
  options: Option[];
  gaMeasurementId?: string | null;
};

const QTY_TIERS = [
  { minQty: 5, percentOff: 5 },
  { minQty: 10, percentOff: 10 },
  { minQty: 25, percentOff: 15 },
] as const;

export function ProductConfigurator({
  productId,
  productSlug,
  productName,
  basePrice,
  options,
  gaMeasurementId,
}: Props) {
  const router = useRouter();
  const [optionId, setOptionId] = useState(options[0]?.id ?? "");
  const [engravingText, setEngravingText] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rush, setRush] = useState(false);
  const [pending, setPending] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.id === optionId) ?? options[0],
    [optionId, options],
  );

  const lineTotal = selected
    ? calculateTemplatePrice(
        basePrice,
        Number(selected.priceModifier),
        quantity,
        {
          rush,
          rushMultiplier: 1.5,
          doubleSided: Boolean(selected.doubleSided),
          quantityDiscounts: QTY_TIERS.map((t) => ({ ...t })),
        },
      )
    : basePrice;

  const activeTier = [...QTY_TIERS].reverse().find((t) => quantity >= t.minQty);

  async function addToCart() {
    setPending(true);
    setError(null);
    setAdded(false);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_template",
          productId,
          optionId: selected?.id,
          engravingText,
          quantity,
          rush,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const err = data?.error;
        const message =
          (typeof err === "string" && err) ||
          err?.formErrors?.[0] ||
          err?.fieldErrors?.optionId?.[0] ||
          err?.fieldErrors?.productId?.[0] ||
          "Грешка при добавяне";
        throw new Error(message);
      }
      void trackAddToCart({
        contentId: productSlug || productId,
        contentName: productName,
        value: lineTotal,
        quantity,
        gaId: gaMeasurementId,
      });
      setAdded(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  if (!selected) {
    return <p>Няма налични опции за този продукт.</p>;
  }

  const addLabel = pending ? "Добавяне…" : added ? "Добавено" : "Добави в количката";
  const addMobileLabel = pending ? "…" : added ? "Добавено" : "Добави";

  return (
    <>
      <div className="configurator">
        <h2>Конфигурация</h2>
        <p className="muted configurator-product-name">{productName}</p>

        <fieldset className="field">
          <legend>Вариант</legend>
          <div className="option-tiles" role="radiogroup" aria-label="Вариант на продукта">
            {options.map((o) => {
              const isSelected = o.id === optionId;
              return (
                <label
                  key={o.id}
                  className={`option-tile${isSelected ? " is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="product-option"
                    value={o.id}
                    checked={isSelected}
                    onChange={() => setOptionId(o.id)}
                  />
                  <span className="option-tile-label">{o.label}</span>
                  <span className="option-tile-meta">
                    {o.sizeLabel} · {o.thicknessMm} мм
                  </span>
                  <span className="option-tile-price">
                    +{formatBgn(Number(o.priceModifier))}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="option-meta" aria-live="polite">
          <span>Размер: {selected.sizeLabel}</span>
          <span>Дебелина: {selected.thicknessMm} мм</span>
          <span>{laserTypeLabel[selected.laserType] ?? selected.laserType}</span>
          <span>Материал: {selected.materialLabel ?? selected.material}</span>
          <span>Финиш: {selected.finishLabel ?? selected.finish}</span>
          {selected.doubleSided ? <span>Двустранно</span> : null}
        </div>

        <label className="field">
          <span>Текст за гравиране</span>
          <input
            value={engravingText}
            onChange={(e) => setEngravingText(e.target.value)}
            placeholder="Име, инициали, кратко послание…"
            maxLength={200}
          />
        </label>

        <div className="field">
          <span>Количество</span>
          <div className="qty-control">
            <button
              type="button"
              aria-label="Намали количество"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))
              }
              aria-label="Количество"
            />
            <button
              type="button"
              aria-label="Увеличи количество"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            >
              +
            </button>
          </div>
          <div className="qty-tiers" aria-label="Отстъпки за количество">
            {QTY_TIERS.map((tier) => (
              <span
                key={tier.minQty}
                className={`qty-tier${quantity >= tier.minQty ? " is-on" : ""}`}
              >
                {tier.minQty}+ бр. −{tier.percentOff}%
              </span>
            ))}
          </div>
          {activeTier ? (
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Приложена отстъпка −{activeTier.percentOff}%
            </span>
          ) : null}
        </div>

        <label className="radio">
          <input
            type="checkbox"
            checked={rush}
            onChange={(e) => setRush(e.target.checked)}
          />
          Ускорена изработка (+50%)
        </label>

        <p className="price-line desktop-price-line" aria-live="polite">
          Цена: <strong>{formatBgn(lineTotal)}</strong>
        </p>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}

        {added ? (
          <p className="cart-toast" role="status">
            Добавено в количката.{" "}
            <Link href="/cart">Към количката</Link>
          </p>
        ) : null}

        <button
          type="button"
          className="btn btn-primary configurator-submit"
          disabled={pending}
          onClick={addToCart}
        >
          <IconCart size={18} aria-hidden />
          {addLabel}
        </button>
      </div>

      <div className="product-mobile-cta" aria-label="Добавяне в количката">
        {error ? (
          <p className="error product-mobile-cta-error" role="alert">
            {error}
          </p>
        ) : null}
        {added ? (
          <p className="cart-toast product-mobile-cta-error" role="status">
            Добавено. <Link href="/cart">Количка</Link>
          </p>
        ) : null}
        <div className="product-mobile-cta-row">
          <div className="product-mobile-cta-price">
            <span className="muted">Общо</span>
            <strong>{formatBgn(lineTotal)}</strong>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={addToCart}
          >
            <IconCart size={18} aria-hidden />
            {addMobileLabel}
          </button>
        </div>
      </div>
    </>
  );
}
