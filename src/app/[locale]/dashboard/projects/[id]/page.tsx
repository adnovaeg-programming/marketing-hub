import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Wallet,
  User,
  CheckSquare,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { Button } from "@/components/ui/button";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

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

  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      *,
      client:clients (id, name, company, email)
    `
    )
    .eq("id", id)
    .eq("workspace_id", member.workspace_id)
    .maybeSingle();

  if (!project) notFound();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const client = Array.isArray(project.client)
    ? project.client[0] ?? null
    : project.client;

  const t = await getTranslations("dashboard.projectDetails");
  const tTasks = await getTranslations("dashboard.tasks");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    on_hold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const taskStatusStyles: Record<string, string> = {
    todo: "bg-muted text-muted-foreground",
    in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const createdDate = fmtDate(project.created_at);
  const startDate = fmtDate(project.start_date);
  const endDate = fmtDate(project.end_date);

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {t("back")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusStyles[project.status] ?? statusStyles.draft
              }`}
            >
              {t(`statuses.${project.status}`)}
            </span>
            {createdDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {createdDate}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {project.name}
          </h1>

          {project.description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {client && (
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5" />
              {t("client")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{client.name}</p>
            {client.company && (
              <p className="truncate text-xs text-muted-foreground">
                {client.company}
              </p>
            )}
          </Link>
        )}

        {project.budget != null && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              {t("budget")}
            </div>
            <p className="mt-2 text-sm font-medium" dir="ltr">
              {Number(project.budget).toLocaleString()}{" "}
              {project.currency ?? ""}
            </p>
          </div>
        )}

        {startDate && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {t("startDate")}
            </div>
            <p className="mt-2 text-sm font-medium">{startDate}</p>
          </div>
        )}

        {endDate && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {t("endDate")}
            </div>
            <p className="mt-2 text-sm font-medium">{endDate}</p>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {t("tasks")}{" "}
              {tasks && tasks.length > 0 && (
                <span className="text-muted-foreground">
                  ({tasks.length})
                </span>
              )}
            </h2>
          </div>
          <NewTaskDialog projectId={project.id} />
        </div>

        {!tasks || tasks.length === 0 ? (
          <div className="glass mt-4 flex flex-col items-center justify-center rounded-2xl py-10 text-center">
            <CheckSquare className="size-8 text-primary/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("noTasks")}
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="glass glass-hover flex items-center justify-between gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        taskStatusStyles[task.status] ??
                        taskStatusStyles.todo
                      }`}
                    >
                      {tTasks(`statuses.${task.status}`)}
                    </span>
                    {task.due_date && (
                      <span dir="ltr">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}