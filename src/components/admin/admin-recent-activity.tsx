"use client";

import {
  UserPlus,
  FileText,
  FolderKanban,
  CheckSquare,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useTranslations } from "next-intl";

type Log = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_name: string | null;
  severity: string;
  actor_email: string | null;
  created_at: string;
};

const ACTION_ICONS: Record<string, typeof Activity> = {
  "client.create": UserPlus,
  "client.delete": Trash2,
  "project.create": FolderKanban,
  "task.create": CheckSquare,
  "task.delete": Trash2,
  "content.create": FileText,
  "admin.user_suspend": ShieldAlert,
};

function iconFor(action: string) {
  if (action.startsWith("task.")) return CheckSquare;
  if (action.startsWith("content.")) return FileText;
  if (action.startsWith("project.")) return FolderKanban;
  if (action.startsWith("client.")) return UserPlus;
  if (action.startsWith("admin.")) return ShieldAlert;
  return Activity;
}

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  critical: "bg-destructive/10 text-destructive",
};

export function AdminRecentActivity({ logs }: { logs: Log[] }) {
  const t = useTranslations("admin.overview");

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{t("recentActivity")}</h2>
      </div>

      {logs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t("noActivity")}
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = iconFor(log.action);
            const isCritical = log.severity === "critical";
            return (
              <div
                key={log.id}
                className="glass flex items-center gap-3 rounded-xl p-3"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    SEVERITY_COLORS[log.severity] ?? SEVERITY_COLORS.info
                  }`}
                >
                  {isCritical ? (
                    <AlertTriangle className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {log.action}
                    {log.entity_name && (
                      <span className="ms-1 text-muted-foreground">
                        — {log.entity_name}
                      </span>
                    )}
                  </p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    dir="ltr"
                  >
                    {log.actor_email ?? "system"}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground/70">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}