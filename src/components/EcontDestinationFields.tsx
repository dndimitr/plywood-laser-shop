"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import type {
  EcontCityHit,
  EcontOfficeHit,
  EcontShippingDetails,
} from "@/lib/shipping-details";

type Props = {
  value: EcontShippingDetails | null;
  onChange: (value: EcontShippingDetails | null) => void;
};

export function EcontDestinationFields({ value, onChange }: Props) {
  const kind = value?.kind ?? "office";

  return (
    <fieldset className="field">
      <legend>Доставка с Еконт</legend>
      <div className="choice-grid econt-kind-grid">
        <label className={`choice-card${kind === "office" ? " is-selected" : ""}`}>
          <input
            type="radio"
            name="econt-kind"
            value="office"
            checked={kind === "office"}
            onChange={() => {
              if (value?.kind !== "office") onChange(null);
            }}
          />
          <span className="choice-card-label">До офис</span>
          <span className="choice-card-meta">Избор от офисите на Еконт</span>
        </label>
        <label
          className={`choice-card${kind === "address" ? " is-selected" : ""}`}
        >
          <input
            type="radio"
            name="econt-kind"
            value="address"
            checked={kind === "address"}
            onChange={() =>
              onChange({
                kind: "address",
                city: value?.kind === "address" ? value.city : "",
                street: value?.kind === "address" ? value.street : "",
                num: value?.kind === "address" ? value.num : "",
                postCode: value?.kind === "address" ? value.postCode : undefined,
                cityId: value?.kind === "address" ? value.cityId : undefined,
              })
            }
          />
          <span className="choice-card-label">До адрес</span>
          <span className="choice-card-meta">Град, улица и номер</span>
        </label>
      </div>

      {kind === "office" ? (
        <OfficePicker
          selected={value?.kind === "office" ? value : null}
          onSelect={(office) =>
            onChange(
              office
                ? {
                    kind: "office",
                    officeCode: office.code,
                    officeName: office.name,
                    city: office.city,
                    postCode: office.postCode,
                  }
                : null,
            )
          }
        />
      ) : (
        <AddressFields
          value={
            value?.kind === "address"
              ? value
              : { kind: "address", city: "", street: "", num: "" }
          }
          onChange={onChange}
        />
      )}
    </fieldset>
  );
}

function OfficePicker({
  selected,
  onSelect,
}: {
  selected: Extract<EcontShippingDetails, { kind: "office" }> | null;
  onSelect: (office: EcontOfficeHit | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<EcontOfficeHit[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/econt/offices?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          offices?: EcontOfficeHit[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || "Грешка при търсене на офис");
        }
        setHits(data.offices ?? []);
        setError(null);
        setOpen(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Грешка");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  if (selected) {
    return (
      <div className="econt-selected">
        <p>
          <strong>{selected.officeName || selected.officeCode}</strong>
          {selected.city ? ` · ${selected.city}` : ""}
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            onSelect(null);
            setQuery("");
          }}
        >
          Смени офиса
        </button>
      </div>
    );
  }

  return (
    <SuggestField
      label="Офис на Еконт"
      placeholder="Търсете град или име на офис"
      query={query}
      onQueryChange={(next) => {
        setQuery(next);
        setOpen(true);
      }}
      open={open && (loading || hits.length > 0 || query.trim().length >= 2)}
      loading={loading}
      error={error}
      emptyText={
        query.trim().length >= 2 && !loading ? "Няма намерени офиси" : null
      }
      onClose={() => setOpen(false)}
    >
      {hits.map((office) => (
        <button
          key={office.code}
          type="button"
          className="suggest-item"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onSelect(office);
            setQuery("");
            setOpen(false);
          }}
        >
          <span>{office.name}</span>
          <span className="suggest-item-meta">
            {[office.city, office.address].filter(Boolean).join(" · ")}
          </span>
        </button>
      ))}
    </SuggestField>
  );
}

function AddressFields({
  value,
  onChange,
}: {
  value: Extract<EcontShippingDetails, { kind: "address" }>;
  onChange: (value: EcontShippingDetails) => void;
}) {
  const [cityQuery, setCityQuery] = useState(value.city);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<EcontCityHit[]>([]);

  useEffect(() => {
    setCityQuery(value.city);
  }, [value.city]);

  useEffect(() => {
    const q = cityQuery.trim();
    if (q.length < 2 || (value.city && q === value.city && value.cityId)) {
      setHits([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/econt/cities?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as {
          cities?: EcontCityHit[];
          error?: string;
        };
        if (!res.ok) {
          throw new Error(data.error || "Грешка при търсене на град");
        }
        setHits(data.cities ?? []);
        setError(null);
        setOpen(true);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Грешка");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [cityQuery, value.city, value.cityId]);

  return (
    <>
      <SuggestField
        label="Град"
        placeholder="Започнете да пишете града"
        query={cityQuery}
        onQueryChange={(next) => {
          setCityQuery(next);
          setOpen(true);
          onChange({
            ...value,
            city: next,
            cityId: undefined,
            postCode: undefined,
          });
        }}
        open={open && (loading || hits.length > 0 || cityQuery.trim().length >= 2)}
        loading={loading}
        error={error}
        emptyText={
          cityQuery.trim().length >= 2 && !loading ? "Няма намерен град" : null
        }
        onClose={() => setOpen(false)}
      >
        {hits.map((city) => (
          <button
            key={city.id}
            type="button"
            className="suggest-item"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setCityQuery(city.name);
              setOpen(false);
              onChange({
                ...value,
                city: city.name,
                cityId: city.id,
                postCode: city.postCode,
              });
            }}
          >
            <span>{city.name}</span>
            <span className="suggest-item-meta">
              {[city.postCode, city.regionName].filter(Boolean).join(" · ")}
            </span>
          </button>
        ))}
      </SuggestField>
      <div className="grid-2">
        <label className="field">
          <span>Улица</span>
          <input
            required
            autoComplete="address-line1"
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Номер</span>
          <input
            required
            autoComplete="off"
            value={value.num}
            onChange={(e) => onChange({ ...value, num: e.target.value })}
          />
        </label>
      </div>
    </>
  );
}

function SuggestField({
  label,
  placeholder,
  query,
  onQueryChange,
  open,
  loading,
  error,
  emptyText,
  onClose,
  children,
}: {
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (value: string) => void;
  open: boolean;
  loading: boolean;
  error: string | null;
  emptyText: string | null;
  onClose: () => void;
  children: ReactNode;
}) {
  const listId = useId();

  return (
    <label className="field suggest-wrap">
      <span>{label}</span>
      <input
        required
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onBlur={() => {
          window.setTimeout(onClose, 120);
        }}
      />
      {open ? (
        <div id={listId} className="suggest-list" role="listbox">
          {loading ? <p className="suggest-status">Търсене…</p> : null}
          {error ? <p className="suggest-status error">{error}</p> : null}
          {!loading && !error ? children : null}
          {!loading && !error && emptyText ? (
            <p className="suggest-status">{emptyText}</p>
          ) : null}
        </div>
      ) : null}
    </label>
  );
}
