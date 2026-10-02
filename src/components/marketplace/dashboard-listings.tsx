"use client";

import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  Plus,
  Briefcase,
  Star,
  Clock,
  Eye,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Loader2,
  ExternalLink,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewListingDialog } from "@/components/marketplace/new-listing-dialog";
import {
  deleteListingAction,
  updateListingStatusAction,
} from "@/lib/marketplace/actions";

type Listing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  base_price: number;
  currency: string;
  delivery_days: number;
  views_count: number;
  orders_count: number;
  featured: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  category: { id: string; name: string } | null;
};

type Category = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
};

const STATUS_CONFIG: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border/40",
  published:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paused:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-border/40",
};

export function DashboardListings({
  listings,
  categories,
}: {
  listings: Listing[];
  categories: Category[];
}) {
  const t = useTranslations("dashboard.marketplace");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await updateListingStatusAction(
        id,
        status as "draft" | "published" | "paused" | "archived"
      );
      setActionId(null);
      if (!result.success) {
        toast.error("فشل التحديث");
        return;
      }
      toast.success(t("statusUpdated"));
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    setActionId(id);
    startTransition(async () => {
      const result = await deleteListingAction(id);
      setActionId(null);
      if (!result.success) {
        toast.error("فشل الحذف");
        return;
      }
      toast.success(t("deleted"));
      router.refresh();
    });
  };

  if (listings.length === 0) {
    return (
      <>
        <div className="glass-strong flex flex-col items-center justify-center rounded-3xl py-20 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
            <Briefcase className="size-10 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">{t("empty.title")}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {t("empty.description")}
          </p>
          <Button
            onClick={() => setNewDialogOpen(true)}
            className="mt-6 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
          >
            <Plus className="size-4" />
            {t("empty.cta")}
          </Button>
        </div>

        <NewListingDialog
          open={newDialogOpen}
          onOpenChange={setNewDialogOpen}
          categories={categories}
        />
      </>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <p className="text-xs text-muted-foreground">
              {t("stats.total")}
            </p>
          </div>
          <p className="mt-3 text-3xl font-bold">{listings.length}</p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-accent" />
            <p className="text-xs text-muted-foreground">
              {t("stats.views")}
            </p>
          </div>
          <p className="mt-3 text-3xl font-bold">
            {listings.reduce((sum, l) => sum + l.views_count, 0)}
          </p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-emerald-500" />
            <p className="text-xs text-muted-foreground">
              {t("stats.orders")}
            </p>
          </div>
          <p className="mt-3 text-3xl font-bold">
            {listings.reduce((sum, l) => sum + l.orders_count, 0)}
          </p>
        </div>
        <div className="glass glass-hover rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              {t("stats.avgRating")}
            </p>
          </div>
          <p className="mt-3 text-3xl font-bold">
            {listings.filter((l) => l.rating_count > 0).length > 0
              ? (
                  listings
                    .filter((l) => l.rating_count > 0)
                    .reduce((sum, l) => sum + l.rating_avg, 0) /
                  listings.filter((l) => l.rating_count > 0).length
                ).toFixed(1)
              : "—"}
          </p>
        </div>
      </div>

      {/* Header + New */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("myListings")}</h2>
        <Button
          onClick={() => setNewDialogOpen(true)}
          className="rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
        >
          <Plus className="size-4" />
          {t("newListing")}
        </Button>
      </div>

      {/* Listings */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => {
          const isProcessing = pending && actionId === listing.id;
          return (
            <div
              key={listing.id}
              className="glass glass-hover group relative overflow-hidden rounded-2xl p-5 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                    STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.draft
                  }`}
                >
                  {t(`status.${listing.status}`)}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted/50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <MoreVertical className="size-4" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="glass-strong"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/marketplace/${listing.id}`}
                        target="_blank"
                        className="cursor-pointer"
                      >
                        <ExternalLink className="size-4" />
                        {t("actions.view")}
                      </Link>
                    </DropdownMenuItem>
                    {listing.status === "published" && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(listing.id, "paused")
                        }
                        className="cursor-pointer"
                      >
                        <Pause className="size-4" />
                        {t("actions.pause")}
                      </DropdownMenuItem>
                    )}
                    {listing.status === "paused" && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(listing.id, "published")
                        }
                        className="cursor-pointer"
                      >
                        <Play className="size-4" />
                        {t("actions.publish")}
                      </DropdownMenuItem>
                    )}
                    {listing.status === "draft" && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(listing.id, "published")
                        }
                        className="cursor-pointer"
                      >
                        <Play className="size-4" />
                        {t("actions.publish")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(listing.id)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title */}
              <Link
                href={`/marketplace/${listing.id}`}
                target="_blank"
                className="mt-3 line-clamp-2 block text-base font-semibold transition hover:text-primary"
              >
                {listing.title}
              </Link>

              {/* Category */}
              {listing.category && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {listing.category.name}
                </p>
              )}

              {/* Meta */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/40 pt-4 text-xs">
                <div className="flex items-center gap-1">
                  <Eye className="size-3.5 text-muted-foreground" />
                  <span>{listing.views_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShoppingBag className="size-3.5 text-muted-foreground" />
                  <span>{listing.orders_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 text-amber-400" />
                  <span>
                    {listing.rating_count > 0
                      ? listing.rating_avg.toFixed(1)
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <p className="mt-3 text-lg font-bold text-primary" dir="ltr">
                {listing.base_price.toLocaleString()} {listing.currency}
              </p>
            </div>
          );
        })}
      </div>

      <NewListingDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        categories={categories}
      />
    </>
  );
}