"use client";

import { useState, useTransition } from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createApiKeyAction,
  deleteApiKeyAction,
  revokeApiKeyAction,
} from "@/lib/api-keys/actions";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export function ApiKeysList({ keys }: { keys: ApiKey[] }) {
  const t = useTranslations("dashboard.apiKeys");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    startTransition(async () => {
      const result = await createApiKeyAction(name, ["read", "write"]);
      if (!result.success) {
        toast.error("فشل الإنشاء");
        return;
      }
      setNewKey(result.data.rawKey);
      setName("");
      router.refresh();
    });
  };

  const handleCopy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteApiKeyAction(id);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  };

  const handleRevoke = (id: string) => {
    if (!confirm(t("confirmRevoke"))) return;
    startTransition(async () => {
      const result = await revokeApiKeyAction(id);
      if (!result.success) {
        toast.error("فشل الإلغاء");
        return;
      }
      toast.success(t("revoked"));
      router.refresh();
    });
  };

  return (
    <>
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="glass flex size-10 items-center justify-center rounded-xl">
              <Key className="size-5 text-primary" />
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

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Key className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className="glass flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{key.name}</p>
                    {!key.is_active && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[9px] font-medium text-destructive">
                        {t("revoked")}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {key.key_prefix}••••••
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    <span>
                      {t("createdAt")}:{" "}
                      {new Date(key.created_at).toLocaleDateString()}
                    </span>
                    {key.last_used_at && (
                      <span>
                        {t("lastUsed")}:{" "}
                        {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  {key.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(key.id)}
                      disabled={pending}
                      className="rounded-lg text-xs text-muted-foreground"
                    >
                      {t("revoke")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(key.id)}
                    disabled={pending}
                    className="size-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) {
            setNewKey(null);
            setName("");
            setCopied(false);
          }
        }}
      >
        <DialogContent className="glass-strong max-w-md">
          {!newKey ? (
            <>
              <DialogHeader>
                <DialogTitle>{t("createTitle")}</DialogTitle>
                <DialogDescription>{t("createDescription")}</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">{t("name")}</Label>
                  <Input
                    id="keyName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("namePlaceholder")}
                    className="h-11 rounded-xl"
                    autoFocus
                  />
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

              <div className="space-y-4">
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{t("saveWarning")}</p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newKey}
                    readOnly
                    className="h-11 rounded-xl font-mono text-xs"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopy}
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
                  onClick={() => {
                    setDialogOpen(false);
                    setNewKey(null);
                  }}
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