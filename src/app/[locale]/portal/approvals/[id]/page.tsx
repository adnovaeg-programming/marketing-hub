import { notFound, redirect } from "next/navigation";
import { FileText, Calendar, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApprovalActions } from "@/components/portal/approval-actions";

export default async function PortalApprovalDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from("content_items")
    .select(
      `
      *,
      client:clients (id, name),
      project:projects (id, name)
    `
    )
    .eq("id", id)
    .eq("status", "client_review")
    .maybeSingle();

  if (!item) notFound();

  const client = Array.isArray(item.client) ? item.client[0] : item.client;
  const project = Array.isArray(item.project) ? item.project[0] : item.project;

  const t = await getTranslations("dashboard.portal");

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <Link
        href="/portal/approvals"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        ← {t("backToApprovals")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-10">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-amber-500" />
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            {t("pendingApproval")}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
          {item.title}
        </h1>

        {item.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {client && (
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
              <User className="size-3.5" />
              {client.name}
            </div>
          )}
          {project && (
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
              {project.name}
            </div>
          )}
          {item.scheduled_at && (
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
              <Calendar className="size-3.5" />
              {fmt(item.scheduled_at)}
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-border/40 pt-8">
          <ApprovalActions contentId={item.id} />
        </div>
      </div>
    </div>
  );
}