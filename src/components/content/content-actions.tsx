"use client";

import { useState } from "react";
import { Loader2, Check, X, Send, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteContentAction,
  updateContentStatusAction,
} from "@/app/[locale]/dashboard/content/actions";

type Status =
  | "draft"
  | "internal_review"
  | "client_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "archived";

export function ContentActions({
  contentId,
  currentStatus,
}: {
  contentId: string;
  currentStatus: string;
}) {
  const t = useTranslations("dashboard.content.actions");
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const handleUpdate = async (next: Status) => {
    setPending(next);
    const result = await updateContentStatusAction(contentId, next);
    setPending(null);

    if (!result.success) {
      toast.error("فشل تحديث الحالة");
      return;
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;

    setPending("delete");
    const result = await deleteContentAction(contentId);

    if (!result.success) {
      toast.error("فشل الحذف");
      setPending(null);
      return;
    }

    toast.success("تم حذف المحتوى");

    // ✅ نرجع لصفحة قائمة المحتوى
    window.location.href = "/ar/dashboard/content";
  };

  const buttons: {
    key: Status;
    label: string;
    icon: typeof Check;
    variant: "default" | "outline" | "destructive";
  }[] = [];

  if (currentStatus === "draft") {
    buttons.push({
      key: "internal_review",
      label: t("sendToReview"),
      icon: Send,
      variant: "default",
    });
  }

  if (currentStatus === "internal_review") {
    buttons.push({
      key: "client_review",
      label: t("sendToClient"),
      icon: Send,
      variant: "default",
    });
  }

  if (currentStatus === "client_review") {
    buttons.push({
      key: "approved",
      label: t("approve"),
      icon: Check,
      variant: "default",
    });
    buttons.push({
      key: "rejected",
      label: t("reject"),
      icon: X,
      variant: "outline",
    });
  }

  if (currentStatus === "approved") {
    buttons.push({
      key: "published",
      label: t("publish"),
      icon: Check,
      variant: "default",
    });
  }

  if (currentStatus === "rejected") {
    buttons.push({
      key: "draft",
      label: t("backToDraft"),
      icon: Send,
      variant: "outline",
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((btn) => {
        const Icon = btn.icon;
        return (
          <Button
            key={btn.key}
            variant={btn.variant}
            size="sm"
            onClick={() => handleUpdate(btn.key)}
            disabled={pending !== null}
            className="rounded-full"
          >
            {pending === btn.key ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Icon className="size-4" />
            )}
            {btn.label}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={pending !== null}
        className="rounded-full text-muted-foreground hover:text-destructive"
      >
        {pending === "delete" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        {t("delete")}
      </Button>
    </div>
  );
}