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
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { CountUp } from "@/components/fx/count-up";
import { TiltCard } from "@/components/fx/tilt-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const activeWorkspaceId = await getActiveWorkspaceId();
  if (!activeWorkspaceId) redirect("/onboarding");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("workspace_id", activeWorkspaceId)
    .eq("status", "active")
    .maybeSingle();

  if (!member) redirect("/onboarding");

  const workspaceId = activeWorkspaceId;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, account_type")
    .eq("id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, slug, organization_id")
    .eq("id", workspaceId)
    .single();

  const { data: organization } = await supabase
    .from("organizations")
    .select("name, type")
    .eq("id", workspace?.organization_id ?? "")
    .maybeSingle();

  const { count: membersCount } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const { count: activeProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  const { count: totalProjectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const { count: contentCount } = await supabase
    .from("content_items")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const { data: recentClients } = await supabase
    .from("clients")
    .select("id, name, company, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(3);

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
      value: clientsCount ?? 0,
      href: "/dashboard/clients",
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: FolderKanban,
      label: t("stats.activeProjects"),
      value: activeProjectsCount ?? 0,
      href: "/dashboard/projects",
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
      subtext: t("stats.totalProjects", { count: totalProjectsCount ?? 0 }),
    },
    {
      icon: FileText,
      label: t("stats.content"),
      value: contentCount ?? 0,
      href: "/dashboard/content",
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: TrendingUp,
      label: t("stats.team"),
      value: membersCount ?? 1,
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
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-primary">
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

      {/* Stats — Tilt Cards + Count-up */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <TiltCard key={stat.label} maxTilt={6}>
              <Link
                href={stat.href}
                className="glass glass-reflect group block rounded-2xl p-5 transition-shadow hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bg}`}
                  >
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                  <ArrowLeft className="size-4 text-muted-foreground transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                </div>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  <CountUp end={stat.value} duration={1200} />
                </p>
                {stat.subtext && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {stat.subtext}
                  </p>
                )}
              </Link>
            </TiltCard>
          );
        })}
      </div>

      {/* Recent */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
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
                  className="glass glass-hover flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-md shadow-primary/30">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{client.name}</p>
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
                className="mt-3 text-xs font-medium text-primary hover:opacity-80"
              >
                {t("sections.addFirst")}
              </Link>
            </div>
          )}
        </div>

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
                    className="glass glass-hover flex items-center gap-3 rounded-xl p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary text-white shadow-md shadow-accent/30">
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
                className="mt-3 text-xs font-medium text-primary hover:opacity-80"
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