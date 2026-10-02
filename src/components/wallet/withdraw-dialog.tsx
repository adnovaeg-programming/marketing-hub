"use client";

import { useState, useTransition } from "react";
import { Loader2, ArrowDownToLine, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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
import { requestWithdrawalAction } from "@/app/[locale]/dashboard/wallet/actions";

type Wallet = {
  id: string;
  currency: string;
  available_balance: number;
};

export function WithdrawDialog({
  open,
  onOpenChange,
  wallet,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: Wallet;
}) {
  const t = useTranslations("dashboard.wallet.withdraw");
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    if (numericAmount > wallet.available_balance) {
      toast.error(t("insufficientBalance"));
      return;
    }

    startTransition(async () => {
      const result = await requestWithdrawalAction(wallet.id, numericAmount);

      if (!result.success) {
        toast.error(
          t(`errors.${result.error}`, { default: "فشل طلب السحب" })
        );
        return;
      }

      toast.success(t("success"));
      setAmount("");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <ArrowDownToLine className="size-7 text-amber-500" />
          </div>
          <DialogTitle className="mt-4 text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {t("availableBalance")}
            </p>
            <p className="mt-1 text-xl font-bold" dir="ltr">
              {Number(wallet.available_balance).toLocaleString()}{" "}
              {wallet.currency}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t("amountLabel")}</Label>
            <Input
              id="amount"
              type="number"
              min="1"
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

          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{t("comingSoonNote")}</p>
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
              disabled={pending || !amount}
              className="rounded-xl bg-amber-500 hover:bg-amber-600"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowDownToLine className="size-4" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}