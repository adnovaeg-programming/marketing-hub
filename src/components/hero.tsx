import {
  ArrowLeft,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
  Eye,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        {/* Text Content */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          <div className="glass animate-fade-in-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm shadow-lg shadow-primary/10">
            <Sparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          {/* Title */}
          <h1 className="animate-fade-in-up max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {t("title")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h1>

          {/* Description */}
          <p className="animate-fade-in-up max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group rounded-full bg-gradient-to-r from-primary to-accent px-8 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
            >
              {t("ctaPrimary")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass glass-hover group rounded-full px-8"
            >
              <Play className="size-4 transition-transform group-hover:scale-110" />
              {t("ctaSecondary")}
            </Button>
          </div>

          <p className="animate-fade-in-up text-sm text-muted-foreground">
            {t("trustNote")}
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mt-20 md:mt-28">
          {/* 3D Blob — Left */}
          <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 hidden lg:block">
            <div
              className="float-layer size-72 bg-gradient-to-br from-primary via-primary/70 to-accent opacity-40 blur-3xl"
              style={{
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              }}
            />
          </div>

          {/* 3D Blob — Right */}
          <div className="pointer-events-none absolute -right-32 top-1/4 -z-10 hidden lg:block">
            <div
              className="float-layer size-56 bg-gradient-to-tr from-accent via-accent/70 to-primary opacity-35 blur-3xl"
              style={{
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                animationDelay: "2s",
              }}
            />
          </div>

          {/* Central glow behind card */}
          <div className="absolute inset-x-0 -top-10 -z-10 mx-auto h-40 max-w-3xl rounded-full bg-primary/25 blur-3xl" />

          {/* Device Frame */}
          <div className="mx-auto max-w-6xl">
            <div className="glass-strong overflow-hidden rounded-3xl p-2 shadow-2xl">
              {/* Browser Bar */}
              <div className="flex items-center gap-1.5 px-3 py-2.5">
                <span className="size-3 rounded-full bg-red-500/70" />
                <span className="size-3 rounded-full bg-yellow-500/70" />
                <span className="size-3 rounded-full bg-green-500/70" />
                <span className="mx-auto rounded-md bg-muted/40 px-3 py-0.5 text-[10px] text-muted-foreground">
                  app.marketing-hub.io
                </span>
              </div>

              {/* Dashboard Mock */}
              <div className="grid grid-cols-12 gap-3 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/5 p-3 md:p-4">
                {/* Sidebar */}
                <aside className="col-span-2 hidden space-y-2 md:block">
                  <div className="h-9 rounded-xl bg-gradient-to-br from-primary to-accent opacity-90" />
                  <div className="h-7 rounded-lg bg-muted/60" />
                  <div className="h-7 rounded-lg bg-muted/60" />
                  <div className="h-7 rounded-lg bg-muted/60" />
                  <div className="h-7 rounded-lg bg-muted/60" />
                </aside>

                {/* Main */}
                <div className="col-span-12 space-y-3 md:col-span-10">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <TrendingUp className="size-4 text-primary" />
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          +15%
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground md:text-xs">
                        Reach
                      </p>
                      <p className="text-sm font-bold md:text-xl">48.2K</p>
                    </div>

                    <div className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <Users className="size-4 text-accent" />
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          +8%
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground md:text-xs">
                        Followers
                      </p>
                      <p className="text-sm font-bold md:text-xl">12.5K</p>
                    </div>

                    <div className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <BarChart3 className="size-4 text-primary" />
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          +22%
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground md:text-xs">
                        Engagement
                      </p>
                      <p className="text-sm font-bold md:text-xl">8.4%</p>
                    </div>

                    <div className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <Eye className="size-4 text-accent" />
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                          +34%
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground md:text-xs">
                        Impressions
                      </p>
                      <p className="text-sm font-bold md:text-xl">96.8K</p>
                    </div>
                  </div>

                  {/* Chart Card */}
                  <div className="glass rounded-xl p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium">Performance</p>
                      <p className="text-[10px] text-muted-foreground">
                        Last 12 months
                      </p>
                    </div>
                    <div className="flex h-24 items-end gap-1.5 md:h-32">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/40 to-primary transition-all hover:from-accent/40 hover:to-accent"
                            style={{ height: `${h}%` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}