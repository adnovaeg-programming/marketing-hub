import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ProposalsList } from "@/components/marketplace/proposals-list";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  // نجيب العروض اللي المستخدم طرف فيها (مقدم أو عميل)
  const { data: proposals } = await supabase
    .from("proposals")
    .select(
      `
      *,
      client:profiles!proposals_client_id_fkey (id, first_name, last_name, email, avatar_url),
      provider:profiles!proposals_provider_id_fkey (id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.proposals");

  const normalized = (proposals ?? []).map((p) => ({
    ...p,
    client: Array.isArray(p.client) ? p.client[0] ?? null : p.client,
    provider: Array.isArray(p.provider) ? p.provider[0] ?? null : p.provider,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ProposalsList
        proposals={normalized}
        currentUserId={user.id}
      />
    </div>
  );
}