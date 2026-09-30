import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ProjectsGrid } from "@/components/projects/projects-grid";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      description,
      status,
      priority,
      budget,
      currency,
      start_date,
      end_date,
      created_at,
      client:clients (id, name, company)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.projects");

  const normalized = (projects ?? []).map((p) => ({
    ...p,
    client: Array.isArray(p.client) ? p.client[0] ?? null : p.client,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", { count: normalized.length })}
          </p>
        </div>
      </div>

      <ProjectsGrid projects={normalized} />
    </div>
  );
}