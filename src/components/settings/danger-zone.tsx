"use client";

import { useState } from "react";
import {
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  exportUserDataAction,
  requestAccountDeletionAction,
} from "@/app/[locale]/dashboard/settings/gdpr-actions";

export function DangerZone() {
  const t = useTranslations("dashboard.settings.dangerZone");
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    const result = await exportUserDataAction();
    setExporting(false);

    if (!result.success) {
      toast.error("فشل تصدير البيانات");
      return;
    }

    const json = JSON.stringify(result.data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `marketing-hub-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("تم تصدير بياناتك");
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("اكتب DELETE للتأكيد");
      return;
    }

    setDeleting(true);
    const result = await requestAccountDeletionAction();
    setDeleting(false);

    if (!result.success) {
      toast.error("فشل حذف الحساب");
      return;
    }

    toast.success("تم حذف حسابك");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1000);
  };

  return (
    <div className="rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6 md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="size-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-destructive">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Export */}
        <div className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">{t("export.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("export.description")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-full"
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {t("export.button")}
          </Button>
        </div>

        {/* Delete */}
        <div className="glass flex flex-col gap-4 rounded-2xl border border-destructive/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-destructive">
              {t("delete.title")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("delete.description")}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="rounded-full"
          >
            <Trash2 className="size-4" />
            {t("delete.button")}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="size-7 text-destructive" />
            </div>
            <DialogTitle className="mt-4 text-center">
              {t("delete.confirmTitle")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("delete.confirmDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">
                {t("delete.typeToConfirm")}
              </label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="h-11 rounded-xl text-center font-mono"
                dir="ltr"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteConfirm("");
              }}
              disabled={deleting}
              className="rounded-xl"
            >
              {t("delete.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== "DELETE"}
              className="rounded-xl"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              {t("delete.confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}