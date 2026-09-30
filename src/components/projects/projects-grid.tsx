"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { FolderKanban, Search, LayoutGrid, Columns3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectsKanban } from "@/components/projects/projects-kanban";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  budget: number | null;
  currency: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  client: { id: string; name: string; company: string | null } | null;
};

type StatusFilter = "all" | "active" | "draft" | "on_hold" | "completed";
type ViewMode = "grid" | "kanban";

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const t = useTranslations("dashboard.projects");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.client?.name.toLowerCase().includes(q) ||
        p.client?.company?.toLowerCase().includes(q)
      );
    });
  }, [projects, deferredQuery, statusFilter]);

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "active", label: t("statuses.active") },
    { key: "draft", label: t("statuses.draft") },
    { key: "on_hold", label: t("statuses.on_hold") },
    { key: "completed", label: t("statuses.completed") },
  ];

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
        <div className="glass flex size-16 items-center justify-center rounded-2xl">
          <FolderKanban className="size-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("emptyDescription")}
        </p>
        <div className="mt-6">
          <NewProjectDialog />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
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

        {/* Filter (desktop) */}
        <div className="hidden items-center gap-1.5 rounded-xl glass p-1 md:flex">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                statusFilter === s.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
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
            aria-label={t("viewGrid")}
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
            aria-label={t("viewKanban")}
          >
            <Columns3 className="size-3.5" />
            <span className="hidden sm:inline">{t("viewKanban")}</span>
          </button>
        </div>

        {/* New project button */}
        <div className="md:shrink-0">
          <NewProjectDialog />
        </div>
      </div>

      {/* Mobile filter */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
        {statuses.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === s.key
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                : "glass text-muted-foreground"
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
          <p className="mt-3 text-sm text-muted-foreground">
            {t("noResults")}
          </p>
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
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <ProjectsKanban projects={filtered} />
        </div>
      )}
    </>
  );
}