import { redirect } from "next/navigation";
import { Users, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";
import { WorkspaceForm } from "@/components/settings/workspace-form";
import { OrganizationForm } from "@/components/settings/organization-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, phone, job_title, bio, country, city, timezone, language"
    )
    .eq("id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, description, slug, organization_id")
    .eq("id", member.workspace_id)
    .single();

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, website, description, owner_id")
    .eq("id", workspace?.organization_id ?? "")
    .maybeSingle();

  // نجيب الأعضاء
  const { data: members } = await supabase
    .from("workspace_members")
    .select(
      `
      id,
      role,
      joined_at,
      status,
      profile:profiles (id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("workspace_id", member.workspace_id)
    .eq("status", "active");

  const t = await getTranslations("dashboard.settings");
  const canEditWorkspace = member.role === "owner" || member.role === "admin";

  const normalizedMembers = (members ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    joinedAt: m.joined_at,
    profile: Array.isArray(m.profile) ? m.profile[0] : m.profile,
  }));

  const roleLabels: Record<string, string> = {
    owner: t("members.roles.owner"),
    admin: t("members.roles.admin"),
    member: t("members.roles.member"),
    client: t("members.roles.client"),
    viewer: t("members.roles.viewer"),
  };

  return (
    <div className="p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Profile */}
        <ProfileForm profile={profile} />

        {/* Workspace */}
        <WorkspaceForm workspace={workspace} canEdit={canEditWorkspace} />

        {/* Organization */}
        {organization?.owner_id === user.id && (
          <OrganizationForm organization={organization} />
        )}

        {/* Members */}
        <div className="glass-strong rounded-3xl p-6 md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{t("members.title")}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("members.subtitle", { count: normalizedMembers.length })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {normalizedMembers.map((m) => {
              const fullName =
                [m.profile?.first_name, m.profile?.last_name]
                  .filter(Boolean)
                  .join(" ") || m.profile?.email;

              const initial = (
                m.profile?.first_name?.charAt(0) ||
                m.profile?.email?.charAt(0) ||
                "?"
              ).toUpperCase();

              return (
                <div
                  key={m.id}
                  className="glass flex items-center gap-3 rounded-xl p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                    {initial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{fullName}</p>
                    {m.profile?.email && (
                      <p
                        className="truncate text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {m.profile.email}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Shield className="size-3" />
                    {roleLabels[m.role] ?? m.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}