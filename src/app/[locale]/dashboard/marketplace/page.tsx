import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { DashboardListings } from "@/components/marketplace/dashboard-listings";

export default async function DashboardMarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const [{ data: listings }, { data: categories }] = await Promise.all([
    supabase
      .from("service_listings")
      .select(
        `
        id, title, slug, status, base_price, currency,
        delivery_days, views_count, orders_count,
        featured, rating_avg, rating_count, created_at,
        category:service_categories (id, name)
      `
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),

    supabase
      .from("service_categories")
      .select("id, name, name_en, slug, icon")
      .eq("is_active", true)
      .order("order_index"),
  ]);

  const t = await getTranslations("dashboard.marketplace");

  const normalized = (listings ?? []).map((l) => ({
    ...l,
    category: Array.isArray(l.category) ? l.category[0] ?? null : l.category,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <DashboardListings
        listings={normalized}
        categories={categories ?? []}
      />
    </div>
  );
}