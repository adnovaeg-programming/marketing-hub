"use client";

import { useState, useMemo, useDeferredValue } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Unlock,
  RotateCcw,
  Coins,
  Receipt,
  ArrowLeftRight,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";

type Transaction = {
  id: string;
  wallet_id: string;
  type: string;
  amount: number;
  balance_after: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
};

type Wallet = {
  id: string;
  currency: string;
};

const TYPE_CONFIG: Record<
  string,
  { icon: typeof ArrowDownToLine; color: string; bg: string; isIncome: boolean }
> = {
  deposit: {
    icon: ArrowDownToLine,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    isIncome: true,
  },
  withdrawal: {
    icon: ArrowUpFromLine,
    color: "text-destructive",
    bg: "bg-destructive/10",
    isIncome: false,
  },
  escrow_hold: {
    icon: Lock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    isIncome: false,
  },
  escrow_release: {
    icon: Unlock,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    isIncome: true,
  },
  refund: {
    icon: RotateCcw,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    isIncome: true,
  },
  commission: {
    icon: Coins,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    isIncome: false,
  },
  fee: {
    icon: Receipt,
    color: "text-destructive",
    bg: "bg-destructive/10",
    isIncome: false,
  },
  transfer_in: {
    icon: ArrowLeftRight,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    isIncome: true,
  },
  transfer_out: {
    icon: ArrowLeftRight,
    color: "text-destructive",
    bg: "bg-destructive/10",
    isIncome: false,
  },
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function TransactionList({
  transactions,
  wallets,
}: {
  transactions: Transaction[];
  wallets: Wallet[];
}) {
  const t = useTranslations("dashboard.wallet");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const walletCurrency = useMemo(() => {
    const map: Record<string, string> = {};
    wallets.forEach((w) => {
      map[w.id] = w.currency;
    });
    return map;
  }, [wallets]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(
      (tx) =>
        tx.type.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q)
    );
  }, [transactions, deferredQuery]);

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("transactions.title")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("transactions.subtitle", { count: filtered.length })}
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("transactions.searchPlaceholder")}
            className="glass h-10 rounded-xl ps-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt className="size-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            {query ? t("transactions.noResults") : t("transactions.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const config = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.deposit;
            const Icon = config.icon;
            const currency =
              walletCurrency[tx.wallet_id] ?? tx.currency ?? "EGP";

            return (
              <div
                key={tx.id}
                className="glass flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted/30"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}
                >
                  <Icon className={`size-4 ${config.color}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {t(`transactionTypes.${tx.type}`)}
                  </p>
                  {tx.description && (
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="shrink-0 text-end">
                  <div className="flex items-center gap-1">
                    {config.isIncome ? (
                      <TrendingUp className="size-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3 text-destructive" />
                    )}
                    <p
                      className={`text-sm font-bold ${
                        config.isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive"
                      }`}
                      dir="ltr"
                    >
                      {config.isIncome ? "+" : "-"}
                      {Number(tx.amount).toLocaleString()} {currency}
                    </p>
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${
                      STATUS_STYLES[tx.status] ?? STATUS_STYLES.completed
                    }`}
                  >
                    {t(`transactionStatus.${tx.status}`)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}