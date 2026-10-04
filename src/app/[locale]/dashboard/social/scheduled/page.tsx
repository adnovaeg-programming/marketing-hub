import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { ScheduledPostsList } from "@/components/social/scheduled-posts-list";

export default async function ScheduledPostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: posts } = await supabase
    .from("scheduled_posts")
    .select(
      `
      *,
      content:content_items (id, title, description),
      account:social_accounts (id, platform, account_name, status)
    `
    )
    .eq("workspace_id", workspaceId)
    .order("scheduled_for", { ascending: false })
    .limit(100);

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "connected");

  const t = await getTranslations("dashboard.social.scheduled");

  const normalized = (posts ?? []).map((p) => ({
    ...p,
    content: Array.isArray(p.content) ? p.content[0] ?? null : p.content,
    account: Array.isArray(p.account) ? p.account[0] ?? null : p.account,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ScheduledPostsList
        posts={normalized}
        accounts={accounts ?? []}
      />
    </div>
  );
}