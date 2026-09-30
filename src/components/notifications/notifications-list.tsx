"use client";

import { useState, useMemo } from "react";
import { Bell, Check, Trash2, Loader2, CheckCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "@/app/[locale]/dashboard/notifications/actions";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
};

type Filter = "all" | "unread" | "read";

function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(
    locale === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function NotificationsList({
  notifications: initial,
}: {
  notifications: Notification[];
}) {
  const t = useTranslations("dashboard.notifications");
  const router = useRouter();
  const [notifications, setNotifications] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, setPending] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read_at);
    if (filter === "read") return notifications.filter((n) => n.read_at);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleOpen = async (n: Notification) => {
    if (!n.read_at) {
      setNotifications((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
        )
      );
      await markNotificationReadAction(n.id);
    }
    if (n.action_url) window.location.href = n.action_url;
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPending(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotificationAction(id);
    setPending(null);
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await markAllNotificationsReadAction();
    setNotifications((prev) =>
      prev.map((n) =>
        n.read_at ? n : { ...n, read_at: new Date().toISOString() }
      )
    );
    setMarkingAll(false);
    router.refresh();
  };

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: t("filters.all"), count: notifications.length },
    { key: "unread", label: t("filters.unread"), count: unreadCount },
    { key: "read", label: t("filters.read") },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass flex items-center gap-1 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                    filter === f.key
                      ? "bg-white/20"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:opacity-80"
          >
            {markingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            {t("markAllRead")}
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <Bell className="size-12 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleOpen(n)}
              className={`
                glass glass-reflect group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10
                ${!n.read_at ? "border-s-4 border-primary" : ""}
              `}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                  !n.read_at
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Bell className="size-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{n.title}</p>
                    {n.message && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {n.message}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-muted-foreground/70">
                      {formatDate(n.created_at, "ar")}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    disabled={pending === n.id}
                    className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    aria-label="delete"
                  >
                    {pending === n.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}