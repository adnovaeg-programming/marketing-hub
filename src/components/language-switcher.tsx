"use client";

import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const nextLocale = locale === "ar" ? "en" : "ar";

  const toggle = () => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-10 rounded-full"
      onClick={toggle}
      disabled={pending}
      aria-label={`Switch to ${nextLocale === "ar" ? "العربية" : "English"}`}
    >
      <Globe className="size-5" />
      <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
        {locale === "ar" ? "AR" : "EN"}
      </span>
    </Button>
  );
}