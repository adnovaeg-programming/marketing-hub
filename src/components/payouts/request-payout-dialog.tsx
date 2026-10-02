"use client";

import { useState, useTransition, useMemo } from "react";
import { Loader2, ArrowDownToLine, Wallet as WalletIcon, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPayoutAction } from "@/lib/payouts/actions";

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
  is_default: boolean;
};

export function RequestPayoutDialog({
  open,
  onOpenChange,
  wallet,
  methods,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: Wallet;
  methods: PayoutMethod[];
}) {
  const t = useTranslations("dashboard.payouts.request");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState(
    methods.find((m) => m.is_default)?.id ?? methods[0]?.id ?? ""
  );

  const numericAmount = Number(amount) || 0;
  const selectedMethod = methods.find((m) => m.id === methodId);

  // نحسب الرسوم المتوقعة
  const estimatedFee = useMemo(() => {
    if (!numericAmount || !selectedMethod) return 0;
    switch (selectedMethod.type) {
      case "instapay":
        return Math.min(numericAmount * 0.005, 25);
      case "bank_transfer":
        return 15;
      case "vodafone_cash":
        return Math.min(numericAmount * 0.01, 20);
      case "paypal":
        return numericAmount * 0.03;
      default:
        return 0;
    }
  }, [numericAmount, selectedMethod]);

  const netAmount = numericAmount - estimatedFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!numericAmount || numericAmount <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    if (numericAmount < 100) {
      toast.error(t("minAmount"));
      return;
    }

    if (numericAmount > wallet.available_balance) {
      toast.error(t("insufficientBalance"));
      return;
    }

    if (!methodId) {
      toast.error(t("selectMethod"));
      return;
    }

    startTransition(async () => {
      const result = await requestPayoutAction(
        wallet.id,
        methodId,
        numericAmount
      );

      if (!result.success) {
        toast.error(
          t(`errors.${result.error}`, { default: "فشل طلب السحب" })
        );
        return;
      }

      toast.success(t("success"));
      setAmount("");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <ArrowDownToLine className="size-7 text-white" />
          </div>
          <DialogTitle className="mt-4 text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available balance */}
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t("availableBalance")}
            </p>
            <p className="mt-1 text-xl font-bold" dir="ltr">
              {Number(wallet.available_balance).toLocaleString()}{" "}
              {wallet.currency}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amountLabel")}</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              step="0.01"
              max={wallet.available_balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-12 rounded-xl text-center text-lg font-semibold"
              dir="ltr"
              autoFocus
            />
          </div>

          {/* Method Selector */}
          <div className="space-y-2">
            <Label>{t("method")}</Label>
            <div className="space-y-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethodId(m.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-start transition ${
                    methodId === m.id
                      ? "border-primary bg-primary/10"
                      : "glass hover:border-primary/40"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.label}</p>
                    <p
                      className="truncate text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {m.account_identifier}
                    </p>
                  </div>
                  {m.is_default && (
                    <span className="ms-2 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
                      {t("default")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fee Summary */}
          {numericAmount >= 100 && (
            <div className="glass space-y-2 rounded-xl p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("amount")}</span>
                <span className="font-medium" dir="ltr">
                  {numericAmount.toLocaleString()} {wallet.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("fee")}</span>
                <span className="font-medium text-amber-500" dir="ltr">
                  -{estimatedFee.toFixed(2)} {wallet.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="font-semibold">{t("netAmount")}</span>
                <span className="font-bold text-emerald-500" dir="ltr">
                  {netAmount.toFixed(2)} {wallet.currency}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{t("processingNote")}</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="rounded-xl"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={pending || !amount || !methodId}
              className="rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <WalletIcon className="size-4" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}