import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { DisputesList } from "@/components/disputes/disputes-list";

export default async function DisputesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: disputes } = await supabase
    .from("disputes")
    .select(
      `
      *,
      opened_by_profile:profiles!disputes_opened_by_fkey (id, first_name, last_name, email),
      against_user_profile:profiles!disputes_against_user_id_fkey (id, first_name, last_name, email)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.disputes");

  const normalized = (disputes ?? []).map((d) => ({
    ...d,
    opened_by_profile: Array.isArray(d.opened_by_profile)
      ? d.opened_by_profile[0] ?? null
      : d.opened_by_profile,
    against_user_profile: Array.isArray(d.against_user_profile)
      ? d.against_user_profile[0] ?? null
      : d.against_user_profile,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DisputesList disputes={normalized} currentUserId={user.id} />
    </div>
  );
}