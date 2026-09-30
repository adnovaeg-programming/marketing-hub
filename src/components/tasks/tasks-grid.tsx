"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { CheckSquare, Search, LayoutGrid, Columns3 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TasksKanban } from "@/components/tasks/tasks-kanban";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string;
  project: { id: string; name: string } | null;
  client: { id: string; name: string } | null;
  assignee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

type StatusFilter = "all" | "todo" | "in_progress" | "review" | "completed";
type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";
type ViewMode = "grid" | "kanban";

export function TasksGrid({ tasks }: { tasks: Task[] }) {
  const t = useTranslations("dashboard.tasks");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.project?.name.toLowerCase().includes(q) ||
        task.client?.name.toLowerCase().includes(q)
      );
    });
  }, [tasks, deferredQuery, statusFilter, priorityFilter]);

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "todo", label: t("statuses.todo") },
    { key: "in_progress", label: t("statuses.in_progress") },
    { key: "review", label: t("statuses.review") },
    { key: "completed", label: t("statuses.completed") },
  ];

  const priorities: { key: PriorityFilter; label: string }[] = [
    { key: "all", label: t("filters.allPriorities") },
    { key: "urgent", label: t("priorities.urgent") },
    { key: "high", label: t("priorities.high") },
    { key: "medium", label: t("priorities.medium") },
    { key: "low", label: t("priorities.low") },
  ];

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
        <div className="glass flex size-16 items-center justify-center rounded-2xl">
          <CheckSquare className="size-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("emptyDescription")}
        </p>
        <div className="mt-6">
          <NewTaskDialog />
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

        {/* Status filter (desktop) */}
        <div className="hidden items-center gap-1 rounded-xl glass p-1 xl:flex">
          {statuses.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
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

        {/* New task */}
        <div className="lg:shrink-0">
          <NewTaskDialog />
        </div>
      </div>

      {/* Priority filter (mobile + tablet) */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {priorities.map((p) => (
          <button
            key={p.key}
            onClick={() => setPriorityFilter(p.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              priorityFilter === p.key
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                : "glass text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Results counter */}
      {(query || statusFilter !== "all" || priorityFilter !== "all") && (
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
              setPriorityFilter("all");
            }}
            className="mt-3 text-xs font-medium text-primary hover:opacity-80"
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <TasksKanban tasks={filtered} />
        </div>
      )}
    </>
  );
}