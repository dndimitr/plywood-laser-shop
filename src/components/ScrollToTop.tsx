"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "@/components/Icons";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 420);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-to-top${visible ? " is-visible" : ""}`}
      aria-label="Към началото на страницата"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <IconArrowUp size={22} aria-hidden />
    </button>
  );
}
