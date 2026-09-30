import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { TasksGrid } from "@/components/tasks/tasks-grid";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      due_date,
      created_at,
      project:projects (id, name),
      client:clients (id, name),
      assignee:profiles!tasks_assigned_to_fkey (id, first_name, last_name, email)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.tasks");

  const normalized = (tasks ?? []).map((task) => ({
    ...task,
    project: Array.isArray(task.project)
      ? task.project[0] ?? null
      : task.project,
    client: Array.isArray(task.client) ? task.client[0] ?? null : task.client,
    assignee: Array.isArray(task.assignee)
      ? task.assignee[0] ?? null
      : task.assignee,
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

      <TasksGrid tasks={normalized} />
    </div>
  );
}