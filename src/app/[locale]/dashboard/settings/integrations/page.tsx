import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { IntegrationsGrid } from "@/components/settings/integrations-grid";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const [{ data: integrations }, { data: connections }] = await Promise.all([
    supabase
      .from("integrations")
      .select("*")
      .eq("is_available", true)
      .order("category")
      .order("name"),
    supabase
      .from("integration_connections")
      .select("*")
      .eq("user_id", user.id)
      .eq("workspace_id", workspaceId),
  ]);

  const t = await getTranslations("dashboard.integrations");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <IntegrationsGrid
        integrations={integrations ?? []}
        connections={connections ?? []}
      />
    </div>
  );
}