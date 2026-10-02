import { notFound, redirect } from "next/navigation";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisputeChat } from "@/components/disputes/dispute-chat";

export default async function DisputeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dispute } = await supabase
    .from("disputes")
    .select(
      `
      *,
      opened_by_profile:profiles!disputes_opened_by_fkey (id, first_name, last_name, email),
      against_user_profile:profiles!disputes_against_user_id_fkey (id, first_name, last_name, email)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!dispute) notFound();

  const { data: messages } = await supabase
    .from("dispute_messages")
    .select(
      `
      *,
      sender:profiles!dispute_messages_sender_id_fkey (id, first_name, last_name, email, avatar_url)
    `
    )
    .eq("dispute_id", id)
    .order("created_at", { ascending: true });

  const t = await getTranslations("dashboard.disputeDetails");

  const opened = Array.isArray(dispute.opened_by_profile)
    ? dispute.opened_by_profile[0]
    : dispute.opened_by_profile;
  const against = Array.isArray(dispute.against_user_profile)
    ? dispute.against_user_profile[0]
    : dispute.against_user_profile;

  const normalizedMessages = (messages ?? []).map((m) => ({
    ...m,
    sender: Array.isArray(m.sender) ? m.sender[0] ?? null : m.sender,
  }));

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/disputes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {t("back")}
      </Link>

      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <div>
            <span className="font-mono text-xs text-muted-foreground">
              {dispute.reference}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              {dispute.reason}
            </h1>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {dispute.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">{t("openedBy")}</p>
                <p className="mt-1 font-medium">
                  {opened
                    ? [opened.first_name, opened.last_name]
                        .filter(Boolean)
                        .join(" ") || opened.email
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("against")}</p>
                <p className="mt-1 font-medium">
                  {against
                    ? [against.first_name, against.last_name]
                        .filter(Boolean)
                        .join(" ") || against.email
                    : "—"}
                </p>
              </div>
              {dispute.amount_disputed && (
                <div>
                  <p className="text-muted-foreground">
                    {t("disputedAmount")}
                  </p>
                  <p
                    className="mt-1 font-bold text-destructive"
                    dir="ltr"
                  >
                    {Number(dispute.amount_disputed).toLocaleString()}{" "}
                    {dispute.currency}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <DisputeChat
          disputeId={dispute.id}
          messages={normalizedMessages}
          currentUserId={user.id}
          status={dispute.status}
        />
      </div>
    </div>
  );
}