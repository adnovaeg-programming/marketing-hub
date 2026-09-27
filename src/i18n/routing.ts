import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "as-needed", // العربي (الافتراضي) من غير بادئة، والإنجليزي بـ /en
});