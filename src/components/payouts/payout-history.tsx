"use client";

import { useState, useMemo, useDeferredValue } from "react";
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { cancelPayoutRequestAction } from "@/lib/payouts/actions";

type PayoutRequest = {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  status: string;
  requested_at: string;
  method: {
    id: string;
    type: string;
    label: string;
    account_identifier: string;
  } | null;
};

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string }> = {
  pending: { icon: Clock, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  approved: { icon: CheckCircle2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  processing: { icon: Loader2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  completed: { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rejected: { icon: XCircle, color: "bg-destructive/10 text-destructive" },
  cancelled: { icon: AlertCircle, color: "bg-muted text-muted-foreground" },
  failed: { icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

export function PayoutHistory({ payouts }: { payouts: PayoutRequest[] }) {
  const t = useTranslations("dashboard.payouts.history");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return payouts;
    return payouts.filter(
      (p) =>
        p.reference.toLowerCase().includes(q) ||
        p.method?.label.toLowerCase().includes(q)
    );
  }, [payouts, deferredQuery]);

  const handleCancel = async (id: string) => {
    if (!confirm(t("confirmCancel"))) return;
    setPending(id);
    const result = await cancelPayoutRequestAction(id);
    setPending(null);
    if (!result.success) {
      toast.error("فشل الإلغاء");
      return;
    }
    toast.success(t("cancelled"));
    router.refresh();
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("subtitle", { count: filtered.length })}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-10 rounded-xl ps-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="size-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            {query ? t("noResults") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((payout) => {
            const config = STATUS_CONFIG[payout.status] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;
            const isPending = payout.status === "pending";

            return (
              <div
                key={payout.id}
                className="glass flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted/30"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                >
                  <Icon
                    className={`size-4 ${payout.status === "processing" ? "animate-spin" : ""}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-mono text-xs font-semibold">
                      {payout.reference}
                    </p>
                  </div>
                  {payout.method && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {payout.method.label} • {payout.method.account_identifier}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    {new Date(payout.requested_at).toLocaleString()}
                  </p>
                </div>

                <div className="shrink-0 text-end">
                  <p className="text-sm font-bold" dir="ltr">
                    {Number(payout.net_amount).toLocaleString()}{" "}
                    {payout.currency}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${config.color}`}
                  >
                    {t(`status.${payout.status}`)}
                  </span>
                </div>

                {isPending && (
                  <button
                    onClick={() => handleCancel(payout.id)}
                    disabled={pending === payout.id}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label="cancel"
                  >
                    {pending === payout.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}