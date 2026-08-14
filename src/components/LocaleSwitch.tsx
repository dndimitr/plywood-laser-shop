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
    <div className="locale-switch" role="group" aria-label="Език">
      <button
        type="button"
        className={`locale-btn${locale === "bg" ? " is-active" : ""}`}
        onClick={() => choose("bg")}
      >
        BG
      </button>
      <button
        type="button"
        className={`locale-btn${locale === "en" ? " is-active" : ""}`}
        onClick={() => choose("en")}
      >
        EN
      </button>
    </div>
  );
}
