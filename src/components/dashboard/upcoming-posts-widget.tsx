"use client";

import { Link } from "@/i18n/navigation";
import {
  CalendarClock,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PlatformBadge } from "@/components/social/platform-badges";

type Post = {
  id: string;
  platform: string;
  scheduled_for: string;
  status: string;
  content: { id: string; title: string } | null;
  account: { id: string; account_name: string } | null;
};

export function UpcomingPostsWidget({ posts }: { posts: Post[] }) {
  const t = useTranslations("dashboard.upcomingPosts");

  if (posts.length === 0) {
    return (
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarClock className="size-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
          <Link
            href="/dashboard/social/scheduled"
            className="mt-3 text-xs font-medium text-primary hover:opacity-80"
          >
            {t("goToScheduled")} ←
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>
        <Link
          href="/dashboard/social/scheduled"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:opacity-80"
        >
          {t("viewAll")}
          <ArrowLeft className="size-3 rtl:rotate-180" />
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => {
          const isToday =
            new Date(post.scheduled_for).toDateString() ===
            new Date().toDateString();
          const isSoon =
            new Date(post.scheduled_for).getTime() - Date.now() <
            60 * 60 * 1000;

          return (
            <Link
              key={post.id}
              href={`/dashboard/content/${post.content?.id}`}
              className="glass glass-hover flex items-center gap-3 rounded-xl p-3 transition-transform hover:-translate-y-0.5"
            >
              <PlatformBadge platform={post.platform} size="md" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {post.content?.title ?? "—"}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="size-3" />
                  <span dir="ltr">
                    {new Date(post.scheduled_for).toLocaleString(
                      undefined,
                      {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                      {t("today")}
                    </span>
                  )}
                  {isSoon && !isToday && (
                    <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                      {t("soon")}
                    </span>
                  )}
                </div>
              </div>

              {post.status === "published" ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              ) : post.status === "failed" ? (
                <AlertCircle className="size-4 shrink-0 text-destructive" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}