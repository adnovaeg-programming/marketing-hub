import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

export default async function PortalProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/portal");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description, status, start_date, end_date, budget, currency")
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.portal");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    on_hold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("sections.myProjects")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("projectsCount", { count: projects?.length ?? 0 })}
      </p>

      {!projects || projects.length === 0 ? (
        <div className="glass-strong mt-8 flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <FolderKanban className="size-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("noProjects")}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass rounded-2xl p-5"
            >
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  statusStyles[project.status] ?? statusStyles.draft
                }`}
              >
                {project.status}
              </span>
              <h3 className="mt-3 font-semibold">{project.name}</h3>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {project.description}
                </p>
              )}
              {project.budget != null && (
                <p className="mt-3 text-sm font-medium" dir="ltr">
                  {Number(project.budget).toLocaleString()}{" "}
                  {project.currency ?? ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}