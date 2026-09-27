import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="group rounded-full px-8">
              {t("ctaPrimary")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8">
              <Play className="size-4" />
              {t("ctaSecondary")}
            </Button>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">{t("trustNote")}</p>
        </div>

        <div className="relative mt-16 md:mt-24">
          <div className="absolute inset-x-0 -top-10 -z-10 mx-auto h-40 max-w-3xl rounded-full bg-primary/30 blur-3xl" />

          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-2 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="size-3 rounded-full bg-red-500/70" />
              <span className="size-3 rounded-full bg-yellow-500/70" />
              <span className="size-3 rounded-full bg-green-500/70" />
              <span className="mx-auto text-xs text-muted-foreground">
                app.marketing-hub.io
              </span>
            </div>

            <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-muted/50 to-muted/20">
              <div className="text-center">
                <Sparkles className="mx-auto size-12 text-primary/60" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("dashboardPreview")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}