"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlatformBadge,
  PLATFORM_LABELS,
} from "@/components/social/platform-badges";
import { connectSocialAccountAction } from "@/lib/publishing/actions";

export function ConnectAccountDialog({
  open,
  onOpenChange,
  availablePlatforms,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePlatforms: string[];
}) {
  const t = useTranslations("dashboard.social.connect");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedPlatform, setSelectedPlatform] = useState(
    availablePlatforms[0] ?? ""
  );
  const [accountName, setAccountName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlatform || !accountName.trim()) {
      toast.error(t("fillRequired"));
      return;
    }

    startTransition(async () => {
      const result = await connectSocialAccountAction({
        platform: selectedPlatform,
        accountName,
      });

      if (!result.success) {
        toast.error("فشل الربط");
        return;
      }

      toast.success(t("success"), {
        description: t("successDescription", {
          platform: PLATFORM_LABELS[selectedPlatform] ?? selectedPlatform,
        }),
      });

      setAccountName("");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("platform")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {availablePlatforms.map((platform) => {
                const isActive = selectedPlatform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setSelectedPlatform(platform)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "glass text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <PlatformBadge platform={platform} size="md" />
                    <span className="text-[10px] font-medium">
                      {PLATFORM_LABELS[platform] ?? platform}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">{t("accountName")}</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder={t("accountNamePlaceholder")}
              className="h-11 rounded-xl"
              required
            />
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            {t("oauthNote")}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}