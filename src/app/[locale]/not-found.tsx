import { Sparkles, Home, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-20">
      <div className="glass-strong mx-auto max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <Sparkles className="size-10 text-white" />
        </div>

        <h1 className="mt-6 text-7xl font-bold tracking-tight">
          <span className="text-gradient">404</span>
        </h1>

        <h2 className="mt-3 text-2xl font-bold">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
          >
            <Home className="size-4" />
            {t("home")}
          </Link>

          <Link
            href="/marketplace"
            className="glass glass-hover inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all"
          >
            <Search className="size-4" />
            {t("browseMarketplace")}
          </Link>
        </div>
      </div>
    </main>
  );
}