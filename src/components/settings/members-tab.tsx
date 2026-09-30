"use client";

import { Users, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { PendingInvitations } from "@/components/settings/pending-invitations";

type Member = {
  id: string;
  role: string;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
};

export function MembersTab({
  members,
  invitations,
  canEdit,
  currentUserId,
}: {
  members: Member[];
  invitations: Invitation[];
  canEdit: boolean;
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.settings.members");

  const roleLabels: Record<string, string> = {
    owner: t("roles.owner"),
    admin: t("roles.admin"),
    member: t("roles.member"),
    client: t("roles.client"),
    viewer: t("roles.viewer"),
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass flex size-10 items-center justify-center rounded-xl">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t("title")}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("subtitle", { count: members.length })}
              </p>
            </div>
          </div>

          {canEdit && <InviteMemberDialog />}
        </div>

        <div className="space-y-2">
          {members.map((m) => {
            const fullName =
              [m.profile?.first_name, m.profile?.last_name]
                .filter(Boolean)
                .join(" ") || m.profile?.email || "—";

            const initial = (
              m.profile?.first_name?.charAt(0) ||
              m.profile?.email?.charAt(0) ||
              "?"
            ).toUpperCase();

            const isYou = m.profile?.id === currentUserId;

            return (
              <div
                key={m.id}
                className="glass glass-hover flex items-center gap-3 rounded-xl p-3"
              >
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-md shadow-primary/30">
                  {initial}
                  {isYou && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {fullName}
                    {isYou && (
                      <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {t("you")}
                      </span>
                    )}
                  </p>
                  {m.profile?.email && (
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">
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

        {invitations.length > 0 && (
          <PendingInvitations invitations={invitations} />
        )}
      </div>
    </div>
  );
}