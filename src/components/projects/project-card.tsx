import Link from "next/link";
import { Calendar, Wallet, User } from "lucide-react";
import { useTranslations } from "next-intl";

type Project = {
  id: string;
  name: string;
  status: string;
  priority: string;
  budget: number | null;
  currency: string | null;
  end_date: string | null;
  client: { id: string; name: string } | null;
};

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("dashboard.projects");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    on_hold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    urgent: "bg-destructive/10 text-destructive",
  };

  const endDate = project.end_date
    ? new Date(project.end_date).toLocaleDateString()
    : null;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="glass glass-hover group block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      {/* Status + Priority */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusStyles[project.status] ?? statusStyles.draft
          }`}
        >
          {t(`statuses.${project.status}`)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            priorityStyles[project.priority] ?? priorityStyles.medium
          }`}
        >
          {t(`priorities.${project.priority}`)}
        </span>
      </div>

      {/* Name */}
      <h3 className="mt-3 truncate text-lg font-semibold">{project.name}</h3>

      {/* Client */}
      {project.client && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3.5 shrink-0" />
          <span className="truncate">{project.client.name}</span>
        </div>
      )}

      {/* Meta */}
      <div className="mt-4 space-y-2 border-t border-border/40 pt-4 text-xs">
        {project.budget != null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground" dir="ltr">
              {project.budget.toLocaleString()} {project.currency ?? ""}
            </span>
          </div>
        )}
        {endDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            <span dir="ltr">{endDate}</span>
          </div>
        )}
      </div>
    </Link>
  );
}