"use client";

import { useEffect, useState } from "react";

export function LocaleSwitch() {
  const [locale, setLocale] = useState<"bg" | "en">("bg");

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((c) => c.startsWith("pls_locale="))
      ?.split("=")[1];
    if (saved === "en" || saved === "bg") setLocale(saved);
  }, []);

  function choose(next: "bg" | "en") {
    setLocale(next);
    document.cookie = `pls_locale=${next}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <div style={{ display: "inline-flex", gap: "0.25rem" }}>
      <button
        type="button"
        className="btn btn-ghost"
        style={{
          padding: "0.35rem 0.55rem",
          minHeight: 36,
          opacity: locale === "bg" ? 1 : 0.55,
        }}
        onClick={() => choose("bg")}
      >
        BG
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        style={{
          padding: "0.35rem 0.55rem",
          minHeight: 36,
          opacity: locale === "en" ? 1 : 0.55,
        }}
        onClick={() => choose("en")}
      >
        EN
      </button>
    </div>
  );
}
