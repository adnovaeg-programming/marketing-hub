"use client";

import { useState, useTransition } from "react";
import { X, Trash2, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  bulkDeleteTasksAction,
  bulkUpdateTasksStatusAction,
} from "@/app/[locale]/dashboard/tasks/actions";

type Status = "todo" | "in_progress" | "review" | "completed";

export function BulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const t = useTranslations("dashboard.bulk");
  const tTasks = useTranslations("dashboard.tasks");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleBulkDelete = () => {
    if (!confirm(t("confirmDelete", { count: selectedIds.length }))) return;

    startTransition(async () => {
      setAction("delete");
      const result = await bulkDeleteTasksAction(selectedIds);
      setAction(null);

      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }

      toast.success(`تم حذف ${result.count} مهمة`);
      onClear();
      router.refresh();
    });
  };

  const handleBulkStatus = (status: Status) => {
    startTransition(async () => {
      setAction(`status-${status}`);
      const result = await bulkUpdateTasksStatusAction(selectedIds, status);
      setAction(null);

      if (!result.success) {
        toast.error("فشل التحديث");
        return;
      }

      toast.success(`تم تحديث ${result.count} مهمة`);
      onClear();
      router.refresh();
    });
  };

  return (
    <div className="animate-fade-in-up fixed bottom-6 start-1/2 z-50 -translate-x-1/2 rtl:translate-x-1/2">
      <div className="glass-strong flex items-center gap-2 rounded-2xl border border-primary/30 p-2 shadow-2xl shadow-primary/20">
        {/* Count + Close */}
        <div className="flex items-center gap-2 pe-3 border-e border-border/40">
          <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">
            {selectedIds.length}
          </span>
          <button
            onClick={onClear}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label={t("clear")}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkStatus("todo")}
            disabled={pending}
            className="rounded-lg text-xs"
          >
            {action === "status-todo" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {tTasks("statuses.todo")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkStatus("in_progress")}
            disabled={pending}
            className="rounded-lg text-xs"
          >
            {action === "status-in_progress" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {tTasks("statuses.in_progress")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleBulkStatus("completed")}
            disabled={pending}
            className="rounded-lg text-xs text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            {action === "status-completed" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            {tTasks("statuses.completed")}
          </Button>
        </div>

        {/* Delete */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleBulkDelete}
          disabled={pending}
          className="rounded-lg text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {action === "delete" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}