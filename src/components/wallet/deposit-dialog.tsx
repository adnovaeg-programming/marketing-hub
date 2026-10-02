"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Coins } from "lucide-react";
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
import { depositAction } from "@/app/[locale]/dashboard/wallet/actions";

type Wallet = {
  id: string;
  currency: string;
  available_balance: number;
};

const PRESETS = [100, 500, 1000, 5000];

export function DepositDialog({
  open,
  onOpenChange,
  wallet,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: Wallet;
}) {
  const t = useTranslations("dashboard.wallet.deposit");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    startTransition(async () => {
      const result = await depositAction(
        wallet.id,
        numericAmount,
        t("defaultDescription")
      );

      if (!result.success) {
        toast.error(t(`errors.${result.error}`, { default: "فشل الإيداع" }));
        return;
      }

      toast.success(t("success", { amount: numericAmount.toLocaleString() }));
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
            <Coins className="size-7 text-white" />
          </div>
          <DialogTitle className="mt-4 text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amountLabel")}</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-12 rounded-xl text-center text-lg font-semibold"
              dir="ltr"
              autoFocus
            />
          </div>

          {/* Preset buttons */}
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className="glass rounded-lg px-2 py-2 text-xs font-medium transition hover:bg-primary/10 hover:text-primary"
              >
                {preset.toLocaleString()}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>{t("note")}</p>
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
              className="rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}