import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ContentGrid } from "@/components/content/content-grid";

export default async function ContentPage() {
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
      description,
      content_type,
      platform,
      status,
      priority,
      scheduled_at,
      published_at,
      created_at,
      client:clients (id, name),
      project:projects (id, name)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.content");

  const normalized = (items ?? []).map((item) => ({
    ...item,
    client: Array.isArray(item.client) ? item.client[0] ?? null : item.client,
    project: Array.isArray(item.project)
      ? item.project[0] ?? null
      : item.project,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", { count: normalized.length })}
          </p>
        </div>
      </div>

      <ContentGrid items={normalized} />
    </div>
  );
}