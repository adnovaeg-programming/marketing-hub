import { Calendar, BarChart3, Wallet, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const FEATURE_KEYS = ["calendar", "collaboration", "reports", "wallet"] as const;

const ICONS = {
  calendar: Calendar,
  collaboration: Users,
  reports: BarChart3,
  wallet: Wallet,
} as const;

export function Features() {
  const t = useTranslations("features");

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}{" "}
            <span className="bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key) => {
            const Icon = ICONS[key];
            return (
              <div
                key={key}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur transition hover:border-primary/40 hover:bg-card"
              >
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/30" />

                <div className="relative mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                  <Icon className="size-6" />
                </div>

                <h3 className="relative mb-2 text-lg font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="relative text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}