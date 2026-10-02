"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { Link } from "@/i18n/navigation";
import {
  AlertTriangle,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

type Dispute = {
  id: string;
  reference: string;
  reason: string;
  description: string;
  amount_disputed: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  opened_by_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  against_user_profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
};

type StatusFilter = "all" | "open" | "under_review" | "resolved" | "closed";

const STATUS_STYLES: Record<string, { color: string; icon: typeof Clock }> = {
  open: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  under_review: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Clock,
  },
  waiting_evidence: {
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Clock,
  },
  resolved: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  closed: {
    color: "bg-muted text-muted-foreground border-border/40",
    icon: XCircle,
  },
};

export function DisputesList({
  disputes,
  currentUserId,
}: {
  disputes: Dispute[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.disputes");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return disputes.filter((d) => {
      if (filter !== "all" && d.status !== filter) return false;
      if (!q) return true;
      return (
        d.reason.toLowerCase().includes(q) ||
        d.reference.toLowerCase().includes(q)
      );
    });
  }, [disputes, deferredQuery, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "open", label: t("filters.open") },
    { key: "under_review", label: t("filters.under_review") },
    { key: "resolved", label: t("filters.resolved") },
  ];

  if (disputes.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-accent shadow-2xl">
          <Shield className="size-10 text-white" />
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
        <div className="mt-6 space-y-3">
          {filtered.map((dispute) => {
            const config = STATUS_STYLES[dispute.status] ?? STATUS_STYLES.open;
            const Icon = config.icon;
            const isOpener = dispute.opened_by_profile?.id === currentUserId;

            return (
              <Link
                key={dispute.id}
                href={`/dashboard/disputes/${dispute.id}`}
                className="glass glass-hover group block rounded-2xl p-5 transition-all hover:-translate-y-1"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${config.color}`}
                      >
                        <Icon className="size-3" />
                        {t(`status.${dispute.status}`)}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {dispute.reference}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold">
                      {dispute.reason}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {dispute.description}
                    </p>

                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {isOpener ? t("youOpened") : t("againstYou")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    {dispute.amount_disputed && (
                      <div className="text-end">
                        <p className="text-[10px] text-muted-foreground">
                          {t("disputedAmount")}
                        </p>
                        <p className="text-sm font-bold text-destructive" dir="ltr">
                          {Number(dispute.amount_disputed).toLocaleString()}{" "}
                          {dispute.currency}
                        </p>
                      </div>
                    )}
                    <ArrowLeft className="size-4 text-muted-foreground opacity-0 transition-all group-hover:-translate-x-1 group-hover:opacity-100 rtl:rotate-180 rtl:group-hover:translate-x-1" />
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