import { redirect } from "next/navigation";
import { CheckSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";

export default async function TasksPage() {
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

  if (!member) redirect("/onboarding");

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      status,
      priority,
      due_date,
      project:projects (id, name),
      assignee:profiles (id, first_name, last_name, email)
    `
    )
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.tasks");

  const normalized = (tasks ?? []).map((task) => ({
    ...task,
    project: Array.isArray(task.project) ? task.project[0] ?? null : task.project,
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

        <NewTaskDialog />
      </div>

      {normalized.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
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
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {normalized.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}