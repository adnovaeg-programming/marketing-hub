"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
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

function timeAgo(dateStr: string, locale: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (locale === "ar") {
    if (mins < 1) return "الآن";
    if (mins < 60) return `قبل ${mins} دقيقة`;
    if (hours < 24) return `قبل ${hours} ساعة`;
    return `قبل ${days} يوم`;
  }
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationBell() {
  const t = useTranslations("dashboard.notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // نجيب الإشعارات + نعمل subscribe للتحديثات
  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications(data ?? []);
      setLoading(false);
    };

    load();

    // Realtime subscription
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [
              payload.new as Notification,
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === (payload.new as Notification).id
                  ? (payload.new as Notification)
                  : n
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== (payload.old as Notification).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // إغلاق الـ Dropdown لما نضغط برة
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [open]);

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

  const handleOpenNotification = async (n: Notification) => {
    // نحدّث read محليًا
    if (!n.read_at) {
      setNotifications((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
        )
      );
    }
    setOpen(false);

    // نوديه للرابط
    if (n.action_url) {
      window.location.href = n.action_url;
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotificationAction(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("title")}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="glass-strong absolute end-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-glass-border shadow-2xl md:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 p-3">
            <h3 className="text-sm font-semibold">{t("title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
              >
                {markingAll ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3" />
                )}
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="size-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("empty")}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpenNotification(n)}
                  className={`group relative flex w-full gap-3 border-b border-border/20 p-3 text-start transition hover:bg-muted/50 ${
                    !n.read_at ? "bg-primary/5" : ""
                  }`}
                >
                  {!n.read_at && (
                    <span className="absolute start-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-e-full bg-primary" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{n.title}</p>
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                        aria-label="delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    {n.message && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {timeAgo(n.created_at, "ar")}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/40 p-2">
            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-lg py-2 text-center text-xs font-medium text-primary transition hover:bg-primary/5"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}