"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createListingAction } from "@/lib/marketplace/actions";

type Category = {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
};

export function NewListingDialog({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}) {
  const t = useTranslations("dashboard.marketplace.form");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [currency, setCurrency] = useState<"EGP" | "USD" | "SAR" | "AED">(
    "EGP"
  );
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [revisions, setRevisions] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId || !title.trim() || !description.trim()) {
      toast.error(t("fillRequired"));
      return;
    }

    const priceNum = Number(basePrice);
    if (!priceNum || priceNum <= 0) {
      toast.error(t("invalidPrice"));
      return;
    }

    startTransition(async () => {
      const result = await createListingAction({
        categoryId,
        title,
        description,
        basePrice: priceNum,
        currency,
        deliveryDays: Number(deliveryDays) || 7,
        revisions: Number(revisions) || 0,
      });

      if (!result.success) {
        toast.error(t("failed"));
        return;
      }

      toast.success(t("success"), { description: t("successDescription") });
      setCategoryId("");
      setTitle("");
      setDescription("");
      setBasePrice("");
      setDeliveryDays("7");
      setRevisions("1");
      onOpenChange(false);
      router.refresh();
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
          {/* Category */}
          <div className="space-y-2">
            <Label>{t("category")} *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder={t("categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("listingTitle")} *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("listingTitlePlaceholder")}
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("descriptionLabel")} *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              className="rounded-xl"
              required
            />
          </div>

          {/* Price + Currency */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">{t("basePrice")} *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="1000"
                className="h-11 rounded-xl"
                dir="ltr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("currency")}</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as never)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGP">EGP</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delivery + Revisions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery">{t("deliveryDays")}</Label>
              <Input
                id="delivery"
                type="number"
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revisions">{t("revisions")}</Label>
              <Input
                id="revisions"
                type="number"
                min="0"
                value={revisions}
                onChange={(e) => setRevisions(e.target.value)}
                className="h-11 rounded-xl"
                dir="ltr"
              />
            </div>
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