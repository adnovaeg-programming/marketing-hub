import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  User,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link as I18nLink } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentActions } from "@/components/content/content-actions";

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

  return (
    <div className="p-6 md:p-10">
      <I18nLink
        href="/dashboard/content"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {tDetails("back")}
      </I18nLink>

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

        <div className="mt-6 border-t border-border/40 pt-6">
          <ContentActions contentId={item.id} currentStatus={item.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {client && (
          <I18nLink
            href={`/dashboard/clients/${client.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="size-3.5" />
              {tDetails("client")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{client.name}</p>
          </I18nLink>
        )}

        {project && (
          <I18nLink
            href={`/dashboard/projects/${project.id}`}
            className="glass glass-hover rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FolderKanban className="size-3.5" />
              {tDetails("project")}
            </div>
            <p className="mt-2 truncate text-sm font-medium">{project.name}</p>
          </I18nLink>
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