"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

export function CommandHint() {
  const t = useTranslations("dashboard.commandPalette");
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toLowerCase().includes("mac");

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="glass glass-hover flex h-9 w-full max-w-xs items-center gap-2 rounded-xl px-3 text-sm text-muted-foreground transition"
      aria-label={t("openHint")}
    >
      <Search className="size-3.5 shrink-0" />
      <span className="hidden flex-1 truncate text-start sm:inline">
        {t("placeholder")}
      </span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        {isMac ? "⌘ K" : "Ctrl K"}
      </kbd>
    </button>
  );
}