import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { FeatureFlagsPanel } from "@/components/admin/feature-flags-panel";
import { PlatformSettingsPanel } from "@/components/admin/platform-settings-panel";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: flags }, { data: settings }] = await Promise.all([
    supabase
      .from("feature_flags")
      .select("*")
      .order("category")
      .order("name"),
    supabase
      .from("platform_settings")
      .select("*")
      .order("key"),
  ]);

  const t = await getTranslations("admin.settings");

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-8 space-y-8">
        <FeatureFlagsPanel flags={flags ?? []} />
        <PlatformSettingsPanel settings={settings ?? []} />
      </div>
    </div>
  );
}