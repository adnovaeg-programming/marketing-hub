"use client";

import { Wallet as WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type Wallet = {
  id: string;
  currency: string;
  available_balance: number;
  pending_balance: number;
  locked_balance: number;
  status: string;
};

export function WalletCard({ wallet }: { wallet: Wallet }) {
  const t = useTranslations("dashboard.wallet");

  const statusStyles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    frozen: "bg-destructive/10 text-destructive",
    closed: "bg-muted text-muted-foreground",
  };

  const total =
    Number(wallet.available_balance) +
    Number(wallet.pending_balance) +
    Number(wallet.locked_balance);

  return (
    <div className="glass-strong glass-reflect relative overflow-hidden rounded-3xl p-6">
      {/* Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <WalletIcon className="size-5 text-white" />
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
              statusStyles[wallet.status] ?? statusStyles.active
            }`}
          >
            {t(`status.${wallet.status}`)}
          </span>
        </div>

        <p className="mt-6 text-xs font-medium text-muted-foreground">
          {t("card.totalBalance")}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
          {total.toLocaleString()} {wallet.currency}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border/40 pt-4 text-xs">
          <div>
            <p className="text-muted-foreground">{t("stats.available")}</p>
            <p className="mt-1 font-semibold" dir="ltr">
              {Number(wallet.available_balance).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("stats.pending")}</p>
            <p className="mt-1 font-semibold" dir="ltr">
              {Number(wallet.pending_balance).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("stats.locked")}</p>
            <p className="mt-1 font-semibold" dir="ltr">
              {Number(wallet.locked_balance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}