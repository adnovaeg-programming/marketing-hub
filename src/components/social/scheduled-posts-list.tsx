"use client";

import { useState, useMemo, useDeferredValue, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RotateCcw,
  X,
  Play,
  Calendar,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelScheduledPostAction,
  retryScheduledPostAction,
  processPublishingQueueAction,
} from "@/lib/publishing/actions";

type ScheduledPost = {
  id: string;
  platform: string;
  caption: string | null;
  scheduled_for: string;
  status: string;
  attempts: number;
  max_attempts: number;
  published_at: string | null;
  external_post_url: string | null;
  error_message: string | null;
  content: { id: string; title: string } | null;
  account: { id: string; platform: string; account_name: string } | null;
};

type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "published"
  | "failed"
  | "cancelled";

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: typeof Clock; label: string }
> = {
  pending: {
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Clock,
    label: "pending",
  },
  processing: {
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Loader2,
    label: "processing",
  },
  published: {
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    label: "published",
  },
  failed: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
    label: "failed",
  },
  cancelled: {
    color: "bg-muted text-muted-foreground border-border/40",
    icon: AlertCircle,
    label: "cancelled",
  },
  retry: {
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: RotateCcw,
    label: "retry",
  },
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function ScheduledPostsList({
  posts,
  accounts,
}: {
  posts: ScheduledPost[];
  accounts: { id: string; platform: string; account_name: string }[];
}) {
  const t = useTranslations("dashboard.social.scheduled");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.content?.title.toLowerCase().includes(q) ||
        p.caption?.toLowerCase().includes(q) ||
        p.account?.account_name.toLowerCase().includes(q)
      );
    });
  }, [posts, deferredQuery, filter]);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "pending", label: t("filters.pending") },
    { key: "published", label: t("filters.published") },
    { key: "failed", label: t("filters.failed") },
  ];

  const handleCancel = (id: string) => {
    if (!confirm(t("confirmCancel"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await cancelScheduledPostAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الإلغاء");
        return;
      }
      toast.success(t("cancelled"));
      router.refresh();
    });
  };

  const handleRetry = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await retryScheduledPostAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل إعادة المحاولة");
        return;
      }
      toast.success(t("retried"));
      router.refresh();
    });
  };

  const handleProcessQueue = () => {
    startTransition(async () => {
      const result = await processPublishingQueueAction();
      if (!result.success) {
        toast.error("فشل المعالجة");
        return;
      }
      toast.success(t("queueProcessed", { count: result.data.processed }));
      router.refresh();
    });
  };

  const pendingCount = posts.filter(
    (p) => p.status === "pending" && new Date(p.scheduled_for) <= new Date()
  ).length;

  return (
    <>
      {/* Header Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/social"
          className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
        >
          ← {t("backToAccounts")}
        </Link>

        {pendingCount > 0 && (
          <Button
            onClick={handleProcessQueue}
            disabled={pending}
            className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Zap className="size-4" />
            )}
            {t("processNow", { count: pendingCount })}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {t("stats.pending")}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {posts.filter((p) => p.status === "pending").length}
          </p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5" />
            {t("stats.published")}
          </div>
          <p className="mt-2 text-2xl font-bold">
            {posts.filter((p) => p.status === "published").length}
          </p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <XCircle className="size-3.5" />
            {t("stats.failed")}
          </div>
          <p className="mt-2 text-2xl font-bold text-destructive">
            {posts.filter((p) => p.status === "failed").length}
          </p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            {t("stats.accounts")}
          </div>
          <p className="mt-2 text-2xl font-bold">{accounts.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-strong mt-6 flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <Calendar className="size-12 text-muted-foreground/40" />
          <h2 className="mt-4 text-lg font-semibold">{t("empty.title")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((post) => {
            const config = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;
            const isProcessing = pending && actionId === post.id;
            const canCancel = ["pending", "retry"].includes(post.status);
            const canRetry = post.status === "failed";

            return (
              <div
                key={post.id}
                className="glass flex flex-col gap-4 rounded-2xl p-4 md:flex-row md:items-center"
              >
                {/* Status */}
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${config.color}`}
                >
                  <Icon
                    className={`size-4 ${
                      post.status === "processing" ? "animate-spin" : ""
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.color}`}
                    >
                      {t(`status.${config.label}`)}
                    </span>
                    <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {PLATFORM_LABELS[post.platform] ?? post.platform}
                    </span>
                    {post.attempts > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {post.attempts}/{post.max_attempts}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-1 font-medium">
                    {post.content?.title ?? "—"}
                  </p>

                  {post.caption && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {post.caption}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                    <span>
                      {t("scheduledFor")}:{" "}
                      {new Date(post.scheduled_for).toLocaleString()}
                    </span>
                    {post.published_at && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t("publishedAt")}:{" "}
                        {new Date(post.published_at).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {post.error_message && (
                    <p className="mt-1 text-[10px] text-destructive">
                      {post.error_message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2">
                  {post.external_post_url && (
                    <a
                      href={post.external_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                    >
                      {t("view")}
                    </a>
                  )}
                  {canRetry && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(post.id)}
                      disabled={isProcessing}
                      className="glass rounded-lg text-xs"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <RotateCcw className="size-3" />
                      )}
                      {t("retry")}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(post.id)}
                      disabled={isProcessing}
                      className="rounded-lg text-xs text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-3" />
                      {t("cancel")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}