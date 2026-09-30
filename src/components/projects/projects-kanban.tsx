"use client";

import { useMemo } from "react";
import { FolderKanban, User, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type Project = {
  id: string;
  name: string;
  status: string;
  priority: string;
  budget: number | null;
  currency: string | null;
  client: { id: string; name: string } | null;
};

const COLUMNS: { key: string; statuses: string[] }[] = [
  { key: "draft", statuses: ["draft"] },
  { key: "active", statuses: ["active"] },
  { key: "on_hold", statuses: ["on_hold"] },
  { key: "completed", statuses: ["completed", "cancelled"] },
];

export function ProjectsKanban({ projects }: { projects: Project[] }) {
  const t = useTranslations("dashboard.projects");

  const columnsWithItems = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      items: projects.filter((p) => col.statuses.includes(p.status)),
    }));
  }, [projects]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {columnsWithItems.map((col) => (
        <div key={col.key} className="flex flex-col">
          {/* Column Header */}
          <div className="glass mb-3 flex items-center justify-between rounded-xl px-3 py-2">
            <span className="text-sm font-semibold">
              {t(`statuses.${col.statuses[0]}`)}
            </span>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>

          {/* Column Body */}
          <div className="glass flex-1 space-y-2 rounded-2xl p-2">
            {col.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="size-6 text-muted-foreground/30" />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("kanbanEmpty")}
                </p>
              </div>
            ) : (
              col.items.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="glass glass-hover block rounded-xl p-3 transition-all"
                >
                  <h4 className="line-clamp-2 text-sm font-medium">
                    {project.name}
                  </h4>

                  {project.client && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <User className="size-3" />
                      <span className="truncate">{project.client.name}</span>
                    </div>
                  )}

                  {project.budget != null && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Wallet className="size-3" />
                      <span dir="ltr">
                        {project.budget.toLocaleString()}{" "}
                        {project.currency ?? ""}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className={`inline-block size-1.5 rounded-full ${
                        project.priority === "urgent"
                          ? "bg-destructive"
                          : project.priority === "high"
                            ? "bg-orange-500"
                            : project.priority === "medium"
                              ? "bg-blue-500"
                              : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {t(`priorities.${project.priority}`)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}