"use client";

import { useTranslations } from "next-intl";

type Category = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
};

export function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("marketplace.grid");

  const allCats = [{ id: "all", name: t("allCategories"), name_en: null, slug: "all" }, ...categories];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {allCats.map((cat) => {
        const isActive = value === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
              isActive
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}