import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Mail,
  Phone,
  Building2,
  Globe,
  Calendar,
  FolderKanban,
  FileText,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteClientButton } from "@/components/clients/delete-client-button";

export default async function ClientDetailsPage({
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

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", member.workspace_id)
    .maybeSingle();

  if (!client) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, priority, budget, currency, end_date")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.clientDetails");
  const tProjects = await getTranslations("dashboard.projects");

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lead: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    archived: "bg-muted text-muted-foreground",
  };

  const projectStatusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    on_hold: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    completed: "bg-primary/10 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const createdDate = new Date(client.created_at).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const infoRows = [
    {
      icon: Mail,
      label: t("email"),
      value: client.email,
      href: client.email ? `mailto:${client.email}` : null,
      dir: "ltr" as const,
    },
    {
      icon: Phone,
      label: t("phone"),
      value: client.phone,
      href: client.phone ? `tel:${client.phone}` : null,
      dir: "ltr" as const,
    },
    {
      icon: Building2,
      label: t("company"),
      value: client.company,
      href: null,
      dir: "auto" as const,
    },
    {
      icon: Globe,
      label: t("website"),
      value: client.website,
      href: client.website ?? null,
      dir: "ltr" as const,
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {t("back")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-lg shadow-primary/30">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {client.name}
              </h1>
              {client.company && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {client.company}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[client.status] ?? statusStyles.archived
                  }`}
                >
                  {t(`statuses.${client.status}`)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" />
                  {createdDate}
                </span>
              </div>
            </div>
          </div>

          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {infoRows
          .filter((row) => row.value)
          .map((row) => {
            const Icon = row.icon;
            const content = (
              <div className="glass glass-hover rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="size-3.5" />
                  {row.label}
                </div>
                <p className="mt-2 truncate text-sm font-medium" dir={row.dir}>
                  {row.value}
                </p>
              </div>
            );

            return row.href ? (
              <a
                key={row.label}
                href={row.href}
                target={row.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  row.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="block transition-transform hover:-translate-y-0.5"
              >
                {content}
              </a>
            ) : (
              <div key={row.label}>{content}</div>
            );
          })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
            <FolderKanban className="size-5 text-primary" />
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            {t("stats.projects")}
          </p>
          <p className="mt-1 text-2xl font-bold">{projects?.length ?? 0}</p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
            <FileText className="size-5 text-accent" />
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            {t("stats.content")}
          </p>
          <p className="mt-1 text-2xl font-bold">0</p>
        </div>
      </div>

      {projects && projects.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">{t("stats.projects")}</h2>
          <div className="mt-4 space-y-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="glass glass-hover flex items-center justify-between rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{project.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        projectStatusStyles[project.status] ??
                        projectStatusStyles.draft
                      }`}
                    >
                      {tProjects(`statuses.${project.status}`)}
                    </span>
                    {project.budget != null && (
                      <span dir="ltr">
                        {Number(project.budget).toLocaleString()}{" "}
                        {project.currency ?? ""}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {client.notes && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">{t("notes")}</h2>
          <div className="glass mt-4 rounded-2xl p-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {client.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}