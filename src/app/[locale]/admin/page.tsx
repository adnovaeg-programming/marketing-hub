import {
  Users,
  Building2,
  Briefcase,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/analytics/stat-card";
import { AdminRecentActivity } from "@/components/admin/admin-recent-activity";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: orgsCount },
    { count: workspacesCount },
    { count: logsCount },
    { count: criticalCount },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("workspaces").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("severity", "critical"),
    supabase
      .from("audit_logs")
      .select(
        `id, action, entity_type, entity_name, severity, actor_email, created_at`
      )
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const t = await getTranslations("admin.overview");

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Users}
          label={t("kpis.users")}
          value={usersCount ?? 0}
          color="primary"
        />
        <StatCard
          icon={Building2}
          label={t("kpis.organizations")}
          value={orgsCount ?? 0}
          color="accent"
        />
        <StatCard
          icon={Briefcase}
          label={t("kpis.workspaces")}
          value={workspacesCount ?? 0}
          color="primary"
        />
        <StatCard
          icon={Activity}
          label={t("kpis.audit_logs")}
          value={logsCount ?? 0}
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label={t("kpis.critical")}
          value={criticalCount ?? 0}
          color="amber"
        />
      </div>

      <div className="mt-8">
        <AdminRecentActivity
          logs={
            (recentLogs ?? []) as {
              id: string;
              action: string;
              entity_type: string | null;
              entity_name: string | null;
              severity: string;
              actor_email: string | null;
              created_at: string;
            }[]
          }
        />
      </div>
    </div>
  );
}