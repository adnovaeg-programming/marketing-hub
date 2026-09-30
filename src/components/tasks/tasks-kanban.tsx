"use client";

import { useMemo } from "react";
import { CheckSquare, Calendar, User, FolderKanban } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

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

const COLUMNS = ["todo", "in_progress", "review", "completed"] as const;

const COLUMN_COLORS: Record<string, string> = {
  todo: "border-slate-500/50",
  in_progress: "border-blue-500/50",
  review: "border-amber-500/50",
  completed: "border-emerald-500/50",
};

const PRIORITY_DOTS: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-destructive",
};

export function TasksKanban({ tasks }: { tasks: Task[] }) {
  const t = useTranslations("dashboard.tasks");

  const columnsWithItems = useMemo(() => {
    return COLUMNS.map((col) => ({
      key: col,
      items: tasks.filter((task) => task.status === col),
    }));
  }, [tasks]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columnsWithItems.map((col) => (
        <div key={col.key} className="flex flex-col">
          {/* Header */}
          <div
            className={`glass mb-3 flex items-center justify-between rounded-xl border-s-4 px-3 py-2 ${COLUMN_COLORS[col.key]}`}
          >
            <span className="text-sm font-semibold">
              {t(`statuses.${col.key}`)}
            </span>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>

          {/* Body */}
          <div className="glass flex-1 space-y-2 rounded-2xl p-2">
            {col.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckSquare className="size-6 text-muted-foreground/30" />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("kanbanEmpty")}
                </p>
              </div>
            ) : (
              col.items.map((task) => {
                const assigneeName = task.assignee
                  ? [task.assignee.first_name, task.assignee.last_name]
                      .filter(Boolean)
                      .join(" ") || task.assignee.email
                  : null;
                const initial = assigneeName
                  ? assigneeName.charAt(0).toUpperCase()
                  : null;
                const dueDate = task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : null;

                return (
                  <Link
                    key={task.id}
                    href={`/dashboard/tasks/${task.id}`}
                    className="glass glass-hover block rounded-xl p-3 transition-all"
                  >
                    <h4 className="line-clamp-2 text-sm font-medium">
                      {task.title}
                    </h4>

                    {task.project && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <FolderKanban className="size-3" />
                        <span className="truncate">{task.project.name}</span>
                      </div>
                    )}

                    {dueDate && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="size-3" />
                        <span dir="ltr">{dueDate}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {/* Priority dot */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block size-1.5 rounded-full ${
                            PRIORITY_DOTS[task.priority] ?? "bg-muted-foreground"
                          }`}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {t(`priorities.${task.priority}`)}
                        </span>
                      </div>

                      {/* Assignee avatar */}
                      {assigneeName && initial && (
                        <div
                          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[9px] font-bold text-white shadow-sm shadow-primary/30"
                          title={assigneeName}
                        >
                          {initial}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}