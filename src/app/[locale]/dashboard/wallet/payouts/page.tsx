import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { PayoutsDashboard } from "@/components/payouts/payouts-dashboard";

export default async function PayoutsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId);

  const { data: methods } = await supabase
    .from("payout_methods")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: payouts } = await supabase
    .from("payout_requests")
    .select(
      `
      *,
      method:payout_methods (id, type, label, account_identifier)
    `
    )
    .eq("user_id", user.id)
    .order("requested_at", { ascending: false })
    .limit(50);

  const t = await getTranslations("dashboard.payouts");

  const normalizedPayouts = (payouts ?? []).map((p) => ({
    ...p,
    method: Array.isArray(p.method) ? p.method[0] ?? null : p.method,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <PayoutsDashboard
        wallets={wallets ?? []}
        methods={methods ?? []}
        payouts={normalizedPayouts}
      />
    </div>
  );
}