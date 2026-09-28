import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  FolderKanban,
  FileText,
  CheckSquare,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";

export default async function PortalHomePage() {
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

  if (!member) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="glass-strong rounded-3xl p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">مرحبًا بيك! 👋</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            لسه مش عضو في أي مساحة عمل. لما توصلك دعوة، هتقدر تشوف محتواك هنا.
          </p>
        </div>
      </div>
    );
  }

  const workspaceId = member.workspace_id;

  const [
    { count: projectsCount },
    { count: pendingCount },
    { count: approvedCount },
    { data: pendingItems },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "client_review"),
    supabase
      .from("content_items")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "approved"),
    supabase
      .from("content_items")
      .select(
        `
        id, title, content_type, platform, scheduled_at, created_at,
        project:projects (id, name)
      `
      )
      .eq("workspace_id", workspaceId)
      .eq("status", "client_review")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const t = await getTranslations("dashboard.portal");

  const stats = [
    {
      icon: Clock,
      label: t("stats.pending"),
      value: pendingCount ?? 0,
      color: "text-amber-500",
      bg: "from-amber-500/20 to-primary/20",
      href: "/portal/approvals",
    },
    {
      icon: FileText,
      label: t("stats.approved"),
      value: approvedCount ?? 0,
      color: "text-emerald-500",
      bg: "from-emerald-500/20 to-primary/20",
      href: "/portal/projects",
    },
    {
      icon: FolderKanban,
      label: t("stats.projects"),
      value: projectsCount ?? 0,
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
      href: "/portal/projects",
    },
  ];

  const normalizedPending = (pendingItems ?? []).map((item) => ({
    ...item,
    project: Array.isArray(item.project) ? item.project[0] ?? null : item.project,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("welcome")} 👋
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="glass glass-hover group rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            >
              <div
                className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bg}`}
              >
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("sections.pendingApprovals")}
          </h2>
          {(pendingCount ?? 0) > 0 && (
            <Link
              href="/portal/approvals"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80"
            >
              {t("viewAll")}
              <ArrowLeft className="size-3 rtl:rotate-180" />
            </Link>
          )}
        </div>

        {normalizedPending.length === 0 ? (
          <div className="glass-strong mt-4 flex flex-col items-center justify-center rounded-3xl py-16 text-center">
            <CheckSquare className="size-12 text-emerald-500/40" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("allClear")}
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {normalizedPending.map((item) => (
              <Link
                key={item.id}
                href={`/portal/approvals/${item.id}`}
                className="glass glass-hover rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <FileText className="size-4 text-amber-500" />
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                    {t("pendingApproval")}
                  </span>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold">
                  {item.title}
                </h3>
                {item.project && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.project.name}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}