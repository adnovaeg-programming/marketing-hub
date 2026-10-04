"use client";

import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("a11y");

  return (
    <a
      href="#main-content"
      className="glass-strong fixed start-4 top-4 z-[9999] -translate-y-24 rounded-xl px-4 py-2 text-sm font-medium text-foreground shadow-2xl transition-transform focus:translate-y-0"
    >
      {t("skipToContent")}
    </a>
  );
}