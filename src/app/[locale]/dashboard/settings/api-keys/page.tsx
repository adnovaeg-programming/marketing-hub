import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ApiKeysList } from "@/components/settings/api-keys-list";

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: keys } = await supabase
    .from("api_keys")
    .select("*")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.apiKeys");

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ApiKeysList keys={keys ?? []} />
    </div>
  );
}