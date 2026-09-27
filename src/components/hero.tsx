import {
  ArrowLeft,
  Play,
  Sparkles,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        {/* الجزء العلوي — النصوص */}
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Badge زجاجي */}
          <div className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span className="text-muted-foreground">{t("badge")}</span>
          </div>

          {/* العنوان */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {t("title")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h1>

          {/* الوصف */}
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>

          {/* أزرار CTA */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group rounded-full px-8 shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl hover:shadow-primary/40"
            >
              {t("ctaPrimary")}
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass glass-hover rounded-full px-8"
            >
              <Play className="size-4" />
              {t("ctaSecondary")}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">{t("trustNote")}</p>
        </div>

        {/* الجزء السفلي — Dashboard Preview + 3D Shapes */}
        <div className="relative mt-20 md:mt-28">
          {/* 3D Blob — يسار */}
          <div className="pointer-events-none absolute -left-16 top-1/3 -z-10 hidden lg:block">
            <div
              className="animate-float size-64 bg-gradient-to-br from-primary via-primary/70 to-accent opacity-50 blur-3xl"
              style={{
                borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              }}
            />
          </div>

          {/* 3D Blob — يمين */}
          <div className="pointer-events-none absolute -right-16 top-1/4 -z-10 hidden lg:block">
            <div
              className="animate-float-slow size-48 bg-gradient-to-tr from-accent via-accent/70 to-primary opacity-40 blur-3xl"
              style={{
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                animationDelay: "2s",
              }}
            />
          </div>

          {/* توهج مركزي خلف الكارت */}
          <div className="absolute inset-x-0 -top-10 -z-10 mx-auto h-40 max-w-3xl rounded-full bg-primary/30 blur-3xl" />

          {/* Dashboard Preview — Glass Card */}
          <div className="glass glass-hover mx-auto max-w-5xl overflow-hidden rounded-3xl p-2">
            {/* شريط المتصفح */}
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="size-3 rounded-full bg-red-500/70" />
              <span className="size-3 rounded-full bg-yellow-500/70" />
              <span className="size-3 rounded-full bg-green-500/70" />
              <span className="mx-auto text-xs text-muted-foreground">
                app.marketing-hub.io
              </span>
            </div>

            {/* Mock Dashboard */}
            <div className="grid grid-cols-12 gap-3 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/10 p-4">
              {/* Sidebar */}
              <aside className="col-span-3 hidden space-y-2 md:block">
                <div className="h-8 rounded-lg bg-primary/30" />
                <div className="h-6 rounded-md bg-muted/60" />
                <div className="h-6 rounded-md bg-muted/60" />
                <div className="h-6 rounded-md bg-muted/60" />
                <div className="h-6 rounded-md bg-muted/60" />
              </aside>

              {/* Main Content */}
              <div className="col-span-12 space-y-3 md:col-span-9">
                {/* Stat Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3">
                    <TrendingUp className="size-4 text-primary" />
                    <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
                      Reach
                    </p>
                    <p className="text-sm font-bold md:text-lg">48.2K</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <Users className="size-4 text-accent" />
                    <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
                      Followers
                    </p>
                    <p className="text-sm font-bold md:text-lg">12.5K</p>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <BarChart3 className="size-4 text-primary" />
                    <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
                      Engagement
                    </p>
                    <p className="text-sm font-bold md:text-lg">8.4%</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="glass rounded-xl p-4">
                  <div className="flex h-24 items-end gap-1.5">
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
    </section>
  );
}