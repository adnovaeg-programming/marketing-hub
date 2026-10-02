"use client";

import { useState, useMemo, useDeferredValue, useTransition } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Check,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  approvePayoutAction,
  completePayoutAction,
  rejectPayoutAction,
} from "@/app/[locale]/admin/payouts/actions";

type PayoutRequest = {
  id: string;
  reference: string;
  amount: number;
  fee: number;
  net_amount: number;
  currency: string;
  status: string;
  requested_at: string;
  admin_notes: string | null;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  method: {
    id: string;
    type: string;
    label: string;
    account_identifier: string;
    account_name: string | null;
    bank_name: string | null;
  } | null;
};

type StatusFilter = "all" | "pending" | "processing" | "completed" | "rejected";

const STATUS_CONFIG: Record<string, { color: string }> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  approved: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border/40",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AdminPayoutsTable({
  payouts,
}: {
  payouts: PayoutRequest[];
}) {
  const t = useTranslations("admin.payouts");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return payouts.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.reference.toLowerCase().includes(q) ||
        p.user?.email.toLowerCase().includes(q) ||
        p.method?.label.toLowerCase().includes(q)
      );
    });
  }, [payouts, deferredQuery, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "pending", label: t("filters.pending") },
    { key: "processing", label: t("filters.processing") },
    { key: "completed", label: t("filters.completed") },
    { key: "rejected", label: t("filters.rejected") },
  ];

  const handleApprove = (id: string) => {
    if (!confirm(t("confirmApprove"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await approvePayoutAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الاعتماد");
        return;
      }
      toast.success(t("approved"));
      router.refresh();
    });
  };

  const handleComplete = (id: string) => {
    const txId = prompt(t("externalTxPrompt"));
    if (txId === null) return;
    setActionId(id);
    startTransition(async () => {
      const result = await completePayoutAction(id, txId || undefined);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الإتمام");
        return;
      }
      toast.success(t("completed"));
      router.refresh();
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt(t("rejectReasonPrompt"));
    if (!reason) return;
    setActionId(id);
    startTransition(async () => {
      const result = await rejectPayoutAction(id, reason);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الرفض");
        return;
      }
      toast.success(t("rejected"));
      router.refresh();
    });
  };

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
        <div className="glass-strong mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/40 bg-muted/30">
                <tr className="text-xs text-muted-foreground">
                  <th className="p-3 text-start">{t("cols.reference")}</th>
                  <th className="p-3 text-start">{t("cols.user")}</th>
                  <th className="p-3 text-start">{t("cols.method")}</th>
                  <th className="p-3 text-start">{t("cols.amount")}</th>
                  <th className="p-3 text-start">{t("cols.status")}</th>
                  <th className="p-3 text-end">{t("cols.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const userName = p.user
                    ? [p.user.first_name, p.user.last_name]
                        .filter(Boolean)
                        .join(" ") || p.user.email
                    : "—";
                  const isProcessing = pending && actionId === p.id;
                  const canApprove = p.status === "pending";
                  const canComplete = p.status === "processing";
                  const canReject = ["pending", "processing"].includes(
                    p.status
                  );

                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/20 transition hover:bg-muted/30"
                    >
                      <td className="p-3">
                        <span className="font-mono text-xs font-medium">
                          {p.reference}
                        </span>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(p.requested_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-medium">{userName}</p>
                        <p
                          className="text-[10px] text-muted-foreground"
                          dir="ltr"
                        >
                          {p.user?.email ?? "—"}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-medium">
                          {p.method?.label ?? "—"}
                        </p>
                        <p
                          className="text-[10px] text-muted-foreground"
                          dir="ltr"
                        >
                          {p.method?.account_identifier ?? ""}
                        </p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs font-semibold" dir="ltr">
                          {Number(p.net_amount).toLocaleString()} {p.currency}
                        </p>
                        <p className="text-[10px] text-muted-foreground" dir="ltr">
                          Fee: {Number(p.fee).toFixed(2)}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                            STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending
                          }`}
                        >
                          {t(`status.${p.status}`)}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {isProcessing ? (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              {canApprove && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApprove(p.id)}
                                  className="h-7 rounded-full px-2 text-xs text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
                                >
                                  <Play className="size-3" />
                                  {t("approve")}
                                </Button>
                              )}
                              {canComplete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleComplete(p.id)}
                                  className="h-7 rounded-full px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                                >
                                  <Check className="size-3" />
                                  {t("complete")}
                                </Button>
                              )}
                              {canReject && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleReject(p.id)}
                                  className="h-7 rounded-full px-2 text-xs text-destructive hover:bg-destructive/10"
                                >
                                  <XCircle className="size-3" />
                                  {t("reject")}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t("count", { count: filtered.length })}
      </p>
    </>
  );
}