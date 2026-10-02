import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { MessagingPanel } from "@/components/messaging/messaging-panel";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id, type, title, last_message_at, last_message_preview,
      reference_type, reference_id, created_at,
      members:conversation_members (
        user_id, last_read_at,
        user:profiles (id, first_name, last_name, email, avatar_url)
      )
    `
    )
    .eq("workspace_id", workspaceId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  const t = await getTranslations("dashboard.messages");

  const normalized = (conversations ?? []).map((c) => ({
    ...c,
    members: (c.members ?? []).map((m: never) => ({
      ...m,
      user: Array.isArray((m as never as { user: unknown }).user)
        ? ((m as never as { user: unknown[] }).user[0] ?? null)
        : (m as never as { user: unknown }).user,
    })),
  }));

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col p-6 md:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <MessagingPanel
        conversations={normalized}
        currentUserId={user.id}
      />
    </div>
  );
}