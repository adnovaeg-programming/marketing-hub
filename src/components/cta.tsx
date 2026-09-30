import { ArrowLeft, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-12 md:p-20">
          {/* Glows */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 animate-glow-pulse rounded-full bg-primary/40 blur-3xl" />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 size-72 animate-glow-pulse rounded-full bg-accent/30 blur-3xl"
            style={{ animationDelay: "2s" }}
          />

          <div className="subtle-grid pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{t("description")}</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="group rounded-full bg-gradient-to-r from-primary to-accent px-8 shadow-lg shadow-primary/40 transition-shadow hover:shadow-xl hover:shadow-primary/50"
              >
                {t("primary")}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass glass-hover rounded-full px-8"
              >
                <MessageCircle className="size-4" />
                {t("secondary")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}