import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // نتحقق من العضوية
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/onboarding");

  const workspaceId = member.workspace_id;

  // نجيب الـ profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, account_type")
    .eq("id", user.id)
    .single();

  // نجيب الـ workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, slug, organization_id")
    .eq("id", workspaceId)
    .single();

  // نجيب الـ organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("name, type")
    .eq("id", workspace?.organization_id ?? "")
    .maybeSingle();

  // ═══════════════ الإحصائيات الحقيقية ═══════════════

  // 1. عدد الأعضاء
  const { count: membersCount } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  // 2. عدد العملاء
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // 3. عدد المشاريع النشطة
  const { count: activeProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  // 4. إجمالي المشاريع
  const { count: totalProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  // 5. أحدث العملاء
  const { data: recentClients } = await supabase
    .from("clients")
    .select("id, name, company, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(3);

  // 6. أحدث المشاريع
  const { data: recentProjects } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      status,
      created_at,
      client:clients (name)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(3);

  const t = await getTranslations("dashboard");

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  const stats = [
    {
      icon: Users,
      label: t("stats.clients"),
      value: String(clientsCount ?? 0),
      href: "/dashboard/clients",
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: FolderKanban,
      label: t("stats.activeProjects"),
      value: String(activeProjectsCount ?? 0),
      href: "/dashboard/projects",
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
      subtext: t("stats.totalProjects", { count: totalProjectsCount ?? 0 }),
    },
    {
      icon: FileText,
      label: t("stats.content"),
      value: "0",
      href: "/dashboard/content",
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
      subtext: t("stats.comingSoon"),
    },
    {
      icon: TrendingUp,
      label: t("stats.team"),
      value: String(membersCount ?? 1),
      href: "/dashboard/settings",
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3" />
            {workspace?.name ?? "Workspace"}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {t("welcome")}, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {organization?.name} • {profile?.account_type}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isClickable = !!stat.href;

          const inner = (
            <div className="glass glass-hover rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div
                  className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bg}`}
                >
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                {isClickable && (
                  <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
                )}
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              {stat.subtext && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {stat.subtext}
                </p>
              )}
            </div>
          );

          return isClickable ? (
            <Link key={stat.label} href={stat.href} className="group block">
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("sections.recentClients")}</h2>
            <Link
              href="/dashboard/clients"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
            >
              {t("sections.viewAll")}
              <ArrowLeft className="size-3 rtl:rotate-180" />
            </Link>
          </div>

          {recentClients && recentClients.length > 0 ? (
            <div className="mt-6 space-y-2">
              {recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="glass glass-hover flex items-center gap-3 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {client.name}
                    </p>
                    {client.company && (
                      <p className="truncate text-xs text-muted-foreground">
                        {client.company}
                      </p>
                    )}
                  </div>
                  <Clock className="size-3 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
              <Users className="size-8 text-primary/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("sections.noClients")}
              </p>
              <Link
                href="/dashboard/clients"
                className="mt-3 text-xs font-medium text-primary transition hover:opacity-80"
              >
                {t("sections.addFirst")}
              </Link>
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("sections.recentProjects")}
            </h2>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
            >
              {t("sections.viewAll")}
              <ArrowLeft className="size-3 rtl:rotate-180" />
            </Link>
          </div>

          {recentProjects && recentProjects.length > 0 ? (
            <div className="mt-6 space-y-2">
              {recentProjects.map((project) => {
                const client = Array.isArray(project.client)
                  ? project.client[0]
                  : project.client;
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="glass glass-hover flex items-center gap-3 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary text-white">
                      <FolderKanban className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {project.name}
                      </p>
                      {client && (
                        <p className="truncate text-xs text-muted-foreground">
                          {client.name}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {project.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
              <FolderKanban className="size-8 text-accent/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("sections.noProjects")}
              </p>
              <Link
                href="/dashboard/projects"
                className="mt-3 text-xs font-medium text-primary transition hover:opacity-80"
              >
                {t("sections.addFirstProject")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}