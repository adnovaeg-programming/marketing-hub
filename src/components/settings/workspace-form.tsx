"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateWorkspaceAction } from "@/app/[locale]/dashboard/settings/actions";

type Workspace = {
  name: string;
  description: string | null;
  slug: string;
};

export function WorkspaceForm({
  workspace,
  canEdit,
}: {
  workspace: Workspace | null;
  canEdit: boolean;
}) {
  const t = useTranslations("dashboard.settings.workspace");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const result = await updateWorkspaceAction({
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? ""),
    });

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {!canEdit && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
          {t("readOnly")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")} *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={workspace?.name ?? ""}
            required
            disabled={!canEdit}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">{t("slug")}</Label>
          <Input
            id="slug"
            defaultValue={workspace?.slug ?? ""}
            disabled
            className="h-11 font-mono text-xs"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">{t("slugNote")}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t("descriptionLabel")}</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={workspace?.description ?? ""}
            placeholder={t("descriptionPlaceholder")}
            disabled={!canEdit}
            rows={3}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>{t("success")}</span>
          </div>
        )}

        {canEdit && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={pending}
              className="rounded-full px-6"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {t("submit")}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}