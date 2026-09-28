import { redirect } from "next/navigation";
import { CheckSquare } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { ApprovalCard } from "@/components/portal/approval-card";

export default async function PortalApprovalsPage() {
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

  if (!member) redirect("/portal");

  const { data: items } = await supabase
    .from("content_items")
    .select(
      `
      id, title, content_type, platform, scheduled_at, created_at,
      project:projects (id, name)
    `
    )
    .eq("workspace_id", member.workspace_id)
    .eq("status", "client_review")
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.portal");

  const normalized = (items ?? []).map((item) => ({
    ...item,
    project: Array.isArray(item.project) ? item.project[0] ?? null : item.project,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("sections.pendingApprovals")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("approvalsCount", { count: normalized.length })}
      </p>

      {normalized.length === 0 ? (
        <div className="glass-strong mt-8 flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <CheckSquare className="size-12 text-emerald-500/40" />
          <p className="mt-4 text-sm text-muted-foreground">{t("allClear")}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {normalized.map((item) => (
            <ApprovalCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}