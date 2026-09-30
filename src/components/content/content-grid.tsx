"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  Search,
  LayoutGrid,
  Columns3,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewContentDialog } from "@/components/content/new-content-dialog";
import { ContentCard } from "@/components/content/content-card";
import { ContentKanban } from "@/components/content/content-kanban";

type ContentItem = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  platform: string | null;
  status: string;
  priority: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  client: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
};

type StatusFilter =
  | "all"
  | "draft"
  | "internal_review"
  | "client_review"
  | "approved"
  | "scheduled"
  | "published";

type ViewMode = "grid" | "kanban";

export function ContentGrid({ items }: { items: ContentItem[] }) {
  const t = useTranslations("dashboard.content");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.client?.name.toLowerCase().includes(q) ||
        item.project?.name.toLowerCase().includes(q)
      );
    });
  }, [items, deferredQuery, statusFilter]);

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "draft", label: t("statuses.draft") },
    { key: "internal_review", label: t("statuses.internal_review") },
    { key: "client_review", label: t("statuses.client_review") },
    { key: "approved", label: t("statuses.approved") },
    { key: "scheduled", label: t("statuses.scheduled") },
    { key: "published", label: t("statuses.published") },
  ];

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
        <div className="glass flex size-16 items-center justify-center rounded-2xl">
          <FileText className="size-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("emptyDescription")}
        </p>
        <div className="mt-6">
          <NewContentDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        {/* View toggle */}
        <div className="glass flex items-center gap-1 rounded-xl p-1">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              view === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">{t("viewGrid")}</span>
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              view === "kanban"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Columns3 className="size-3.5" />
            <span className="hidden sm:inline">{t("viewKanban")}</span>
          </button>
        </div>

        {/* Calendar link */}
        <Button variant="outline" className="glass rounded-xl" asChild>
          <Link href="/dashboard/content/calendar">
            <Calendar className="size-4" />
            {t("viewCalendar")}
          </Link>
        </Button>

        {/* New content */}
        <div className="lg:shrink-0">
          <NewContentDialog />
        </div>
      </div>

      {/* Status filter */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === s.key
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Results counter */}
      {(query || statusFilter !== "all") && (
        <p className="mt-4 text-xs text-muted-foreground">
          {t("resultsCount", { count: filtered.length })}
        </p>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noResults")}</p>
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("all");
            }}
            className="mt-3 text-xs font-medium text-primary hover:opacity-80"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <ContentKanban items={filtered} />
        </div>
      )}
    </>
  );
}