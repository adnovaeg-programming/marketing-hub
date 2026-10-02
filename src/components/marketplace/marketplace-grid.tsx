"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Search, Sparkles, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/marketplace/listing-card";
import { CategoryFilter } from "@/components/marketplace/category-filter";

type Listing = {
  id: string;
  title: string;
  slug: string;
  description: string;
  base_price: number;
  currency: string;
  delivery_days: number;
  thumbnail_url: string | null;
  featured: boolean;
  views_count: number;
  rating_avg: number;
  rating_count: number;
  category: { id: string; name: string; name_en: string | null; slug: string } | null;
  provider: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

type Category = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
};

type SortOption = "newest" | "popular" | "price_low" | "price_high" | "rating";

export function MarketplaceGrid({
  listings,
  categories,
}: {
  listings: Listing[];
  categories: Category[];
}) {
  const t = useTranslations("marketplace.grid");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    let result = listings.filter((l) => {
      if (categoryFilter !== "all" && l.category?.id !== categoryFilter)
        return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category?.name.toLowerCase().includes(q)
      );
    });

    // Sort
    switch (sort) {
      case "popular":
        result = [...result].sort((a, b) => b.views_count - a.views_count);
        break;
      case "price_low":
        result = [...result].sort((a, b) => a.base_price - b.base_price);
        break;
      case "price_high":
        result = [...result].sort((a, b) => b.base_price - a.base_price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      default:
        // newest — already ordered
        break;
    }

    return result;
  }, [listings, deferredQuery, categoryFilter, sort]);

  const sorts: { key: SortOption; label: string }[] = [
    { key: "newest", label: t("sorts.newest") },
    { key: "popular", label: t("sorts.popular") },
    { key: "price_low", label: t("sorts.priceLow") },
    { key: "price_high", label: t("sorts.priceHigh") },
    { key: "rating", label: t("sorts.rating") },
  ];

  return (
    <>
      {/* Search + Filter Toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          className="glass rounded-xl md:hidden"
        >
          <SlidersHorizontal className="size-4" />
          {t("filters")}
        </Button>

        <div className="hidden items-center gap-1 rounded-xl glass p-1 md:flex">
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                sort === s.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sort */}
      {showFilters && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {sorts.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                sort === s.key
                  ? "bg-gradient-to-r from-primary to-accent text-white"
                  : "glass text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="mt-4">
        <CategoryFilter
          categories={categories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
          <Search className="size-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("noResults")}
          </p>
          {(query || categoryFilter !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setCategoryFilter("all");
              }}
              className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80"
            >
              <X className="size-3" />
              {t("clearFilters")}
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground">
            {t("resultsCount", { count: filtered.length })}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </>
  );
}