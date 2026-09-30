import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { CalendarView } from "@/components/content/calendar-view";

export default async function ContentCalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: items } = await supabase
    .from("content_items")
    .select(
      `
      id,
      title,
      status,
      platform,
      content_type,
      scheduled_at,
      client:clients (id, name)
    `
    )
    .eq("workspace_id", workspaceId)
    .not("scheduled_at", "is", null)
    .order("scheduled_at", { ascending: true });

  const t = await getTranslations("dashboard.content.calendar");

  const normalized = (items ?? []).map((item) => ({
    ...item,
    client: Array.isArray(item.client) ? item.client[0] ?? null : item.client,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <CalendarView items={normalized} />
    </div>
  );
}