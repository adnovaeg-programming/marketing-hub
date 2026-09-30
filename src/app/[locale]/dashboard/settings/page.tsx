import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) redirect("/onboarding");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .maybeSingle();

  if (!member) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, job_title, bio, country, city, timezone, language")
    .eq("id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, description, slug, organization_id")
    .eq("id", workspaceId)
    .single();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, website, description, owner_id")
    .eq("id", workspace?.organization_id ?? "")
    .maybeSingle();

  const { data: members } = await supabase
    .from("workspace_members")
    .select(
      `
      id, role, joined_at, status,
      profile:profiles (id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  const { data: pendingInvitations } = await supabase
    .from("workspace_invitations")
    .select("id, email, role, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.settings");

  const canEditWorkspace = member.role === "owner" || member.role === "admin";

  const normalizedMembers = (members ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    joinedAt: m.joined_at,
    profile: Array.isArray(m.profile) ? m.profile[0] : m.profile,
  }));

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <SettingsTabs
        profile={profile}
        workspace={workspace}
        organization={organization}
        members={normalizedMembers}
        invitations={pendingInvitations ?? []}
        canEditWorkspace={canEditWorkspace}
        currentUserId={user.id}
      />
    </div>
  );
}