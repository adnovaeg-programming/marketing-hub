import Link from "next/link";
import { Calendar, FileText, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

type ContentItem = {
  id: string;
  title: string;
  content_type: string;
  platform: string | null;
  scheduled_at: string | null;
  created_at: string;
  project: { id: string; name: string } | null;
};

export function ApprovalCard({ item }: { item: ContentItem }) {
  const t = useTranslations("dashboard.portal");

  const scheduledDate = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString()
    : null;
  const createdDate = new Date(item.created_at).toLocaleDateString();

  return (
    <Link
      href={`/portal/approvals/${item.id}`}
      className="glass glass-hover group block rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
          <FileText className="size-5 text-amber-500" />
        </div>
        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          {t("pendingApproval")}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold">
        {item.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">
          {item.content_type}
        </span>
        {item.project && <span className="truncate">{item.project.name}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          {scheduledDate ?? createdDate}
        </div>
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180" />
      </div>
    </Link>
  );
}