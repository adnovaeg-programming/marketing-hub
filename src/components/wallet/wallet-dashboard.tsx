"use client";

import { useState, useTransition } from "react";
import {
  Wallet as WalletIcon,
  TrendingUp,
  Lock,
  Clock,
  Plus,
  ArrowDownToLine,
  Loader2,
  Receipt,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter, Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { WalletCard } from "@/components/wallet/wallet-card";
import { TransactionList } from "@/components/wallet/transaction-list";
import { DepositDialog } from "@/components/wallet/deposit-dialog";
import { WithdrawDialog } from "@/components/wallet/withdraw-dialog";
import { getOrCreateWalletAction } from "@/app/[locale]/dashboard/wallet/actions";

type Wallet = {
  id: string;
  currency: string;
  available_balance: number;
  pending_balance: number;
  locked_balance: number;
  status: string;
  created_at: string;
};

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

export function WalletDashboard({
  wallets,
  transactions,
  workspaceId,
}: {
  wallets: Wallet[];
  transactions: Transaction[];
  workspaceId: string;
}) {
  const t = useTranslations("dashboard.wallet");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // العملة الافتراضية = EGP أو أول عملة عند المستخدم
  const defaultCurrency = wallets[0]?.currency ?? "EGP";
  const activeWallet =
    wallets.find((w) => w.currency === defaultCurrency) ?? null;

  const handleCreateWallet = () => {
    startTransition(async () => {
      const result = await getOrCreateWalletAction("EGP");
      if (!result.success) {
        toast.error("فشل إنشاء المحفظة");
        return;
      }
      toast.success("تم إنشاء المحفظة");
      router.refresh();
    });
  };

  // لو مفيش wallets → Empty State مع زر إنشاء
  if (wallets.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <WalletIcon className="size-10 text-white" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
        <Button
          onClick={handleCreateWallet}
          disabled={pending}
          className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {t("empty.cta")}
        </Button>
      </div>
    );
  }

  // إحصائيات الـ active wallet
  const stats = activeWallet
    ? [
        {
          icon: TrendingUp,
          label: t("stats.available"),
          value: Number(activeWallet.available_balance),
          color: "text-emerald-500",
          bg: "from-emerald-500/20 to-primary/20",
        },
        {
          icon: Clock,
          label: t("stats.pending"),
          value: Number(activeWallet.pending_balance),
          color: "text-amber-500",
          bg: "from-amber-500/20 to-primary/20",
        },
        {
          icon: Lock,
          label: t("stats.locked"),
          value: Number(activeWallet.locked_balance),
          color: "text-muted-foreground",
          bg: "from-muted/60 to-primary/10",
        },
      ]
    : [];

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass glass-hover rounded-2xl p-5">
              <div
                className={`inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bg}`}
              >
                <Icon className={`size-5 ${stat.color}`} />
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight" dir="ltr">
                {stat.value.toLocaleString()} {activeWallet?.currency ?? ""}
              </p>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button
          onClick={() => setDepositOpen(true)}
          className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
        >
          <Plus className="size-4" />
          {t("actions.deposit")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setWithdrawOpen(true)}
          className="glass rounded-full"
        >
          <ArrowDownToLine className="size-4" />
          {t("actions.withdraw")}
        </Button>
        <Button variant="outline" className="glass rounded-full" asChild>
          <Link href="/dashboard/wallet/payouts">
            <Receipt className="size-4" />
            {t("actions.payouts")}
          </Link>
        </Button>
      </div>

      {/* Wallet Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets.map((w) => (
          <WalletCard key={w.id} wallet={w} />
        ))}
      </div>

      {/* Transactions */}
      <div className="mt-8">
        <TransactionList transactions={transactions} wallets={wallets} />
      </div>

      {/* Dialogs */}
      {activeWallet && (
        <>
          <DepositDialog
            open={depositOpen}
            onOpenChange={setDepositOpen}
            wallet={activeWallet}
          />
          <WithdrawDialog
            open={withdrawOpen}
            onOpenChange={setWithdrawOpen}
            wallet={activeWallet}
          />
        </>
      )}
    </>
  );
}