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
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{t("title")}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            {t("title")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map((key, index) => {
            const Icon = ICONS[key];
            return (
              <div
                key={key}
                className="glass glass-hover glass-shimmer group relative overflow-hidden rounded-2xl p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon container */}
                <div className="relative mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-inner">
                  <Icon className="size-6 text-primary transition-transform group-hover:scale-110" />
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