"use client";

import { useState } from "react";
import type { MarketingSettings } from "@/lib/shop-settings";

type DatasetQualityMatchKey = {
  identifier: string;
  coveragePercentage?: number;
};

type DatasetQualityEvent = {
  eventName: string;
  compositeScore?: number;
  matchKeys: DatasetQualityMatchKey[];
  eventCoveragePercentage?: number;
  eventCoverageGoalPercentage?: number;
  dataFreshness?: string;
};

type Props = { initial: MarketingSettings };

export function MarketingSettingsForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dqPending, setDqPending] = useState(false);
  const [dqError, setDqError] = useState<string | null>(null);
  const [dqEvents, setDqEvents] = useState<DatasetQualityEvent[] | null>(null);
  const [dqPixelId, setDqPixelId] = useState<string | null>(null);

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

  async function loadDatasetQuality() {
    setDqPending(true);
    setDqError(null);
    try {
      const res = await fetch("/api/admin/marketing/dataset-quality", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Неуспешно зареждане на Dataset Quality",
        );
      }
      setDqPixelId(
        typeof data.pixelId === "string" ? data.pixelId : form.metaPixelId,
      );
      setDqEvents(Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      setDqEvents(null);
      setDqError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setDqPending(false);
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
          Показвай „Сподели във Facebook“ на продуктовите страници (за пост в
          страницата през Facebook sharer)
        </span>
      </label>

      <p className="muted marketing-form-hint">
        Pixel + Conversions API (CAPI) с общ event_id за дедупликация —
        задължително при iOS 14+ attribution loss. Събития: PageView,
        ViewContent, AddToCart, InitiateCheckout, Purchase. Токенът от Events
        Manager с Dataset Quality API дава и CAPI, и метрики (EMQ). UTM
        параметрите се записват за GA4 cross-check. Маркетинговите скриптове се
        зареждат само след съгласие за бисквитки. Маскираният CAPI токен се
        запазва при запис; празно поле го изчиства. Env: META_CAPI_ACCESS_TOKEN
        (задължителен на Vercel — файлът shop-settings не се пази между
        serverless инстанции).
      </p>
      <p className="muted marketing-form-hint">
        Meta Commerce Manager product feed (активни продукти):{" "}
        <code>/feeds/facebook-catalog.xml</code> — scheduled fetch в Commerce
        Manager (алтернатива: <code>/feeds/facebook-catalog.csv</code>).
      </p>

      {error ? <p className="error">{error}</p> : null}
      {saved ? <p className="success-text">Запазено.</p> : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Запис…" : "Запази маркетинг настройки"}
      </button>

      <h2 className="marketing-form-heading">Dataset Quality (EMQ)</h2>
      <p className="muted marketing-form-hint">
        Event Match Quality и покритие на събитията от Meta Dataset Quality API.
        Оценките се появяват след достатъчно CAPI трафик с match keys (email,
        телефон, IP, UA, fbp/fbc).
      </p>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={dqPending}
        onClick={() => void loadDatasetQuality()}
      >
        {dqPending ? "Зареждане…" : "Провери качеството на данните"}
      </button>
      {dqError ? <p className="error">{dqError}</p> : null}
      {dqEvents ? (
        <div className="dataset-quality-panel">
          {dqPixelId ? (
            <p className="muted">
              Pixel / dataset: <code>{dqPixelId}</code>
            </p>
          ) : null}
          {dqEvents.length === 0 ? (
            <p className="muted">
              Все още няма web събития в Dataset Quality. Изпратете CAPI
              събития и опитайте отново след няколко часа.
            </p>
          ) : (
            <table className="dataset-quality-table">
              <thead>
                <tr>
                  <th>Събитие</th>
                  <th>EMQ</th>
                  <th>Покритие</th>
                  <th>Свежест</th>
                  <th>Match keys</th>
                </tr>
              </thead>
              <tbody>
                {dqEvents.map((ev) => (
                  <tr key={ev.eventName}>
                    <td>{ev.eventName}</td>
                    <td>
                      {ev.compositeScore != null
                        ? `${ev.compositeScore.toFixed(1)} / 10`
                        : "—"}
                    </td>
                    <td>
                      {ev.eventCoveragePercentage != null
                        ? `${ev.eventCoveragePercentage.toFixed(1)}%${
                            ev.eventCoverageGoalPercentage != null
                              ? ` (цел ${ev.eventCoverageGoalPercentage}%)`
                              : ""
                          }`
                        : "—"}
                    </td>
                    <td>{ev.dataFreshness ?? "—"}</td>
                    <td>
                      {ev.matchKeys.length === 0
                        ? "—"
                        : ev.matchKeys
                            .map((mk) =>
                              mk.coveragePercentage != null
                                ? `${mk.identifier} ${mk.coveragePercentage.toFixed(0)}%`
                                : mk.identifier,
                            )
                            .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </form>
  );
}
