"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  Plus,
  Smartphone,
  Building2,
  Wallet,
  CreditCard,
} from "lucide-react";
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
import { createPayoutMethodAction } from "@/lib/payouts/actions";

type MethodType =
  | "instapay"
  | "bank_transfer"
  | "vodafone_cash"
  | "paypal"
  | "paymob";

const TYPES: {
  key: MethodType;
  icon: typeof Smartphone;
}[] = [
  { key: "instapay", icon: Smartphone },
  { key: "bank_transfer", icon: Building2 },
  { key: "vodafone_cash", icon: Smartphone },
  { key: "paypal", icon: Wallet },
];

export function NewPayoutMethodDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations("dashboard.payouts.methods.form");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState<MethodType>("instapay");
  const [label, setLabel] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [bankName, setBankName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim() || !identifier.trim()) {
      toast.error(t("fillRequired"));
      return;
    }

    if (type === "bank_transfer" && !bankName.trim()) {
      toast.error(t("fillRequired"));
      return;
    }

    startTransition(async () => {
      const result = await createPayoutMethodAction({
        type,
        label,
        accountIdentifier: identifier,
        bankName: type === "bank_transfer" ? bankName : undefined,
        isDefault: true,
      });

      if (!result.success) {
        toast.error(t("failed"));
        return;
      }

      toast.success(t("success"));
      setLabel("");
      setIdentifier("");
      setBankName("");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label>{t("type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((item) => {
                const Icon = item.icon;
                const isActive = type === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setType(item.key)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "glass text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-medium">
                      {t(`types.${item.key}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">{t("label")}</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("labelPlaceholder")}
              className="h-11 rounded-xl"
            />
          </div>

          {/* Bank Name */}
          {type === "bank_transfer" && (
            <div className="space-y-2">
              <Label htmlFor="bankName">{t("bankName")}</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={t("bankNamePlaceholder")}
                className="h-11 rounded-xl"
              />
            </div>
          )}

          {/* Account Identifier */}
          <div className="space-y-2">
            <Label htmlFor="identifier">{t(`identifiers.${type}`)}</Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t(`identifiers.${type}Placeholder`)}
              className="h-11 rounded-xl"
              dir="ltr"
            />
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
              disabled={pending}
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