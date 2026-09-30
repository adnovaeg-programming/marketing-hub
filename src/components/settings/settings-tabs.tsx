"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Users,
  Mail,
  Briefcase,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ProfileForm } from "@/components/settings/profile-form";
import { WorkspaceForm } from "@/components/settings/workspace-form";
import { OrganizationForm } from "@/components/settings/organization-form";
import { MembersTab } from "@/components/settings/members-tab";

type Tab = "profile" | "workspace" | "organization" | "members";

export function SettingsTabs({
  profile,
  workspace,
  organization,
  members,
  invitations,
  canEditWorkspace,
  currentUserId,
}: {
  profile: any;
  workspace: any;
  organization: any;
  members: any[];
  invitations: any[];
  canEditWorkspace: boolean;
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.settings.tabs");
  const [tab, setTab] = useState<Tab>("profile");

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profile", label: t("profile"), icon: User },
    { key: "workspace", label: t("workspace"), icon: Briefcase },
    { key: "organization", label: t("organization"), icon: Building2 },
    { key: "members", label: t("members"), icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs nav */}
      <div className="glass flex items-center gap-1 overflow-x-auto rounded-2xl p-1.5">
        {tabs.map((tItem) => {
          const Icon = tItem.icon;
          const isActive = tab === tItem.key;
          return (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30" />
              )}
              <Icon
                className={`relative size-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : ""
                }`}
              />
              <span className="relative">{tItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in-up">
        {tab === "profile" && <ProfileForm profile={profile} />}
        {tab === "workspace" && (
          <WorkspaceForm workspace={workspace} canEdit={canEditWorkspace} />
        )}
        {tab === "organization" && (
          <OrganizationForm organization={organization} />
        )}
        {tab === "members" && (
          <MembersTab
            members={members}
            invitations={invitations}
            canEdit={canEditWorkspace}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}