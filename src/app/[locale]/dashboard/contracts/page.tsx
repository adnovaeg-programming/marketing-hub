import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ContractsGrid } from "@/components/contracts/contracts-grid";

export default async function ContractsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: contracts } = await supabase
    .from("contracts")
    .select(
      `
      *,
      client:profiles!contracts_client_id_fkey (id, first_name, last_name, email, avatar_url),
      provider:profiles!contracts_provider_id_fkey (id, first_name, last_name, email, avatar_url),
      milestones:contract_milestones (id, status, amount)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.contracts");

  const normalized = (contracts ?? []).map((c) => ({
    ...c,
    client: Array.isArray(c.client) ? c.client[0] ?? null : c.client,
    provider: Array.isArray(c.provider) ? c.provider[0] ?? null : c.provider,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ContractsGrid contracts={normalized} currentUserId={user.id} />
    </div>
  );
}