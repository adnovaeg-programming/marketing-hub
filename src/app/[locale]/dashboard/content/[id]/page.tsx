import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  User,
  FolderKanban,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentActions } from "@/components/content/content-actions";
import { ScheduleContentDialog } from "@/components/content/schedule-content-dialog";

export default async function ContentDetailsPage({
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

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) redirect("/onboarding");

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
    .eq("workspace_id", member.workspace_id)
    .maybeSingle();

  if (!item) notFound();

  // نجيب الـ scheduled posts لهذا المحتوى
  const { data: scheduledPosts } = await supabase
    .from("scheduled_posts")
    .select(
      `
      id, platform, scheduled_for, status, external_post_url, error_message,
      account:social_accounts (id, account_name)
    `
    )
    .eq("content_item_id", id)
    .order("scheduled_for", { ascending: false });

  const client = Array.isArray(item.client) ? item.client[0] : item.client;
  const project = Array.isArray(item.project) ? item.project[0] : item.project;

  const t = await getTranslations("dashboard.content");
  const tDetails = await getTranslations("dashboard.content.details");

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

  const fmt = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

  const createdDate = fmt(item.created_at);
  const scheduledDate = fmt(item.scheduled_at);

  // هل يمكن جدولته؟ (لو الحالة معتمدة)
  const canSchedule =
    item.status === "approved" || item.status === "scheduled";

  const normalizedScheduled = (scheduledPosts ?? []).map((p) => ({
    ...p,
    account: Array.isArray(p.account) ? p.account[0] ?? null : p.account,
  }));

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/content"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {tDetails("back")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                statusStyles[item.status] ?? statusStyles.draft
              }`}
            >
              {t(`statuses.${item.status}`)}
            </span>
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {t(`types.${item.content_type}`)}
            </span>
            {item.platform && (
              <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                {t(`platforms.${item.platform}`)}
              </span>
            )}
            {createdDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {createdDate}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {item.title}
          </h1>

          {item.description && (
            <p className="max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>

        {/* Actions Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
          <ContentActions contentId={item.id} currentStatus={item.status} />

          {canSchedule && (
            <ScheduleContentDialog
              contentItemId={item.id}
              defaultCaption={item.description ?? undefined}
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {client && (
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5" />
              {tDetails("client")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{client.name}</p>
          </Link>
        )}

        {project && (
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderKanban className="size-3.5" />
              {tDetails("project")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{project.name}</p>
          </Link>
        )}

        {scheduledDate && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              {tDetails("scheduledAt")}
            </div>
            <p className="mt-2 text-sm font-medium" dir="ltr">
              {scheduledDate}
            </p>
          </div>
        )}
      </div>

      {/* Scheduled Posts Section */}
      {normalizedScheduled.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="size-5 text-primary" />
            {tDetails("scheduledPosts")}
          </h2>

          <div className="mt-4 space-y-3">
            {normalizedScheduled.map((post) => (
              <div
                key={post.id}
                className="glass flex items-center gap-4 rounded-2xl p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {post.platform}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        post.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : post.status === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {post.account?.account_name} •{" "}
                    {new Date(post.scheduled_for).toLocaleString()}
                  </p>

                  {post.error_message && (
                    <p className="mt-1 text-[10px] text-destructive">
                      {post.error_message}
                    </p>
                  )}
                </div>

                {post.external_post_url && (
                  <a
                    href={post.external_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                  >
                    {tDetails("viewPost")}
                  </a>
                )}

                {post.status === "published" && (
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="glass rounded-2xl p-8 text-center">
          <Sparkles className="mx-auto size-8 text-primary/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {tDetails("comingSoon")}
          </p>
        </div>
      </div>
    </div>
  );
}