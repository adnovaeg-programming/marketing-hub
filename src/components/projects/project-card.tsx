import { Link } from "@/i18n/navigation";
import { Calendar, Wallet, User, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  budget: number | null;
  currency: string | null;
  end_date: string | null;
  client: { id: string; name: string; company: string | null } | null;
};

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("dashboard.projects");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border/40",
    active:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    on_hold:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    completed:
      "bg-primary/10 text-primary border-primary/20",
    cancelled:
      "bg-destructive/10 text-destructive border-destructive/20",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-muted text-muted-foreground border-border/40",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const endDate = project.end_date
    ? new Date(project.end_date).toLocaleDateString()
    : null;

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="glass glass-reflect group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Header: Status + Priority + Arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              statusStyles[project.status] ?? statusStyles.draft
            }`}
          >
            {t(`statuses.${project.status}`)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              priorityStyles[project.priority] ?? priorityStyles.medium
            }`}
          >
            {t(`priorities.${project.priority}`)}
          </span>
        </div>

        <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 text-base font-semibold">
        {project.name}
      </h3>

      {/* Description */}
      {project.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {project.description}
        </p>
      )}

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