"use client";

import { Link } from "@/i18n/navigation";
import { Calendar, User, FolderKanban, ArrowLeft, Check } from "lucide-react";
import { useTranslations } from "next-intl";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project: { id: string; name: string } | null;
  assignee: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

export function TaskCard({
  task,
  selected = false,
  onToggleSelect,
  showSelect = false,
}: {
  task: Task;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  showSelect?: boolean;
}) {
  const t = useTranslations("dashboard.tasks");

  const statusStyles: Record<string, string> = {
    todo: "bg-muted text-muted-foreground border-border/40",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-muted text-muted-foreground border-border/40",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const assigneeName = task.assignee
    ? [task.assignee.first_name, task.assignee.last_name]
        .filter(Boolean)
        .join(" ") || task.assignee.email
    : null;

  const assigneeInitial = assigneeName
    ? assigneeName.charAt(0).toUpperCase()
    : null;

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : null;

  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    task.status !== "cancelled" &&
    new Date(task.due_date) < new Date();

  return (
    <div className="relative">
      {/* Selection Checkbox */}
      {showSelect && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSelect?.(task.id);
          }}
          className={`absolute end-3 top-3 z-10 flex size-6 items-center justify-center rounded-full border-2 transition-all ${
            selected
              ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
              : "border-border/60 bg-background/80 backdrop-blur hover:border-primary"
          }`}
          aria-label="select"
        >
          {selected && <Check className="size-3.5" />}
        </button>
      )}

      <Link
        href={`/dashboard/tasks/${task.id}`}
        className={`glass glass-reflect group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${
          selected ? "ring-2 ring-primary/60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                statusStyles[task.status] ?? statusStyles.todo
              }`}
            >
              {t(`statuses.${task.status}`)}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                priorityStyles[task.priority] ?? priorityStyles.medium
              }`}
            >
              {t(`priorities.${task.priority}`)}
            </span>
          </div>

          <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-semibold">
          {task.title}
        </h3>

        <div className="mt-4 space-y-2 border-t border-border/40 pt-4 text-xs">
          {task.project && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderKanban className="size-3.5 shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </div>
          )}

          {assigneeName && assigneeInitial && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[8px] font-bold text-white">
                {assigneeInitial}
              </div>
              <span className="truncate">{assigneeName}</span>
            </div>
          )}

          {dueDate && (
            <div
              className={`flex items-center gap-2 ${
                isOverdue ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <Calendar className="size-3.5 shrink-0" />
              <span dir="ltr">{dueDate}</span>
              {isOverdue && (
                <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium">
                  {t("overdue")}
                </span>
              )}
            </div>
          )}

          {!task.project && !assigneeName && !dueDate && (
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <User className="size-3.5 shrink-0" />
              <span>{t("noDetails")}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}