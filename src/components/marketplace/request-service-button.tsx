"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { RequestServiceDialog } from "@/components/marketplace/request-service-dialog";

export function RequestServiceButton({
  listingId,
  basePrice,
  currency,
  packages,
}: {
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
  const t = useTranslations("marketplace.details");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="group mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
        size="lg"
      >
        {t("orderNow")}
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
      </Button>

      <RequestServiceDialog
        open={open}
        onOpenChange={setOpen}
        listingId={listingId}
        basePrice={basePrice}
        currency={currency}
        packages={packages}
      />
    </>
  );
}