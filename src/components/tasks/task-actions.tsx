"use client";

import { useState } from "react";
import { Loader2, Check, X, Send, Play, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/app/[locale]/dashboard/tasks/actions";

type Status = "todo" | "in_progress" | "review" | "completed" | "cancelled";

export function TaskActions({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const t = useTranslations("dashboard.tasks.actions");
  const [pending, setPending] = useState<string | null>(null);

  const handleUpdate = async (next: Status) => {
    setPending(next);
    await updateTaskStatusAction(taskId, next);
    setPending(null);
  };

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;
    setPending("delete");
    await deleteTaskAction(taskId);
  };

  const buttons: {
    key: Status;
    label: string;
    icon: typeof Check;
    variant: "default" | "outline" | "destructive";
  }[] = [];

  if (currentStatus === "todo") {
    buttons.push({
      key: "in_progress",
      label: t("start"),
      icon: Play,
      variant: "default",
    });
  }

  if (currentStatus === "in_progress") {
    buttons.push({
      key: "review",
      label: t("sendToReview"),
      icon: Send,
      variant: "default",
    });
  }

  if (currentStatus === "review") {
    buttons.push({
      key: "completed",
      label: t("complete"),
      icon: Check,
      variant: "default",
    });
  }

  if (currentStatus === "completed") {
    buttons.push({
      key: "todo",
      label: t("reopen"),
      icon: X,
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