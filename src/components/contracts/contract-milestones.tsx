"use client";

import { useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  submitMilestoneAction,
  approveMilestoneAction,
} from "@/lib/contracts/actions";

type Milestone = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  due_date: string | null;
  status: string;
  order_index: number;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
};

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: typeof Clock; label: string }
> = {
  pending: {
    color: "bg-muted text-muted-foreground border-border/40",
    icon: Clock,
    label: "pending",
  },
  in_progress: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Loader2,
    label: "in_progress",
  },
  submitted: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Send,
    label: "submitted",
  },
  approved: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    label: "approved",
  },
  rejected: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertCircle,
    label: "rejected",
  },
  paid: {
    color: "bg-primary/10 text-primary border-primary/20",
    icon: CheckCircle2,
    label: "paid",
  },
};

export function ContractMilestones({
  milestones,
  isClient,
  isProvider,
  currency,
}: {
  milestones: Milestone[];
  isClient: boolean;
  isProvider: boolean;
  currency: string;
}) {
  const t = useTranslations("dashboard.contractDetails.milestones");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (id: string) => {
    startTransition(async () => {
      const result = await submitMilestoneAction(id);
      if (!result.success) {
        toast.error("فشل الإرسال");
        return;
      }
      toast.success(t("submitted"));
      router.refresh();
    });
  };

  const handleApprove = (id: string) => {
    if (!confirm(t("confirmApprove"))) return;
    startTransition(async () => {
      const result = await approveMilestoneAction(id);
      if (!result.success) {
        toast.error("فشل الاعتماد");
        return;
      }
      toast.success(t("approved"));
      router.refresh();
    });
  };

  if (milestones.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-16 text-center">
        <Package className="size-12 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Package className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{t("title")}</h2>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {milestones.length}
        </span>
      </div>

      <div className="space-y-3">
        {milestones.map((m) => {
          const config = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.pending;
          const Icon = config.icon;
          const canSubmit =
            isProvider && ["pending", "in_progress"].includes(m.status);
          const canApprove = isClient && m.status === "submitted";

          return (
            <div
              key={m.id}
              className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
            >
              {/* Icon + Index */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${config.color}`}
                >
                  <Icon
                    className={`size-4 ${
                      m.status === "in_progress" ? "animate-spin" : ""
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{m.name}</p>
                  {m.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {m.description}
                    </p>
                  )}
                  {m.due_date && (
                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                      {t("dueDate")}:{" "}
                      {new Date(m.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div className="text-start sm:text-end">
                <p className="text-xs text-muted-foreground">
                  {t("amount")}
                </p>
                <p className="text-base font-bold" dir="ltr">
                  {Number(m.amount).toLocaleString()} {currency}
                </p>
              </div>

              {/* Actions */}
              {(canSubmit || canApprove) && (
                <div className="flex gap-2 sm:ms-4">
                  {canSubmit && (
                    <Button
                      size="sm"
                      onClick={() => handleSubmit(m.id)}
                      disabled={pending}
                      className="rounded-full bg-gradient-to-r from-primary to-accent"
                    >
                      {pending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      {t("submit")}
                    </Button>
                  )}
                  {canApprove && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(m.id)}
                      disabled={pending}
                      className="rounded-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      {pending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      {t("approve")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}