import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  Clock,
  RotateCcw,
  Eye,
  Check,
  MessageCircle,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link as I18nLink } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { RequestServiceButton } from "@/components/marketplace/request-service-button";

export default async function ListingDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("service_listings")
    .select(
      `
      *,
      category:service_categories (id, name, name_en, slug),
      provider:profiles!service_listings_provider_id_fkey (
        id, first_name, last_name, email, avatar_url
      ),
      packages:service_listing_packages (*)
    `
    )
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (!listing) notFound();

  const category = Array.isArray(listing.category)
    ? listing.category[0]
    : listing.category;
  const provider = Array.isArray(listing.provider)
    ? listing.provider[0]
    : listing.provider;
  const packages = (listing.packages ?? []) as {
    id: string;
    tier: string;
    name: string;
    description: string | null;
    price: number;
    delivery_days: number;
    revisions: number;
    features: string[];
  }[];

  const t = await getTranslations("marketplace.details");

  const providerName = provider
    ? [provider.first_name, provider.last_name].filter(Boolean).join(" ") ||
      provider.email
    : "—";
  const initial = providerName.charAt(0).toUpperCase();

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <I18nLink
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {t("back")}
      </I18nLink>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        {/* Left — Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {category.name}
                </span>
              )}
              {listing.featured && (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-l from-accent to-primary px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="size-3" />
                  {t("featured")}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {listing.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {listing.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">
                    {listing.rating_avg.toFixed(1)}
                  </span>
                  <span>({listing.rating_count})</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>
                  {t("deliveryIn", { days: listing.delivery_days })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="size-4" />
                <span>{t("views", { count: listing.views_count })}</span>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-muted">
              {listing.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.thumbnail_url}
                  alt={listing.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Sparkles className="size-16 text-primary/40" />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="glass-strong rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-semibold">{t("aboutService")}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>

            {/* Tags */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {listing.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Packages */}
          {packages.length > 0 && (
            <div className="glass-strong rounded-3xl p-6 md:p-8">
              <h2 className="text-lg font-semibold">{t("packages")}</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {packages
                  .sort((a, b) => {
                    const order = { basic: 1, standard: 2, premium: 3 };
                    return (
                      (order[a.tier as keyof typeof order] ?? 0) -
                      (order[b.tier as keyof typeof order] ?? 0)
                    );
                  })
                  .map((pkg) => {
                    const isStandard = pkg.tier === "standard";
                    return (
                      <div
                        key={pkg.id}
                        className={`relative rounded-2xl border p-5 transition ${
                          isStandard
                            ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                            : "glass border-border/40"
                        }`}
                      >
                        {isStandard && (
                          <span className="absolute -top-3 right-1/2 translate-x-1/2 rounded-full bg-gradient-to-l from-primary to-accent px-3 py-1 text-[10px] font-bold text-white">
                            {t("popular")}
                          </span>
                        )}

                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                          {pkg.name}
                        </h3>

                        {pkg.description && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {pkg.description}
                          </p>
                        )}

                        <p className="mt-4 text-2xl font-bold" dir="ltr">
                          {pkg.price.toLocaleString()} {listing.currency}
                        </p>

                        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            <span>
                              {t("deliveryDays", { days: pkg.delivery_days })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RotateCcw className="size-3.5" />
                            <span>
                              {t("revisions", { count: pkg.revisions })}
                            </span>
                          </div>
                        </div>

                        {pkg.features && pkg.features.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {pkg.features.map((f, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                                  <Check className="size-2.5" />
                                </span>
                                <span className="text-muted-foreground">
                                  {f}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Right — Sidebar */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24 lg:h-fit">
          {/* Provider Card */}
          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent text-base font-bold text-white shadow-lg shadow-primary/30">
                {provider?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={provider.avatar_url}
                    alt={providerName}
                    className="size-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {t("provider")}
                </p>
                <p className="truncate font-semibold">{providerName}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="glass mt-4 w-full rounded-xl"
            >
              <MessageCircle className="size-4" />
              {t("contactProvider")}
            </Button>
          </div>

          {/* CTA Card */}
          <div className="glass-strong rounded-3xl p-6">
            <p className="text-xs text-muted-foreground">{t("startingFrom")}</p>
            <p className="mt-1 text-3xl font-bold text-primary" dir="ltr">
              {listing.base_price.toLocaleString()} {listing.currency}
            </p>

            <RequestServiceButton
              listingId={listing.id}
              basePrice={listing.base_price}
              currency={listing.currency}
              packages={packages}
            />

            <Button
              variant="outline"
              className="glass mt-2 w-full rounded-xl"
            >
              <MessageCircle className="size-4" />
              {t("sendMessage")}
            </Button>

            <div className="mt-6 space-y-3 border-t border-border/40 pt-6 text-xs">
              <div className="flex items-start gap-2">
                <Briefcase className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">{t("trust1.title")}</p>
                  <p className="text-muted-foreground">
                    {t("trust1.description")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium">{t("trust2.title")}</p>
                  <p className="text-muted-foreground">
                    {t("trust2.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}