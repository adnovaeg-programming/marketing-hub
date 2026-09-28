import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { NewContentDialog } from "@/components/content/new-content-dialog";
import { ContentCard } from "@/components/content/content-card";

export default async function ContentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/onboarding");

  const { data: items } = await supabase
    .from("content_items")
    .select(
      `
      id,
      title,
      content_type,
      platform,
      status,
      priority,
      scheduled_at,
      client:clients (id, name)
    `
    )
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.content");

  const normalizedItems = (items ?? []).map((item) => ({
    ...item,
    client: Array.isArray(item.client)
      ? item.client[0] ?? null
      : item.client,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", { count: normalizedItems.length })}
          </p>
        </div>

        <NewContentDialog />
      </div>

      {normalizedItems.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <FileText className="size-8 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <div className="mt-6">
            <NewContentDialog />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {normalizedItems.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}