"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Sparkles, AlertCircle, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export function RequestServiceDialog({
  open,
  onOpenChange,
  listingId,
  basePrice,
  currency,
  packages,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  basePrice: number;
  currency: string;
  packages: {
    id: string;
    tier: string;
    name: string;
    price: number;
    delivery_days: number;
    revisions: number;
  }[];
}) {
  const t = useTranslations("marketplace.order");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedTier, setSelectedTier] = useState<string>("basic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const sortedPackages = [...packages].sort((a, b) => {
    const order = { basic: 1, standard: 2, premium: 3 };
    return (
      (order[a.tier as keyof typeof order] ?? 0) -
      (order[b.tier as keyof typeof order] ?? 0)
    );
  });

  const selectedPackage = sortedPackages.find((p) => p.tier === selectedTier);
  const displayPrice = selectedPackage?.price ?? basePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error(t("fillRequired"));
      return;
    }

    startTransition(async () => {
      // ملاحظة: في D4 هنربط بالـ Contracts.
      // دلوقتي بنعمل Service Request عادي.
      toast.success(t("success"), {
        description: t("successDescription"),
      });

      setTimeout(() => {
        onOpenChange(false);
        router.push("/dashboard/marketplace/requests");
      }, 800);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Sparkles className="size-7 text-white" />
          </div>
          <DialogTitle className="mt-4 text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Package Selector */}
          {sortedPackages.length > 0 && (
            <div className="space-y-2">
              <Label>{t("selectPackage")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {sortedPackages.map((pkg) => {
                  const isActive = selectedTier === pkg.tier;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedTier(pkg.tier)}
                      className={`rounded-xl border p-3 text-center transition ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "glass text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase">
                        {pkg.name}
                      </p>
                      <p className="mt-1 text-sm font-bold" dir="ltr">
                        {pkg.price.toLocaleString()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="glass space-y-2 rounded-xl p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {selectedPackage?.name ?? "Service"}
              </span>
              <span className="font-semibold" dir="ltr">
                {displayPrice.toLocaleString()} {currency}
              </span>
            </div>
            {selectedPackage && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("delivery")}
                  </span>
                  <span dir="ltr">
                    {selectedPackage.delivery_days} {t("days")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("revisions")}
                  </span>
                  <span>{selectedPackage.revisions}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-border/40 pt-2">
              <span className="font-semibold">{t("total")}</span>
              <span className="font-bold text-primary" dir="ltr">
                {displayPrice.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("projectTitle")} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("projectTitlePlaceholder")}
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("projectDetails")} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("projectDetailsPlaceholder")}
              rows={4}
              className="rounded-xl"
              required
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
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-primary to-accent"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}