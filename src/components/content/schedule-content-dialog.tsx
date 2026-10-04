"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Loader2,
  CalendarClock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import {
  PlatformBadge,
  PLATFORM_LABELS,
} from "@/components/social/platform-badges";
import { scheduleContentAction } from "@/lib/publishing/content-actions";

type SocialAccount = {
  id: string;
  platform: string;
  account_name: string;
  status: string;
};

export function ScheduleContentDialog({
  contentItemId,
  defaultCaption,
}: {
  contentItemId: string;
  defaultCaption?: string;
}) {
  const t = useTranslations("dashboard.content.schedule");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [caption, setCaption] = useState(defaultCaption ?? "");
  const [scheduledFor, setScheduledFor] = useState(() => {
    // الافتراضي: بعد ساعة من الآن بصيغة datetime-local
    const d = new Date(Date.now() + 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  // نجيب الحسابات عند فتح الـ Dialog
  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoadingAccounts(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("social_accounts")
        .select("id, platform, account_name, status")
        .eq("status", "connected")
        .order("created_at", { ascending: false });

      setAccounts(data ?? []);
      if (data && data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
      setLoadingAccounts(false);
    };

    load();
  }, [open, selectedAccountId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAccountId) {
      toast.error(t("selectAccount"));
      return;
    }

    if (!scheduledFor) {
      toast.error(t("selectTime"));
      return;
    }

    startTransition(async () => {
      const result = await scheduleContentAction({
        contentItemId,
        socialAccountId: selectedAccountId,
        caption,
        scheduledFor,
      });

      if (!result.success) {
        const errorKey = `errors.${result.error}`;
        toast.error(t.has(errorKey) ? t(errorKey) : "فشل الجدولة");
        return;
      }

      toast.success(t("success"), {
        description: t("successDescription"),
      });

      setOpen(false);
      router.refresh();
    });
  };

  const hasAccounts = accounts.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30">
          <CalendarClock className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-strong max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <CalendarClock className="size-7 text-white" />
          </div>
          <DialogTitle className="mt-4 text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {!hasAccounts && !loadingAccounts ? (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">{t("noAccounts.title")}</p>
                <p className="mt-1 text-xs">{t("noAccounts.description")}</p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/dashboard/social");
                }}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent"
              >
                {t("noAccounts.cta")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Selector */}
            <div className="space-y-2">
              <Label>{t("account")}</Label>
              {loadingAccounts ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid gap-2">
                  {accounts.map((account) => {
                    const isSelected = selectedAccountId === account.id;
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => setSelectedAccountId(account.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "glass hover:border-primary/40"
                        }`}
                      >
                        <PlatformBadge platform={account.platform} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {account.account_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {PLATFORM_LABELS[account.platform] ??
                              account.platform}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="size-5 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">{t("caption")}</Label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t("captionPlaceholder")}
                rows={3}
                className="rounded-xl"
              />
            </div>

            {/* Schedule Time */}
            <div className="space-y-2">
              <Label htmlFor="scheduledFor">{t("scheduledFor")}</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="h-11 rounded-xl"
                dir="ltr"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                {t("timeNote")}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-xl"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={pending || !selectedAccountId}
                className="rounded-xl bg-gradient-to-r from-primary to-accent"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarClock className="size-4" />
                )}
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}