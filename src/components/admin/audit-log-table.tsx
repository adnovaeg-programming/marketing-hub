"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Search, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

type Log = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  severity: string;
  actor_email: string | null;
  metadata: unknown;
  created_at: string;
};

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const SEVERITY_ICONS: Record<string, typeof Info> = {
  info: Info,
  warning: AlertCircle,
  critical: AlertTriangle,
};

type SeverityFilter = "all" | "info" | "warning" | "critical";

export function AuditLogTable({ logs }: { logs: Log[] }) {
  const t = useTranslations("admin.audit");
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return logs.filter((log) => {
      if (severityFilter !== "all" && log.severity !== severityFilter)
        return false;
      if (!q) return true;
      return (
        log.action.toLowerCase().includes(q) ||
        log.actor_email?.toLowerCase().includes(q) ||
        log.entity_name?.toLowerCase().includes(q)
      );
    });
  }, [logs, deferredQuery, severityFilter]);

  const filters: { key: SeverityFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "info", label: t("severities.info") },
    { key: "warning", label: t("severities.warning") },
    { key: "critical", label: t("severities.critical") },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        <div className="glass flex items-center gap-1 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSeverityFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                severityFilter === f.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-6 flex flex-col items-center justify-center rounded-3xl py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="glass-strong mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr className="text-xs text-muted-foreground">
                  <th className="p-3 text-start">{t("cols.severity")}</th>
                  <th className="p-3 text-start">{t("cols.action")}</th>
                  <th className="p-3 text-start">{t("cols.entity")}</th>
                  <th className="p-3 text-start">{t("cols.actor")}</th>
                  <th className="p-3 text-start">{t("cols.time")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const SevIcon = SEVERITY_ICONS[log.severity] ?? Info;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-border/20 transition hover:bg-muted/30"
                    >
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                            SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.info
                          }`}
                        >
                          <SevIcon className="size-3" />
                          {t(`severities.${log.severity}`)}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-xs">{log.action}</span>
                      </td>
                      <td className="p-3">
                        {log.entity_name ? (
                          <span className="text-xs">{log.entity_name}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className="text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {log.actor_email ?? "system"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className="text-xs text-muted-foreground/70"
                          dir="ltr"
                        >
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t("count", { count: filtered.length })}
      </p>
    </>
  );
}