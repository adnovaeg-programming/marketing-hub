"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Trash2,
  Star,
  Loader2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import {
  deletePayoutMethodAction,
  setDefaultPayoutMethodAction,
} from "@/lib/payouts/actions";

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

const TYPE_ICONS: Record<string, typeof CreditCard> = {
  instapay: Smartphone,
  bank_transfer: Building2,
  vodafone_cash: Smartphone,
  paypal: Wallet,
  paymob: CreditCard,
};

export function PayoutMethodsList({
  methods,
  onAddClick,
}: {
  methods: PayoutMethod[];
  onAddClick: () => void;
}) {
  const t = useTranslations("dashboard.payouts.methods");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await deletePayoutMethodAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  };

  const handleSetDefault = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await setDefaultPayoutMethodAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل التحديث");
        return;
      }
      toast.success(t("setAsDefault"));
      router.refresh();
    });
  };

  if (methods.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-16 text-center">
        <div className="glass flex size-16 items-center justify-center rounded-2xl">
          <CreditCard className="size-8 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t("empty.title")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
        <button
          onClick={onAddClick}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30"
        >
          <Plus className="size-4" />
          {t("add")}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <CreditCard className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {methods.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => {
          const Icon = TYPE_ICONS[method.type] ?? CreditCard;
          const isProcessing = pending && actionId === method.id;

          return (
            <div
              key={method.id}
              className={`glass glass-hover relative overflow-hidden rounded-2xl p-4 ${
                method.is_default ? "ring-2 ring-primary/40" : ""
              }`}
            >
              {method.is_default && (
                <span className="absolute end-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
                  {t("default")}
                </span>
              )}

              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                  <Icon className="size-5 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {method.label}
                  </p>
                  <p
                    className="mt-0.5 truncate font-mono text-xs text-muted-foreground"
                    dir="ltr"
                  >
                    {method.account_identifier}
                  </p>
                  {method.bank_name && (
                    <p className="truncate text-[10px] text-muted-foreground">
                      {method.bank_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                <button
                  onClick={() => handleSetDefault(method.id)}
                  disabled={method.is_default || isProcessing}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isProcessing ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Star className="size-3" />
                  )}
                  {method.is_default ? t("isDefault") : t("setDefault")}
                </button>

                <button
                  onClick={() => handleDelete(method.id)}
                  disabled={isProcessing}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t("delete")}
                >
                  {isProcessing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}