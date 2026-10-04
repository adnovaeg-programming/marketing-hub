"use client";

import { useState, useTransition } from "react";
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  Power,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AVAILABLE_WEBHOOK_EVENTS,
  createWebhookAction,
  deleteWebhookAction,
  toggleWebhookAction,
} from "@/lib/webhooks/actions";

type Webhook = {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  failure_count: number;
  created_at: string;
};

export function WebhooksList({ webhooks }: { webhooks: Webhook[] }) {
  const t = useTranslations("dashboard.webhooks");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setName("");
    setUrl("");
    setSelectedEvents([]);
    setNewSecret(null);
    setCopied(false);
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || selectedEvents.length === 0) {
      toast.error(t("fillRequired"));
      return;
    }

    startTransition(async () => {
      const result = await createWebhookAction({
        name,
        url,
        events: selectedEvents,
      });
      if (!result.success) {
        toast.error(t(`errors.${result.error}`, { default: "فشل الإنشاء" }));
        return;
      }
      setNewSecret(result.data.secret);
      router.refresh();
    });
  };

  const handleCopySecret = async () => {
    if (!newSecret) return;
    await navigator.clipboard.writeText(newSecret);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      const result = await toggleWebhookAction(id, !isActive);
      if (!result.success) {
        toast.error("فشل التحديث");
        return;
      }
      toast.success(!isActive ? t("enabled") : t("disabled"));
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteWebhookAction(id);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  };

  return (
    <>
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="glass flex size-10 items-center justify-center rounded-xl">
              <WebhookIcon className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{t("listTitle")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("listSubtitle")}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            <Plus className="size-4" />
            {t("create")}
          </Button>
        </div>

        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <WebhookIcon className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="glass rounded-xl p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{wh.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          wh.is_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {wh.is_active ? t("active") : t("inactive")}
                      </span>
                      {wh.failure_count > 0 && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-medium text-destructive">
                          {wh.failure_count} {t("failures")}
                        </span>
                      )}
                    </div>
                    <p
                      className="mt-1 truncate font-mono text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {wh.url}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {wh.events.length} {t("events")}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(wh.id, wh.is_active)}
                      disabled={pending}
                      className="size-8"
                    >
                      <Power
                        className={`size-3.5 ${
                          wh.is_active ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(wh.id)}
                      disabled={pending}
                      className="size-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="glass-strong max-h-[90vh] max-w-lg overflow-y-auto">
          {!newSecret ? (
            <>
              <DialogHeader>
                <DialogTitle>{t("createTitle")}</DialogTitle>
                <DialogDescription>{t("createDescription")}</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whName">{t("name")}</Label>
                  <Input
                    id="whName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whUrl">{t("url")}</Label>
                  <Input
                    id="whUrl"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-app.com/webhook"
                    className="h-11 rounded-xl"
                    dir="ltr"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {t("httpsNote")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t("eventsLabel")}</Label>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border/40 p-3">
                    {AVAILABLE_WEBHOOK_EVENTS.map((event) => (
                      <label
                        key={event}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-muted/30"
                      >
                        <Checkbox
                          checked={selectedEvents.includes(event)}
                          onCheckedChange={() => toggleEvent(event)}
                        />
                        <span className="font-mono text-xs" dir="ltr">
                          {event}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
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
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    {t("submit")}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("successTitle")}</DialogTitle>
                <DialogDescription>{t("successDescription")}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  {t("saveSecretWarning")}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSecret}
                    readOnly
                    className="h-11 rounded-xl font-mono text-xs"
                    dir="ltr"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopySecret}
                    className="h-11 shrink-0 rounded-xl"
                  >
                    {copied ? (
                      <Check className="size-4 text-emerald-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setDialogOpen(false)}
                  className="w-full rounded-xl"
                >
                  {t("done")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}