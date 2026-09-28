import { redirect } from "next/navigation";
import {
  Sparkles,
  Users,
  FolderKanban,
  FileText,
  TrendingUp,
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
    .eq("id", member.workspace_id)
    .single();

  // نجيب الـ organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("name, type")
    .eq("id", workspace?.organization_id ?? "")
    .maybeSingle();

  // نجيب عدد الأعضاء
  const { count: membersCount } = await supabase
    .from("workspace_members")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", member.workspace_id)
    .eq("status", "active");

  const t = await getTranslations("dashboard");

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email;

  const stats = [
    {
      icon: Users,
      label: t("stats.members"),
      value: String(membersCount ?? 1),
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: FolderKanban,
      label: t("stats.projects"),
      value: "0",
      color: "text-accent",
      bg: "from-accent/20 to-primary/20",
    },
    {
      icon: FileText,
      label: t("stats.content"),
      value: "0",
      color: "text-primary",
      bg: "from-primary/20 to-accent/20",
    },
    {
      icon: TrendingUp,
      label: t("stats.engagement"),
      value: "—",
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
          return (
            <div
              key={stat.label}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div
                className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bg}`}
              >
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-strong rounded-3xl p-8">
          <h2 className="text-lg font-semibold">{t("sections.recent")}</h2>
          <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
            <Sparkles className="size-10 text-primary/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("sections.recentEmpty")}
            </p>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-8">
          <h2 className="text-lg font-semibold">{t("sections.quickActions")}</h2>
          <div className="mt-6 space-y-3">
            <div className="glass rounded-xl p-4 text-sm text-muted-foreground">
              {t("sections.actionsSoon")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}