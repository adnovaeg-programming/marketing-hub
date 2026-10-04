import type { Metadata, Viewport } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { BackgroundLayer } from "@/components/background-layer";
import { CursorSpotlight } from "@/components/fx/cursor-spotlight";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { Toaster } from "@/components/ui/sonner";
import { SkipLink } from "@/components/a11y/skip-link";
import { createClient } from "@/lib/supabase/server";
import { buildMetadata, BASE_METADATA } from "@/lib/seo/metadata";
import arMessages from "../../../messages/ar.json";
import enMessages from "../../../messages/en.json";

import "../globals.css";

const ALL_MESSAGES = {
  ar: arMessages,
  en: enMessages,
} as const;

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3e8ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0724" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = locale === "en" ? "en" : "ar";

  return {
    ...buildMetadata({ locale: safeLocale }),
    title: {
      default: `${BASE_METADATA.name} | منصة موحدة لإدارة التسويق`,
      template: `%s | ${BASE_METADATA.name}`,
    },
    applicationName: BASE_METADATA.name,
    authors: [{ name: BASE_METADATA.name }],
    creator: BASE_METADATA.name,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/favicon.ico" }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = ALL_MESSAGES[locale as keyof typeof ALL_MESSAGES];
  const dir = locale === "ar" ? "rtl" : "ltr";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CursorSpotlight />

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SkipLink />

            <BackgroundLayer />
            <ConditionalNavbar user={user ? { email: user.email ?? "" } : null} />

            <div id="main-content" className="flex flex-1 flex-col">
              {children}
            </div>

            <CookieBanner />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}