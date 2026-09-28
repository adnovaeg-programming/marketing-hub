import { redirect } from "next/navigation";
import {
  Users,
  FolderKanban,
  FileText,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/analytics/stat-card";
import { BarChart } from "@/components/analytics/bar-chart";
import { DonutChart } from "@/components/analytics/donut-chart";
import { ActivityFeed } from "@/components/analytics/activity-feed";

export default async function AnalyticsPage() {
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

  const workspaceId = member.workspace_id;

  // ═══════════ KPIs ═══════════

  const [
    { count: clientsCount },
    { count: projectsCount },
    { count: contentCount },
    { count: tasksCount },
    { count: pendingTasksCount },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .in("status", ["todo", "in_progress", "review"]),
  ]);

  // ═══════════ Breakdowns ═══════════

  const { data: contentByStatus } = await supabase
    .from("content_items")
    .select("status")
    .eq("workspace_id", workspaceId);

  const { data: projectsByStatus } = await supabase
    .from("projects")
    .select("status")
    .eq("workspace_id", workspaceId);

  const { data: tasksByPriority } = await supabase
    .from("tasks")
    .select("priority")
    .eq("workspace_id", workspaceId);

  // ═══════════ Recent Activity ═══════════

  const [
    { data: recentClients },
    { data: recentProjects },
    { data: recentContent },
    { data: recentTasks },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, company, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("projects")
      .select("id, name, status, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("content_items")
      .select("id, title, status, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, title, status, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const t = await getTranslations("dashboard.analytics");

  // ═══════════ Aggregate ═══════════

  const countBy = (arr: { status?: string; priority?: string }[] | null, key: "status" | "priority") => {
    const map: Record<string, number> = {};
    (arr ?? []).forEach((item) => {
      const k = item[key];
      if (!k) return;
      map[k] = (map[k] ?? 0) + 1;
    });
    return map;
  };

  const contentStats = countBy(contentByStatus, "status");
  const projectStats = countBy(projectsByStatus, "status");
  const taskStats = countBy(tasksByPriority, "priority");

  // ═══════════ Donut — Content Status ═══════════

  const donutColors: Record<string, string> = {
    draft: "#94a3b8",
    internal_review: "#3b82f6",
    client_review: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
    scheduled: "#a855f7",
    published: "#7c3aed",
    archived: "#64748b",
  };

  const donutSegments = Object.entries(contentStats)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      label: t(`contentStatuses.${key}`),
      value,
      color: donutColors[key] ?? "#94a3b8",
    }));

  // ═══════════ Bar — Projects by Status ═══════════

  const projectBars = Object.entries(projectStats).map(([key, value]) => ({
    label: t(`projectStatuses.${key}`),
    value,
    color: undefined,
  }));

  // ═══════════ Bar — Tasks by Priority ═══════════

  const taskBars = Object.entries(taskStats).map(([key, value]) => ({
    label: t(`taskPriorities.${key}`),
    value,
    color:
      key === "urgent"
        ? "bg-destructive"
        : key === "high"
          ? "bg-orange-500"
          : key === "medium"
            ? "bg-blue-500"
            : "bg-muted-foreground/60",
  }));

  // ═══════════ Activity Feed ═══════════

  const activities = [
    ...(recentClients ?? []).map((c) => ({
      id: c.id,
      type: "client" as const,
      title: c.name,
      subtitle: c.company,
      href: `/dashboard/clients/${c.id}`,
      created_at: c.created_at,
    })),
    ...(recentProjects ?? []).map((p) => ({
      id: p.id,
      type: "project" as const,
      title: p.name,
      subtitle: t(`projectStatuses.${p.status}`),
      href: `/dashboard/projects/${p.id}`,
      created_at: p.created_at,
    })),
    ...(recentContent ?? []).map((c) => ({
      id: c.id,
      type: "content" as const,
      title: c.title,
      subtitle: t(`contentStatuses.${c.status}`),
      href: `/dashboard/content/${c.id}`,
      created_at: c.created_at,
    })),
    ...(recentTasks ?? []).map((t2) => ({
      id: t2.id,
      type: "task" as const,
      title: t2.title,
      subtitle: t2.status,
      href: `/dashboard/tasks/${t2.id}`,
      created_at: t2.created_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label={t("kpis.clients")}
          value={clientsCount ?? 0}
          color="primary"
        />
        <StatCard
          icon={FolderKanban}
          label={t("kpis.projects")}
          value={projectsCount ?? 0}
          color="accent"
        />
        <StatCard
          icon={FileText}
          label={t("kpis.content")}
          value={contentCount ?? 0}
          color="primary"
        />
        <StatCard
          icon={CheckSquare}
          label={t("kpis.tasks")}
          value={tasksCount ?? 0}
          color="emerald"
          trendLabel={
            pendingTasksCount && pendingTasksCount > 0
              ? t("kpis.pending", { count: pendingTasksCount })
              : t("kpis.allDone")
          }
        />
      </div>

      {/* Charts Row 1 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Donut — Content */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {t("sections.contentBreakdown")}
            </h2>
          </div>
          <DonutChart
            segments={donutSegments}
            centerLabel={t("sections.contentCenter")}
            centerValue={contentCount ?? 0}
          />
        </div>

        {/* Bar — Projects */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <FolderKanban className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">
              {t("sections.projectsByStatus")}
            </h2>
          </div>
          {projectBars.length > 0 ? (
            <BarChart data={projectBars} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("sections.empty")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Bar — Tasks by Priority */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {t("sections.tasksByPriority")}
            </h2>
          </div>
          {taskBars.length > 0 ? (
            <BarChart data={taskBars} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckSquare className="size-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("sections.empty")}
              </p>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="size-5 text-accent" />
            <h2 className="text-lg font-semibold">
              {t("sections.recentActivity")}
            </h2>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}