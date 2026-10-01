import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { hasLocale } from "next-intl";

import { routing } from "./routing";
import arMessages from "../../messages/ar.json";
import enMessages from "../../messages/en.json";

export default getRequestConfig(async ({ requestLocale }) => {
  // المحاولة الأولى: من next-intl (setRequestLocale)
  let locale = await requestLocale;

  // المحاولة التانية: من URL (fallback قوي)
  if (!locale || !hasLocale(routing.locales, locale)) {
    try {
      const headersList = await headers();
      const pathname =
        headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";
      const match = pathname.match(/^\/(ar|en)(\/|$)/);
      if (match && hasLocale(routing.locales, match[1])) {
        locale = match[1];
      }
    } catch {
      // headers غير متاحة
    }
  }

  // Fallback نهائي
  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: locale === "en" ? enMessages : arMessages,
  };
});