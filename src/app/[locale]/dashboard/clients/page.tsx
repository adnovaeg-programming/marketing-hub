import { redirect } from "next/navigation";
import {
  Users,
  Mail,
  Phone,
  Building2,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { DeleteClientButton } from "@/components/clients/delete-client-button";

export default async function ClientsPage() {
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

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, phone, company, status, created_at")
    .eq("workspace_id", member.workspace_id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("dashboard.clients");

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    lead: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle", { count: clients?.length ?? 0 })}
          </p>
        </div>

        <NewClientDialog />
      </div>

      {/* Content */}
      {!clients || clients.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/30 py-20 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Users className="size-8 text-primary" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
          <div className="mt-6">
            <NewClientDialog />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div
              key={client.id}
              className="glass glass-hover group relative rounded-2xl p-5"
            >
              {/* Status badge */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[client.status] ?? statusStyles.archived
                  }`}
                >
                  {t(`statuses.${client.status}`)}
                </div>
                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                  <DeleteClientButton clientId={client.id} />
                </div>
              </div>

              {/* Avatar + Name */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-base font-bold text-white shadow-lg shadow-primary/30">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{client.name}</h3>
                  {client.company && (
                    <p className="truncate text-xs text-muted-foreground">
                      {client.company}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="mt-4 space-y-2 border-t border-border/40 pt-4 text-xs">
                {client.email ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                ) : null}
                {client.phone ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    <span className="truncate" dir="ltr">
                      {client.phone}
                    </span>
                  </div>
                ) : null}
                {!client.email && !client.phone ? (
                  <div className="flex items-center gap-2 text-muted-foreground/60">
                    <Building2 className="size-3.5 shrink-0" />
                    <span>{t("noContact")}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}