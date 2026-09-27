import { ArrowLeft, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-card to-accent/10 p-12 md:p-20">
          {/* توهج خلفي */}
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-accent/20 blur-3xl" />

          {/* شبكة خفيفة */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" className="group rounded-full px-8">
                {t("primary")}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
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