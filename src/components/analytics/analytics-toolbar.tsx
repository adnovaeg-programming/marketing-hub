"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function AnalyticsToolbar({
  exportData,
}: {
  exportData: {
    kpis: Record<string, number>;
    contentByStatus: Record<string, number>;
    projectsByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
  };
}) {
  const t = useTranslations("dashboard.analytics");

  const handleExportCSV = () => {
    try {
      const rows: string[][] = [["Category", "Key", "Value"]];

      Object.entries(exportData.kpis).forEach(([k, v]) => {
        rows.push(["KPI", k, String(v)]);
      });

      Object.entries(exportData.contentByStatus).forEach(([k, v]) => {
        rows.push(["Content by status", k, String(v)]);
      });

      Object.entries(exportData.projectsByStatus).forEach(([k, v]) => {
        rows.push(["Projects by status", k, String(v)]);
      });

      Object.entries(exportData.tasksByPriority).forEach(([k, v]) => {
        rows.push(["Tasks by priority", k, String(v)]);
      });

      const csv = rows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `marketing-hub-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(t("exported"));
    } catch {
      toast.error(t("exportError"));
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExportCSV}
      className="glass rounded-full"
    >
      <Download className="size-4" />
      {t("exportCsv")}
    </Button>
  );
}