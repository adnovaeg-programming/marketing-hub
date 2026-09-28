import Link from "next/link";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

type ContentItem = {
  id: string;
  title: string;
  content_type: string;
  platform: string | null;
  status: string;
  priority: string;
  scheduled_at: string | null;
  client: { id: string; name: string } | null;
};

const PLATFORM_BADGES: Record<string, { label: string; className: string }> = {
  instagram: {
    label: "IG",
    className: "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
  },
  facebook: {
    label: "FB",
    className: "bg-blue-600 text-white",
  },
  tiktok: {
    label: "TT",
    className: "bg-black text-white",
  },
  x: {
    label: "X",
    className: "bg-black text-white",
  },
  linkedin: {
    label: "in",
    className: "bg-[#0A66C2] text-white",
  },
  youtube: {
    label: "YT",
    className: "bg-red-600 text-white",
  },
};

export function ContentCard({ item }: { item: ContentItem }) {
  const t = useTranslations("dashboard.content");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    internal_review: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    client_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-destructive/10 text-destructive",
    scheduled: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    published: "bg-primary/10 text-primary",
    archived: "bg-muted text-muted-foreground",
  };

  const platformBadge = item.platform ? PLATFORM_BADGES[item.platform] : null;

  const scheduledDate = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString()
    : null;

  return (
    <Link
      href={`/dashboard/content/${item.id}`}
      className="glass glass-hover block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      {/* Status + Platform */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusStyles[item.status] ?? statusStyles.draft
          }`}
        >
          {t(`statuses.${item.status}`)}
        </span>

        {platformBadge && (
          <div
            className={`flex size-7 items-center justify-center rounded-lg text-[10px] font-bold ${platformBadge.className}`}
          >
            {platformBadge.label}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 text-base font-semibold">
        {item.title}
      </h3>

      {/* Type + Client */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
          {t(`types.${item.content_type}`)}
        </span>
        {item.client && <span className="truncate">{item.client.name}</span>}
      </div>

      {/* Scheduled */}
      {scheduledDate && (
        <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span dir="ltr">{scheduledDate}</span>
        </div>
      )}
    </Link>
  );
}