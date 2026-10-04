import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const BASE_METADATA = {
  name: "Marketing Hub",
  nameAr: "منصة التسويق الموحدة",
  description:
    "منصة مركزية لإدارة التسويق، المحتوى، الفريق، والعملاء — كل حاجة في مكان واحد.",
  descriptionEn:
    "A unified marketing platform to manage content, team, clients, and campaigns — everything in one place.",
  keywords: [
    "تسويق",
    "إدارة التسويق",
    "منصة تسويق",
    "سوشيال ميديا",
    "محتوى",
    "marketing platform",
    "marketing hub",
    "SaaS",
    "agency",
  ],
  siteUrl: SITE_URL,
};

export function buildMetadata({
  title,
  description,
  path = "",
  locale = "ar",
  image,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  locale?: "ar" | "en";
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const finalTitle = title
    ? `${title} | ${BASE_METADATA.name}`
    : `${BASE_METADATA.name} | منصة موحدة لإدارة التسويق`;

  const finalDescription =
    description ??
    (locale === "ar"
      ? BASE_METADATA.description
      : BASE_METADATA.descriptionEn);

  const url = `${SITE_URL}/${locale}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-image.png`;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: BASE_METADATA.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        ar: `${SITE_URL}/ar${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      url,
      siteName: BASE_METADATA.name,
      title: finalTitle,
      description: finalDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}