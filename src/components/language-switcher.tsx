"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { usePathname } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname(); // ملاحظة: next-intl بيرجع المسار بدون locale prefix

  const nextLocale = locale === "ar" ? "en" : "ar";

  const toggle = () => {
    // نبني المسار الجديد بـ prefix اللغة الجديدة
    const newPath =
      pathname === "/" || pathname === ""
        ? `/${nextLocale}`
        : `/${nextLocale}${pathname}`;

    // ⚡ Hard navigation — مضمون 100% وبيضمن RSC payload جديد
    window.location.href = newPath;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-10 rounded-full"
      onClick={toggle}
      aria-label={`Switch to ${nextLocale === "ar" ? "العربية" : "English"}`}
    >
      <Globe className="size-5" />
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
        {locale === "ar" ? "AR" : "EN"}
      </span>
    </Button>
  );
}