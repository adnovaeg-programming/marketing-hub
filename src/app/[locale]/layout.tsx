import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalNavbar } from "@/components/conditional-navbar";
import { BackgroundLayer } from "@/components/background-layer";
import { CursorSpotlight } from "@/components/fx/cursor-spotlight";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

import "../globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marketing Hub | منصة موحدة لإدارة التسويق",
  description:
    "منصة مركزية لإدارة التسويق، المحتوى، والفريق، والعملاء — كل حاجة في مكان واحد.",
};

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

  // ✅ مهم جدًا: setRequestLocale قبل getMessages
  setRequestLocale(locale);

  // ✅ getMessages بدون args
  const messages = await getMessages();
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
            <BackgroundLayer />
            <ConditionalNavbar
              user={user ? { email: user.email ?? "" } : null}
            />
            {children}
            <CookieBanner />
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}