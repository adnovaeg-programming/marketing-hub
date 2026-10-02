"use client";

import { useState, useMemo, useDeferredValue, useTransition } from "react";
import {
  FileText,
  Search,
  Check,
  X,
  Loader2,
  Clock,
  User,
  Wallet,
  Calendar,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  acceptProposalAction,
  rejectProposalAction,
} from "@/lib/contracts/actions";

type Proposal = {
  id: string;
  reference: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  delivery_days: number;
  status: string;
  created_at: string;
  expires_at: string | null;
  client: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
  provider: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
};

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  accepted:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  withdrawn: "bg-muted text-muted-foreground border-border/40",
  expired: "bg-muted text-muted-foreground border-border/40",
};

export function ProposalsList({
  proposals,
  currentUserId,
}: {
  proposals: Proposal[];
  currentUserId: string;
}) {
  const t = useTranslations("dashboard.proposals");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return proposals.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q)
      );
    });
  }, [proposals, deferredQuery, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "pending", label: t("filters.pending") },
    { key: "accepted", label: t("filters.accepted") },
    { key: "rejected", label: t("filters.rejected") },
  ];

  const handleAccept = (id: string) => {
    if (!confirm(t("confirmAccept"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await acceptProposalAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل القبول");
        return;
      }
      toast.success(t("accepted"));
      router.push(`/dashboard/contracts/${result.data}`);
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt(t("rejectReasonPrompt"));
    if (reason === null) return;
    setActionId(id);
    startTransition(async () => {
      const result = await rejectProposalAction(id, reason || undefined);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الرفض");
        return;
      }
      toast.success(t("rejected"));
      router.refresh();
    });
  };

  if (proposals.length === 0) {
    return (
      <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-20 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
          <FileText className="size-10 text-white" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("empty.description")}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="glass h-11 rounded-xl ps-10"
          />
        </div>

        <div className="glass flex items-center gap-1 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-6 flex flex-col items-center justify-center rounded-3xl py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((proposal) => {
            const isClient = proposal.client?.id === currentUserId;
            const isProvider = proposal.provider?.id === currentUserId;
            const otherParty = isClient ? proposal.provider : proposal.client;

            const otherName = otherParty
              ? [otherParty.first_name, otherParty.last_name]
                  .filter(Boolean)
                  .join(" ") || otherParty.email
              : "—";
            const initial = otherName.charAt(0).toUpperCase();
            const isPending = proposal.status === "pending";
            const isProcessing = pending && actionId === proposal.id;

            return (
              <div
                key={proposal.id}
                className="glass-strong rounded-2xl p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  {/* Main */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                          STATUS_STYLES[proposal.status] ??
                          STATUS_STYLES.pending
                        }`}
                      >
                        {t(`status.${proposal.status}`)}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {proposal.reference}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 line-clamp-2 text-base font-semibold">
                      {proposal.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {proposal.description}
                    </p>

                    {/* Other party */}
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                        {otherParty?.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={otherParty.avatar_url}
                            alt={otherName}
                            className="size-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] text-muted-foreground">
                          {isClient ? t("fromProvider") : t("fromClient")}
                        </p>
                        <p className="truncate text-xs font-medium">
                          {otherName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col gap-3 lg:w-48 lg:shrink-0">
                    <div className="text-start lg:text-end">
                      <p className="text-[10px] text-muted-foreground">
                        {t("amount")}
                      </p>
                      <p
                        className="text-xl font-bold text-primary"
                        dir="ltr"
                      >
                        {Number(proposal.amount).toLocaleString()}{" "}
                        {proposal.currency}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground lg:justify-end">
                      <Clock className="size-3" />
                      <span>
                        {proposal.delivery_days} {t("days")}
                      </span>
                    </div>

                    {/* Actions — only client */}
                    {isClient && isPending && (
                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(proposal.id)}
                          disabled={isProcessing}
                          className="flex-1 rounded-full bg-emerald-500 hover:bg-emerald-600 lg:w-full"
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          {t("accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(proposal.id)}
                          disabled={isProcessing}
                          className="flex-1 rounded-full text-destructive hover:bg-destructive/10 lg:w-full"
                        >
                          <X className="size-3.5" />
                          {t("reject")}
                        </Button>
                      </div>
                    )}

                    {isProvider && (
                      <p className="text-center text-[10px] text-muted-foreground lg:text-end">
                        {t("waitingClient")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}