"use client";

import { useState } from "react";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { clientReviewContentAction } from "@/app/[locale]/portal/actions";

export function ApprovalActions({ contentId }: { contentId: string }) {
  const t = useTranslations("dashboard.portal");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handle = async (decision: "approve" | "reject") => {
    setError(null);
    setPending(decision);

    const result = await clientReviewContentAction(
      contentId,
      decision,
      comment
    );

    setPending(null);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/portal/approvals");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("addNote")}</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("notePlaceholder")}
          rows={3}
          disabled={pending !== null}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => handle("approve")}
          disabled={pending !== null}
          className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {pending === "approve" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {t("approve")}
        </Button>
        <Button
          onClick={() => handle("reject")}
          disabled={pending !== null}
          variant="outline"
          className="flex-1 rounded-xl text-destructive hover:bg-destructive/10"
        >
          {pending === "reject" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <X className="size-4" />
          )}
          {t("requestChanges")}
        </Button>
      </div>
    </div>
  );
}