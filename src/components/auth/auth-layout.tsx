import { Sparkles, Shield, Zap, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Aurora } from "@/components/fx/aurora";
import { CursorSpotlight } from "@/components/fx/cursor-spotlight";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.layout");

  const features = [
    { icon: Zap, key: "fast" },
    { icon: Shield, key: "secure" },
    { icon: Users, key: "team" },
  ] as const;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 md:p-8">
      {/* Aurora background */}
      <Aurora />

      {/* Cursor spotlight */}
      <CursorSpotlight />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl">
        <div className="glass-strong glass-reflect grid min-h-[700px] overflow-hidden rounded-[2rem]">
          {/* Form column */}
          <div className="flex flex-col justify-center p-6 md:p-12 lg:col-span-1">
            <Link
              href="/"
              className="group mb-8 flex items-center gap-2.5 font-bold text-lg lg:hidden"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
                <Sparkles className="size-4.5 text-white" />
              </div>
              <span>Marketing Hub</span>
            </Link>

            <div className="mx-auto w-full max-w-sm">{children}</div>
          </div>

          {/* Visual column */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent lg:block">
            <div className="animate-glow-pulse absolute -right-20 -top-20 size-72 rounded-full bg-accent/40 blur-3xl" />
            <div
              className="animate-glow-pulse absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/50 blur-3xl"
              style={{ animationDelay: "2s" }}
            />

            <div className="subtle-grid absolute inset-0 opacity-10" />

            {/* Rotating orbits */}
            <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2">
              <div
                className="animate-orbit absolute left-1/2 top-1/2 size-3 rounded-full bg-white shadow-lg shadow-white/50"
                style={{ ["--radius" as string]: "160px" }}
              />
              <div
                className="animate-orbit absolute left-1/2 top-1/2 size-2 rounded-full bg-white/70"
                style={{
                  ["--radius" as string]: "120px",
                  animationDelay: "-8s",
                }}
              />
            </div>

            {/* Floating blobs */}
            <div
              className="float-layer absolute top-1/4 right-8 size-32 bg-white/10 opacity-60 blur-2xl"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            />
            <div
              className="float-layer absolute bottom-1/3 left-12 size-24 bg-accent/30 opacity-50 blur-2xl"
              style={{
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                animationDelay: "3s",
              }}
            />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-between p-12">
              <Link
                href="/"
                className="group flex items-center gap-2.5 font-bold text-lg text-white"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur transition-transform group-hover:scale-105">
                  <Sparkles className="size-4.5 text-white" />
                </div>
                Marketing Hub
              </Link>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
                    {t("visualTitle")}{" "}
                    <span className="bg-gradient-to-l from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                      {t("visualHighlight")}
                    </span>
                  </h2>
                  <p className="max-w-md text-sm leading-relaxed text-white/70">
                    {t("visualDescription")}
                  </p>
                </div>

                <div className="space-y-3">
                  {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.key}
                        className="flex items-center gap-3 text-sm text-white/80"
                        style={{
                          animationDelay: `${i * 150}ms`,
                        }}
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                          <Icon className="size-3.5 text-white" />
                        </div>
                        <span>{t(`features.${f.key}`)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/50">
                <span>© {new Date().getFullYear()} Marketing Hub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}