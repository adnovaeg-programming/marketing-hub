import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  FileText,
  User,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContractMilestones } from "@/components/contracts/contract-milestones";

export default async function ContractDetailsPage({
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

  const { data: contract } = await supabase
    .from("contracts")
    .select(
      `
      *,
      client:profiles!contracts_client_id_fkey (id, first_name, last_name, email, avatar_url),
      provider:profiles!contracts_provider_id_fkey (id, first_name, last_name, email, avatar_url),
      milestones:contract_milestones (*)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (!contract) notFound();

  const client = Array.isArray(contract.client)
    ? contract.client[0]
    : contract.client;
  const provider = Array.isArray(contract.provider)
    ? contract.provider[0]
    : contract.provider;
  const milestones = (contract.milestones ?? []) as {
    id: string;
    name: string;
    description: string | null;
    amount: number;
    currency: string;
    due_date: string | null;
    status: string;
    order_index: number;
    submitted_at: string | null;
    approved_at: string | null;
    paid_at: string | null;
  }[];

  milestones.sort((a, b) => a.order_index - b.order_index);

  const t = await getTranslations("dashboard.contractDetails");

  const statusStyles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border/40",
    active:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    completed:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    cancelled: "bg-muted text-muted-foreground border-border/40",
    disputed:
      "bg-destructive/10 text-destructive border-destructive/20",
  };

  const isClient = client?.id === user.id;
  const isProvider = provider?.id === user.id;

  const clientName = client
    ? [client.first_name, client.last_name].filter(Boolean).join(" ") ||
      client.email
    : "—";
  const providerName = provider
    ? [provider.first_name, provider.last_name].filter(Boolean).join(" ") ||
      provider.email
    : "—";

  return (
    <div className="p-6 md:p-10">
      <Link
        href="/dashboard/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowRight className="size-4 rtl:rotate-180" />
        {t("back")}
      </Link>

      {/* Header */}
      <div className="glass-strong mt-6 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[contract.status] ?? statusStyles.draft
            }`}
          >
            {t(`status.${contract.status}`)}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {contract.reference}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          {contract.title}
        </h1>

        {contract.description && (
          <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {contract.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="size-3.5" />
            {t("total")}
          </div>
          <p className="mt-2 text-lg font-bold" dir="ltr">
            {Number(contract.total_amount).toLocaleString()}{" "}
            {contract.currency}
          </p>
        </div>

        {isProvider && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              {t("yourEarnings")}
            </div>
            <p
              className="mt-2 text-lg font-bold text-emerald-500"
              dir="ltr"
            >
              {Number(contract.provider_amount).toLocaleString()}{" "}
              {contract.currency}
            </p>
          </div>
        )}

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {t("endDate")}
          </div>
          <p className="mt-2 text-sm font-medium">
            {contract.end_date
              ? new Date(contract.end_date).toLocaleDateString(
                  locale === "ar" ? "ar-EG" : "en-US"
                )
              : "—"}
          </p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5" />
            {t("milestonesLabel")}
          </div>
          <p className="mt-2 text-lg font-bold">
            {milestones.filter((m) => m.status === "approved" || m.status === "paid").length}{" "}
            / {milestones.length}
          </p>
        </div>
      </div>

      {/* Parties */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass-strong rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("client")}
          </h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white">
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{clientName}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {client?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {t("provider")}
          </h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-primary text-lg font-bold text-white">
              {providerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{providerName}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {provider?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-8">
        <ContractMilestones
          milestones={milestones}
          isClient={isClient}
          isProvider={isProvider}
          currency={contract.currency}
        />
      </div>
    </div>
  );
}