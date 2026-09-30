import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  User,
  FolderKanban,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskActions } from "@/components/tasks/task-actions";
import { TaskComments } from "@/components/tasks/task-comments";
import { TaskAttachments } from "@/components/tasks/task-attachments";

export default async function TaskDetailsPage({
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

  // ✅ FK محدد لـ assigned_to
  const { data: task } = await supabase
    .from("tasks")
    .select(
      `
      *,
      project:projects (id, name),
      client:clients (id, name),
      assignee:profiles!tasks_assigned_to_fkey (id, first_name, last_name, email)
    `
    )
    .eq("id", id)
    .eq("workspace_id", member.workspace_id)
    .maybeSingle();

  if (!task) notFound();

  // ✅ FK محدد لـ user_id في التعليقات
  const { data: comments } = await supabase
    .from("task_comments")
    .select(
      `
      id, content, created_at, user_id,
      author:profiles!task_comments_user_id_fkey (id, first_name, last_name, email)
    `
    )
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  const t = await getTranslations("dashboard.tasks");
  const tDetails = await getTranslations("dashboard.tasks.details");

  const project = Array.isArray(task.project) ? task.project[0] : task.project;
  const client = Array.isArray(task.client) ? task.client[0] : task.client;
  const assignee = Array.isArray(task.assignee)
    ? task.assignee[0]
    : task.assignee;

  const statusStyles: Record<string, string> = {
    todo: "bg-muted text-muted-foreground border-border/40",
    in_progress:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    review:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    completed:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const priorityStyles: Record<string, string> = {
    low: "bg-muted text-muted-foreground border-border/40",
    medium:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    high:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    urgent: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const dueDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : null;

  const assigneeName = assignee
    ? [assignee.first_name, assignee.last_name].filter(Boolean).join(" ") ||
      assignee.email
    : null;

  const normalizedComments = (comments ?? []).map((c) => ({
    ...c,
    author: Array.isArray(c.author) ? c.author[0] ?? null : c.author,
  }));

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {tDetails("back")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              statusStyles[task.status] ?? statusStyles.todo
            }`}
          >
            {t(`statuses.${task.status}`)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              priorityStyles[task.priority] ?? priorityStyles.medium
            }`}
          >
            {t(`priorities.${task.priority}`)}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          {task.title}
        </h1>

        {task.description && (
          <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-6 border-t border-border/40 pt-6">
          <TaskActions taskId={task.id} currentStatus={task.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {project && (
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderKanban className="size-3.5" />
              {tDetails("project")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{project.name}</p>
          </Link>
        )}

        {client && (
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {tDetails("client")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{client.name}</p>
          </Link>
        )}

        {assigneeName && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5" />
              {tDetails("assignedTo")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{assigneeName}</p>
          </div>
        )}

        {dueDate && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {tDetails("dueDate")}
            </div>
            <p className="mt-2 text-sm font-medium">{dueDate}</p>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TaskAttachments
          taskId={task.id}
          workspaceId={member.workspace_id}
          userId={user.id}
        />
        <TaskComments
          taskId={task.id}
          comments={normalizedComments}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}