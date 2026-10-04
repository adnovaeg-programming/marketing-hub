"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  CalendarClock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { ConnectAccountDialog } from "@/components/social/connect-account-dialog";
import {
  PlatformBadge,
  PLATFORM_LABELS,
} from "@/components/social/platform-badges";
import {
  deleteSocialAccountAction,
  disconnectSocialAccountAction,
} from "@/lib/publishing/actions";

type Account = {
  id: string;
  platform: string;
  account_name: string;
  external_account_id: string | null;
  status: string;
  last_synced_at: string | null;
  connected_at: string;
};

const AVAILABLE_PLATFORMS = [
  "instagram",
  "facebook",
  "tiktok",
  "x",
  "linkedin",
  "youtube",
];

export function SocialAccountsGrid({ accounts }: { accounts: Account[] }) {
  const t = useTranslations("dashboard.social");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDisconnect = (id: string) => {
    if (!confirm(t("confirmDisconnect"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await disconnectSocialAccountAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الفصل");
        return;
      }
      toast.success(t("disconnected"));
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await deleteSocialAccountAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  };

  const connectedPlatforms = new Set(
    accounts.filter((a) => a.status === "connected").map((a) => a.platform)
  );
  const availableToConnect = AVAILABLE_PLATFORMS.filter(
    (p) => !connectedPlatforms.has(p)
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/social/scheduled"
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-muted/50"
        >
          <CalendarClock className="size-4" />
          {t("scheduledPosts")}
        </Link>

        {availableToConnect.length > 0 && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            <Plus className="size-4" />
            {t("connectAccount")}
          </Button>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="glass-strong mt-8 flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
            <Calendar className="size-10 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            <Plus className="size-4" />
            {t("connectAccount")}
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const isConnected = account.status === "connected";
            const isProcessing = pending && actionId === account.id;

            return (
              <div
                key={account.id}
                className={`glass-strong relative overflow-hidden rounded-2xl p-5 ${
                  isConnected ? "ring-2 ring-emerald-500/30" : ""
                }`}
              >
                <div className="absolute end-3 top-3">
                  {isConnected ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-2.5" />
                      {t("status.connected")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400">
                      <AlertCircle className="size-2.5" />
                      {t(`status.${account.status}`)}
                    </span>
                  )}
                </div>

                <PlatformBadge platform={account.platform} size="lg" />

                <h3 className="mt-4 font-semibold">{account.account_name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {PLATFORM_LABELS[account.platform] ?? account.platform}
                </p>

                {account.external_account_id && (
                  <p
                    className="mt-1 truncate font-mono text-[10px] text-muted-foreground/60"
                    dir="ltr"
                  >
                    {account.external_account_id}
                  </p>
                )}

                <div className="mt-4 flex gap-2 border-t border-border/40 pt-4">
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={isProcessing}
                      className="glass flex-1 rounded-lg text-xs"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      {t("disconnect")}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info(t("reconnectComingSoon"));
                      }}
                      disabled={isProcessing}
                      className="glass flex-1 rounded-lg text-xs"
                    >
                      {t("reconnect")}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                    disabled={isProcessing}
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConnectAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        availablePlatforms={availableToConnect}
      />
    </>
  );
}