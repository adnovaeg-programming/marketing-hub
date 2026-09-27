"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

const PLAN_KEYS = ["starter", "pro", "business"] as const;

const PRICES = {
  starter: { monthly: 0, yearly: 0 },
  pro: { monthly: 29, yearly: 279 },
  business: { monthly: 99, yearly: 949 },
} as const;

export function Pricing() {
  const t = useTranslations("pricing");
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* رأس القسم */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm backdrop-blur">
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>

          <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
        </div>

        {/* مفتاح التبديل شهري/سنوي */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsYearly(false)}
            className={`text-sm font-medium transition ${
              !isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t("billingMonthly")}
          </button>

          <button
            onClick={() => setIsYearly((v) => !v)}
            className="relative h-7 w-12 rounded-full bg-muted transition"
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-primary transition-all ${
                isYearly ? "left-1" : "right-1"
              }`}
            />
          </button>

          <button
            onClick={() => setIsYearly(true)}
            className={`text-sm font-medium transition ${
              isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t("billingYearly")}
            <span className="ms-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
              {t("savePercent")}
            </span>
          </button>
        </div>

        {/* الخطط */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const price = isYearly ? PRICES[key].yearly : PRICES[key].monthly;
            const isPro = key === "pro";
            const features = t.raw(`plans.${key}.features`) as string[];

            return (
              <div
                key={key}
                className={`
                  relative rounded-2xl border p-8 backdrop-blur transition
                  ${
                    isPro
                      ? "border-primary/60 bg-gradient-to-b from-primary/10 to-card/50 shadow-2xl shadow-primary/20 lg:scale-105"
                      : "border-border/60 bg-card/50 hover:border-primary/40"
                  }
                `}
              >
                {isPro && (
                  <div className="absolute -top-3 right-1/2 translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-l from-primary to-accent px-4 py-1 text-xs font-bold text-white shadow-lg">
                      {t("popular")}
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold">{t(`plans.${key}.name`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`plans.${key}.description`)}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground">
                    {isYearly ? t("perYear") : t("perMonth")}
                  </span>
                </div>

                <Button
                  size="lg"
                  variant={isPro ? "default" : "outline"}
                  className="mt-6 w-full rounded-full"
                >
                  {t(`plans.${key}.cta`)}
                </Button>

                <ul className="mt-8 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Check className="size-3" />
                      </span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}