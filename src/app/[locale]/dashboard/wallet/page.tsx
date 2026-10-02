import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { WalletDashboard } from "@/components/wallet/wallet-dashboard";

export default async function WalletPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const t = await getTranslations("dashboard.wallet");

  // نجيب كل محافظ المستخدم في الـ workspace
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  // نجيب آخر 50 حركة لكل الـ wallets
  const walletIds = (wallets ?? []).map((w) => w.id);

  const { data: transactions } = walletIds.length
    ? await supabase
        .from("wallet_transactions")
        .select("*")
        .in("wallet_id", walletIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  // نجيب الـ workspace name
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .maybeSingle();

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("subtitle", { workspace: workspace?.name ?? "" })}
        </p>
      </div>

      <WalletDashboard
        wallets={wallets ?? []}
        transactions={transactions ?? []}
        workspaceId={workspaceId}
      />
    </div>
  );
}