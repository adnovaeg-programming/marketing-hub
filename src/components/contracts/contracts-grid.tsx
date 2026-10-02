"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Link } from "@/i18n/navigation";
import {
  FileText,
  Search,
  User,
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

type Contract = {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  total_amount: number;
  currency: string;
  provider_amount: number;
  platform_fee: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  client: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  provider: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  milestones: { id: string; status: string; amount: number }[];
};

type StatusFilter = "all" | "active" | "completed" | "cancelled" | "disputed";

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: typeof CheckCircle2 }
> = {
  draft: { color: "bg-muted text-muted-foreground border-border/40", icon: FileText },
  active: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Clock,
  },
  completed: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  cancelled: {
    color: "bg-muted text-muted-foreground border-border/40",
    icon: AlertCircle,
  },
  disputed: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertCircle,
  },
};

export function ContractsGrid({
  contracts,
  currentUserId,
}: {
  contracts: Contract[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.contracts");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return contracts.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.reference.toLowerCase().includes(q) ||
        c.client?.email.toLowerCase().includes(q) ||
        c.provider?.email.toLowerCase().includes(q)
      );
    });
  }, [contracts, deferredQuery, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "active", label: t("filters.active") },
    { key: "completed", label: t("filters.completed") },
    { key: "cancelled", label: t("filters.cancelled") },
    { key: "disputed", label: t("filters.disputed") },
  ];

  if (contracts.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <FileText className="size-10 text-white" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        <div className="glass flex items-center gap-1 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-6 flex flex-col items-center justify-center rounded-3xl py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((contract) => {
            const config = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
            const Icon = config.icon;
            const isClient = contract.client?.id === currentUserId;
            const otherParty = isClient ? contract.provider : contract.client;

            const otherName = otherParty
              ? [otherParty.first_name, otherParty.last_name]
                  .filter(Boolean)
                  .join(" ") || otherParty.email
              : "—";
            const initial = otherName.charAt(0).toUpperCase();

            // Milestones progress
            const totalMs = contract.milestones.length;
            const approvedMs = contract.milestones.filter(
              (m) => m.status === "approved" || m.status === "paid"
            ).length;
            const progress = totalMs > 0 ? (approvedMs / totalMs) * 100 : 0;

            return (
              <Link
                key={contract.id}
                href={`/dashboard/contracts/${contract.id}`}
                className="glass glass-hover group block rounded-2xl p-5 transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${config.color}`}
                    >
                      <Icon className="size-3" />
                      {t(`status.${contract.status}`)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {contract.reference}
                    </span>
                  </div>
                  <ArrowLeft className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:-translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                </div>

                {/* Title */}
                <h3 className="mt-3 line-clamp-2 text-base font-semibold">
                  {contract.title}
                </h3>

                {/* Other party */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {otherParty?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={otherParty.avatar_url}
                        alt={otherName}
                        className="size-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {isClient ? t("provider") : t("client")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {otherName}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                {totalMs > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        {t("milestones", {
                          completed: approvedMs,
                          total: totalMs,
                        })}
                      </span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {contract.end_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span dir="ltr">
                          {new Date(contract.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-end">
                    <p className="text-[10px] text-muted-foreground">
                      {t("totalAmount")}
                    </p>
                    <p className="text-base font-bold text-primary" dir="ltr">
                      {Number(contract.total_amount).toLocaleString()}{" "}
                      {contract.currency}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}