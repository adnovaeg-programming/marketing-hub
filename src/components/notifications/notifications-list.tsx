"use client";

import { useState } from "react";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
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

function formatDate(dateStr: string, locale = "ar"): string {
  return new Date(dateStr).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
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
  const [pending, setPending] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

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
    if (n.action_url) {
      window.location.href = n.action_url;
    }
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

  if (notifications.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <Bell className="size-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("unread", { count: unreadCount })}
          </p>
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-xs font-medium text-primary transition hover:opacity-80"
          >
            {markingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            {t("markAllRead")}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleOpen(n)}
            className={`glass glass-hover group relative flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-0.5 ${
              !n.read_at ? "border-s-4 border-primary" : ""
            }`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                !n.read_at
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Bell className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.message && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-2 text-[10px] text-muted-foreground/70">
                    {formatDate(n.created_at)}
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
    </div>
  );
}