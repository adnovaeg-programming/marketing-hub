import { useTranslations } from "next-intl";

const STEP_KEYS = ["workspace", "invite", "launch"] as const;

const NUMBERS = ["01", "02", "03"] as const;

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />

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

        <div className="relative mt-16">
          <div className="absolute right-[16%] left-[16%] top-10 hidden h-px bg-gradient-to-l from-transparent via-border to-transparent md:block" />

          <div className="grid gap-8 md:grid-cols-3">
            {STEP_KEYS.map((key, index) => (
              <div
                key={key}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative flex size-20 items-center justify-center rounded-full border border-border/60 bg-card shadow-lg">
                  <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-2xl font-bold text-transparent">
                    {NUMBERS[index]}
                  </span>
                  <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-xl" />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}