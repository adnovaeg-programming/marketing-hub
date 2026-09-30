"use client";

import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { FileText, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

type ContentItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  platform: string | null;
  scheduled_at: string | null;
  client: { id: string; name: string } | null;
};

const COLUMNS = [
  { key: "draft", statuses: ["draft"] },
  { key: "internal_review", statuses: ["internal_review"] },
  { key: "client_review", statuses: ["client_review"] },
  { key: "approved", statuses: ["approved"] },
  { key: "scheduled", statuses: ["scheduled"] },
  { key: "published", statuses: ["published"] },
] as const;

const COLUMN_COLORS: Record<string, string> = {
  draft: "border-slate-500/50",
  internal_review: "border-blue-500/50",
  client_review: "border-amber-500/50",
  approved: "border-emerald-500/50",
  scheduled: "border-purple-500/50",
  published: "border-primary/50",
};

const PLATFORM_BADGES: Record<string, { label: string; color: string }> = {
  instagram: { label: "IG", color: "bg-gradient-to-br from-pink-500 to-purple-600" },
  facebook: { label: "FB", color: "bg-blue-600" },
  tiktok: { label: "TT", color: "bg-black" },
  x: { label: "X", color: "bg-black" },
  linkedin: { label: "in", color: "bg-[#0A66C2]" },
  youtube: { label: "YT", color: "bg-red-600" },
};

export function ContentKanban({ items }: { items: ContentItem[] }) {
  const t = useTranslations("dashboard.content");

  const columnsWithItems = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      items: items.filter((i) => col.statuses.includes(i.status as never)),
    }));
  }, [items]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {columnsWithItems.map((col) => (
        <div key={col.key} className="flex flex-col">
          {/* Header */}
          <div
            className={`glass mb-3 flex items-center justify-between rounded-xl border-s-4 px-3 py-2 ${COLUMN_COLORS[col.key]}`}
          >
            <span className="text-xs font-semibold">
              {t(`statuses.${col.statuses[0]}`)}
            </span>
            <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>

          {/* Body */}
          <div className="glass flex-1 space-y-2 rounded-2xl p-2">
            {col.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="size-6 text-muted-foreground/30" />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {t("kanbanEmpty")}
                </p>
              </div>
            ) : (
              col.items.map((item) => {
                const platformBadge = item.platform
                  ? PLATFORM_BADGES[item.platform]
                  : null;
                const scheduledDate = item.scheduled_at
                  ? new Date(item.scheduled_at).toLocaleDateString()
                  : null;

                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/content/${item.id}`}
                    className="glass glass-hover block rounded-xl p-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-2 flex-1 text-xs font-medium">
                        {item.title}
                      </h4>
                      {platformBadge && (
                        <div
                          className={`flex size-5 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white ${platformBadge.color}`}
                        >
                          {platformBadge.label}
                        </div>
                      )}
                    </div>

                    {item.client && (
                      <p className="mt-2 truncate text-[10px] text-muted-foreground">
                        {item.client.name}
                      </p>
                    )}

                    {scheduledDate && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="size-3" />
                        <span dir="ltr">{scheduledDate}</span>
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}