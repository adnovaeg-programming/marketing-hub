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
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
        </div>

        {/* Toggle */}
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
            className="glass relative h-7 w-12 rounded-full"
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute top-1 size-5 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 transition-all ${
                isYearly ? "left-1" : "right-1"
              }`}
            />
          </button>

          <button
            onClick={() => setIsYearly(true)}
            className={`flex items-center text-sm font-medium transition ${
              isYearly ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {t("billingYearly")}
            <span className="ms-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
              {t("savePercent")}
            </span>
          </button>
        </div>

        {/* Plans */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {PLAN_KEYS.map((key) => {
            const price = isYearly ? PRICES[key].yearly : PRICES[key].monthly;
            const isPro = key === "pro";
            const features = t.raw(`plans.${key}.features`) as string[];

            return (
              <div
                key={key}
                className={`
                  relative rounded-3xl p-8 transition
                  ${
                    isPro
                      ? "glass-strong lg:scale-105"
                      : "glass glass-hover"
                  }
                `}
                style={
                  isPro
                    ? {
                        boxShadow:
                          "0 20px 60px var(--glow-primary), 0 0 0 1px color-mix(in oklch, var(--primary) 40%, transparent)",
                      }
                    : undefined
                }
              >
                {isPro && (
                  <>
                    <div className="absolute -top-3 right-1/2 translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-l from-primary to-accent px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/40">
                        {t("popular")}
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent" />
                  </>
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
                  className={`mt-6 w-full rounded-full ${
                    isPro
                      ? "bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/40"
                      : ""
                  }`}
                >
                  {t(`plans.${key}.cta`)}
                </Button>

                <ul className="mt-8 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
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