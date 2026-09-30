import { Link } from "@/i18n/navigation";
import { Calendar, ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

type ContentItem = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  platform: string | null;
  status: string;
  priority: string;
  scheduled_at: string | null;
  published_at: string | null;
  client: { id: string; name: string } | null;
};

const PLATFORM_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  instagram: {
    label: "IG",
    className: "bg-gradient-to-br from-pink-500 to-purple-600 text-white",
  },
  facebook: { label: "FB", className: "bg-blue-600 text-white" },
  tiktok: { label: "TT", className: "bg-black text-white" },
  x: { label: "X", className: "bg-black text-white" },
  linkedin: { label: "in", className: "bg-[#0A66C2] text-white" },
  youtube: { label: "YT", className: "bg-red-600 text-white" },
};

export function ContentCard({ item }: { item: ContentItem }) {
  const t = useTranslations("dashboard.content");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border/40",
    internal_review:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    client_review:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    approved:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    scheduled:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    published: "bg-primary/10 text-primary border-primary/20",
    archived: "bg-muted text-muted-foreground border-border/40",
  };

  const platformBadge = item.platform ? PLATFORM_BADGES[item.platform] : null;

  const scheduledDate = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString()
    : null;

  const isPending =
    item.status === "client_review" || item.status === "internal_review";
  const isPublished = item.status === "published";

  return (
    <Link
      href={`/dashboard/content/${item.id}`}
      className="glass glass-reflect group relative block overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      {/* Header: Status + Platform + Arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              statusStyles[item.status] ?? statusStyles.draft
            }`}
          >
            {isPending && (
              <Clock className="size-2.5 animate-pulse" />
            )}
            {isPublished && <CheckCircle2 className="size-2.5" />}
            {t(`statuses.${item.status}`)}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {platformBadge && (
            <div
              className={`flex size-6 items-center justify-center rounded-md text-[9px] font-bold ${platformBadge.className}`}
            >
              {platformBadge.label}
            </div>
          )}
          <ArrowLeft className="size-4 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 line-clamp-2 text-base font-semibold">
        {item.title}
      </h3>

      {/* Description */}
      {item.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </p>
      )}

      {/* Type + Client */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
          {t(`types.${item.content_type}`)}
        </span>
        {item.client && (
          <span className="truncate text-muted-foreground">
            {item.client.name}
          </span>
        )}
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