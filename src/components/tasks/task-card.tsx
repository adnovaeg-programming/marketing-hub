import Link from "next/link";
import { Calendar, User, FolderKanban } from "lucide-react";
import { useTranslations } from "next-intl";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project: { id: string; name: string } | null;
  assignee: { id: string; first_name: string | null; last_name: string | null; email: string } | null;
};

export function TaskCard({ task }: { task: Task }) {
  const t = useTranslations("dashboard.tasks");

  const statusStyles: Record<string, string> = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    urgent: "bg-destructive/10 text-destructive",
  };

  const assigneeName = task.assignee
    ? [task.assignee.first_name, task.assignee.last_name].filter(Boolean).join(" ") ||
      task.assignee.email
    : null;

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString()
    : null;

  return (
    <Link
      href={`/dashboard/tasks/${task.id}`}
      className="glass glass-hover block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusStyles[task.status] ?? statusStyles.todo
          }`}
        >
          {t(`statuses.${task.status}`)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            priorityStyles[task.priority] ?? priorityStyles.medium
          }`}
        >
          {t(`priorities.${task.priority}`)}
        </span>
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
        {assigneeName && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{assigneeName}</span>
          </div>
        )}
        {dueDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            <span dir="ltr">{dueDate}</span>
          </div>
        )}
      </div>
    </Link>
  );
}