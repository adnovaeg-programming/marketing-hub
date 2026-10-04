import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const LOCALES = ["ar", "en"];

const PUBLIC_PATHS = [
  "",
  "/marketplace",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/login",
  "/register",
  "/forgot-password",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : path === "/marketplace" ? 0.9 : 0.6,
        alternates: {
          languages: {
            ar: `${SITE_URL}/ar${path}`,
            en: `${SITE_URL}/en${path}`,
          },
        },
      });
    }
  }

  return entries;
}