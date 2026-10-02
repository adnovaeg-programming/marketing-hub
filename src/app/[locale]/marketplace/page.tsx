import { getTranslations, setRequestLocale } from "next-intl/server";
import { Sparkles, Briefcase, Users, TrendingUp } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { MarketplaceGrid } from "@/components/marketplace/marketplace-grid";

export default async function MarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const [{ data: categories }, { data: listings }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name, name_en, slug, icon")
      .eq("is_active", true)
      .order("order_index"),

    supabase
      .from("service_listings")
      .select(
        `
        id, title, slug, description, base_price, currency,
        delivery_days, thumbnail_url, featured, views_count,
        rating_avg, rating_count,
        category:service_categories (id, name, name_en, slug),
        provider:profiles!service_listings_provider_id_fkey (
          id, first_name, last_name, email, avatar_url
        )
      `
      )
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60),
  ]);

  const t = await getTranslations("marketplace.page");

  const normalized = (listings ?? []).map((l) => ({
    ...l,
    category: Array.isArray(l.category) ? l.category[0] ?? null : l.category,
    provider: Array.isArray(l.provider) ? l.provider[0] ?? null : l.provider,
  }));

  const totalListings = normalized.length;
  const featuredCount = normalized.filter((l) => l.featured).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      {/* Hero */}
      <section className="glass-strong relative overflow-hidden rounded-[2.5rem] p-8 md:p-16">
        <div className="pointer-events-none absolute -right-32 -top-32 size-96 animate-glow-pulse rounded-full bg-primary/20 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-32 -left-32 size-96 animate-glow-pulse rounded-full bg-accent/15 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div className="subtle-grid pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" />

        <div className="relative">
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            {t("title")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Briefcase className="size-4 text-primary" />
              </div>
              <div>
                <p className="font-bold">{totalListings}</p>
                <p className="text-xs text-muted-foreground">
                  {t("stats.services")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
                <TrendingUp className="size-4 text-accent" />
              </div>
              <div>
                <p className="font-bold">{featuredCount}</p>
                <p className="text-xs text-muted-foreground">
                  {t("stats.featured")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Users className="size-4 text-primary" />
              </div>
              <div>
                <p className="font-bold">{categories?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {t("stats.categories")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="mt-12">
        <MarketplaceGrid
          listings={normalized}
          categories={categories ?? []}
        />
      </div>
    </main>
  );
}