import { Link } from "@/i18n/navigation";
import {
  Star,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";

type Listing = {
  id: string;
  title: string;
  base_price: number;
  currency: string;
  delivery_days: number;
  thumbnail_url: string | null;
  featured: boolean;
  views_count: number;
  rating_avg: number;
  rating_count: number;
  category: { id: string; name: string } | null;
  provider: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

export function ListingCard({ listing }: { listing: Listing }) {
  const t = useTranslations("marketplace.grid");

  const providerName = listing.provider
    ? [listing.provider.first_name, listing.provider.last_name]
        .filter(Boolean)
        .join(" ") || listing.provider.email
    : "—";

  const initial = providerName.charAt(0).toUpperCase();

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="glass glass-reflect group relative block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-muted">
        {listing.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.thumbnail_url}
            alt={listing.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Sparkles className="size-10 text-primary/40" />
          </div>
        )}

        {/* Featured Badge */}
        {listing.featured && (
          <div className="absolute start-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-l from-accent to-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
            <Sparkles className="size-3" />
            {t("featured")}
          </div>
        )}

        {/* Category */}
        {listing.category && (
          <div className="absolute end-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
            {listing.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {listing.title}
        </h3>

        {/* Provider */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
            {listing.provider?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.provider.avatar_url}
                alt={providerName}
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <span className="truncate text-xs text-muted-foreground">
            {providerName}
          </span>
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
          {listing.rating_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{listing.rating_avg.toFixed(1)}</span>
              <span>({listing.rating_count})</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{listing.delivery_days}d</span>
          </div>

          <div className="flex items-center gap-1 ms-auto">
            <Eye className="size-3" />
            <span>{listing.views_count}</span>
          </div>
        </div>

        {/* Price + Arrow */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">{t("from")}</p>
            <p className="text-base font-bold text-primary" dir="ltr">
              {listing.base_price.toLocaleString()} {listing.currency}
            </p>
          </div>
          <ArrowLeft className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}