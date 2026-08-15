"use client";

import { useState } from "react";
import type { MarketingSettings } from "@/lib/shop-settings";

type Props = { initial: MarketingSettings };

export function MarketingSettingsForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function setField<K extends keyof MarketingSettings>(
    key: K,
    value: MarketingSettings[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : data.error?.formErrors?.[0] ||
              Object.values(data.error?.fieldErrors ?? {})
                .flat()
                .join(" ") ||
              "Грешка при запис";
        throw new Error(String(msg));
      }
      setForm(data);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-card marketing-form" onSubmit={save}>
      <h2 className="marketing-form-heading">Google</h2>
      <label className="field">
        <span>Google Analytics 4 (G-…)</span>
        <input
          type="text"
          placeholder="G-XXXXXXXXXX"
          value={form.gaMeasurementId}
          onChange={(e) => setField("gaMeasurementId", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Google Ads (AW-…)</span>
        <input
          type="text"
          placeholder="AW-XXXXXXXXXX"
          value={form.googleAdsId}
          onChange={(e) => setField("googleAdsId", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Google Ads conversion label</span>
        <input
          type="text"
          placeholder="AbCdEfGhIjKlMnOp"
          value={form.googleAdsConversionLabel}
          onChange={(e) => setField("googleAdsConversionLabel", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Google Tag Manager (GTM-…) — по желание вместо директни GA/Ads</span>
        <input
          type="text"
          placeholder="GTM-XXXXXXX"
          value={form.gtmId}
          onChange={(e) => setField("gtmId", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Google Search Console verification</span>
        <input
          type="text"
          placeholder="токен от HTML tag"
          value={form.googleSiteVerification}
          onChange={(e) => setField("googleSiteVerification", e.target.value)}
          autoComplete="off"
        />
      </label>

      <h2 className="marketing-form-heading">Meta (Facebook)</h2>
      <label className="field">
        <span>Meta Pixel ID</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="123456789012345"
          value={form.metaPixelId}
          onChange={(e) => setField("metaPixelId", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>Meta CAPI access token (server-side, iOS 14+)</span>
        <input
          type="password"
          placeholder="EAA… или оставете маскираната стойност"
          value={form.metaCapiAccessToken}
          onChange={(e) => setField("metaCapiAccessToken", e.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label className="field">
        <span>Meta CAPI test event code (по желание)</span>
        <input
          type="text"
          placeholder="TEST12345"
          value={form.metaCapiTestEventCode}
          onChange={(e) => setField("metaCapiTestEventCode", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field">
        <span>URL на Facebook страницата</span>
        <input
          type="url"
          placeholder="https://www.facebook.com/your-page"
          value={form.facebookPageUrl}
          onChange={(e) => setField("facebookPageUrl", e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className="field checkbox-field">
        <input
          type="checkbox"
          checked={form.facebookShareEnabled}
          onChange={(e) => setField("facebookShareEnabled", e.target.checked)}
        />
        <span>
          Показвай „Сподели във Facebook“ на продуктовите страници — споделя
          линка към продукта (Web Share на мобилен + бутон „Копирай линка“)
        </span>
      </label>

      <p className="muted marketing-form-hint">
        Pixel + Conversions API (CAPI) с общ event_id за дедупликация —
        задължително при iOS 14+ attribution loss. Събития: PageView,
        ViewContent, AddToCart, InitiateCheckout, Purchase. UTM параметрите се
        записват за GA4 cross-check. Маркетинговите скриптове се зареждат само
        след съгласие за бисквитки. Маскираният CAPI токен се запазва при
        запис; празно поле го изчиства. Env: META_CAPI_ACCESS_TOKEN. В админ
        списъка с продукти „FB линк“ отваря Facebook sharer с URL на продукта.
      </p>

      {error ? <p className="error">{error}</p> : null}
      {saved ? <p className="success-text">Запазено.</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Запис…" : "Запази маркетинг настройки"}
      </button>
    </form>
  );
}
