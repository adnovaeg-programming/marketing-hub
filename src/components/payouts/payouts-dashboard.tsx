"use client";

import { useState } from "react";
import { Plus, Wallet as WalletIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { PayoutMethodsList } from "@/components/payouts/payout-methods-list";
import { PayoutHistory } from "@/components/payouts/payout-history";
import { NewPayoutMethodDialog } from "@/components/payouts/new-payout-method-dialog";
import { RequestPayoutDialog } from "@/components/payouts/request-payout-dialog";

type Wallet = {
  id: string;
  currency: string;
  available_balance: number;
};

type PayoutMethod = {
  id: string;
  type: string;
  label: string;
  account_identifier: string;
  account_name: string | null;
  bank_name: string | null;
  is_default: boolean;
  is_verified: boolean;
};

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

export function PayoutsDashboard({
  wallets,
  methods,
  payouts,
}: {
  wallets: Wallet[];
  methods: PayoutMethod[];
  payouts: PayoutRequest[];
}) {
  const t = useTranslations("dashboard.payouts");
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);

  const activeWallet = wallets[0] ?? null;

  return (
    <>
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/wallet"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {t("backToWallet")}
        </Link>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMethodDialogOpen(true)}
            className="glass rounded-full"
          >
            <Plus className="size-4" />
            {t("methods.add")}
          </Button>

          {activeWallet && methods.length > 0 && (
            <Button
              onClick={() => setPayoutDialogOpen(true)}
              className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
            >
              <WalletIcon className="size-4" />
              {t("requestPayout")}
            </Button>
          )}
        </div>
      </div>

      {/* Payout Methods */}
      <div className="mt-6">
        <PayoutMethodsList
          methods={methods}
          onAddClick={() => setMethodDialogOpen(true)}
        />
      </div>

      {/* Payout History */}
      <div className="mt-8">
        <PayoutHistory payouts={payouts} />
      </div>

      {/* Dialogs */}
      <NewPayoutMethodDialog
        open={methodDialogOpen}
        onOpenChange={setMethodDialogOpen}
      />

      {activeWallet && (
        <RequestPayoutDialog
          open={payoutDialogOpen}
          onOpenChange={setPayoutDialogOpen}
          wallet={activeWallet}
          methods={methods}
        />
      )}
    </>
  );
}