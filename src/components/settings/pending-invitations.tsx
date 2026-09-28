"use client";

import { useState } from "react";
import { Loader2, X, Clock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cancelInvitationAction } from "@/app/[locale]/dashboard/settings/invitations-actions";

type Invitation = {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
};

export function PendingInvitations({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const t = useTranslations("dashboard.settings.members.pending");
  const tRoles = useTranslations("dashboard.settings.members.roles");
  const [pending, setPending] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm(t("confirmCancel"))) return;
    setPending(id);
    await cancelInvitationAction(id);
    setPending(null);
  };

  if (invitations.length === 0) return null;

  return (
    <div className="mt-6 border-t border-border/40 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <Mail className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{t("title")}</h3>
      </div>

      <div className="space-y-2">
        {invitations.map((inv) => {
          const expiresIn = Math.ceil(
            (new Date(inv.expires_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={inv.id}
              className="glass flex items-center gap-3 rounded-xl p-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" dir="ltr">
                  {inv.email}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                    {tRoles(inv.role)}
                  </span>
                  <span>
                    {t("expiresIn", { days: expiresIn > 0 ? expiresIn : 0 })}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancel(inv.id)}
                disabled={pending === inv.id}
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label={t("cancel")}
              >
                {pending === inv.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <X className="size-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}