import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.layout");

  return (
    <main className="auth-bg relative flex min-h-screen items-center justify-center p-4 md:p-8">
      {/* شبكة خفيفة جدًا في الخلفية */}
      <div className="subtle-grid absolute inset-0 opacity-[0.02] pointer-events-none" />

      {/* الكارت الرئيسي */}
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border/40 bg-card shadow-2xl">
        <div className="grid min-h-[680px] lg:grid-cols-2">
          {/* عمود الفورم */}
          <div className="flex flex-col justify-center p-6 md:p-12">
            {/* الشعار — يظهر في الموبايل بس */}
            <Link
              href="/"
              className="mb-8 flex items-center gap-2 font-bold text-lg lg:hidden"
            >
              <Sparkles className="size-6 text-primary" />
              Marketing Hub
            </Link>

            <div className="mx-auto w-full max-w-sm">{children}</div>
          </div>

          {/* عمود الـ Visual — يظهر من lg وأعلى */}
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent lg:block">
            {/* توهج دائري */}
            <div className="absolute -right-20 -top-20 size-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-primary/40 blur-3xl" />

            {/* شبكة خفيفة */}
            <div className="subtle-grid absolute inset-0 opacity-10" />

            {/* المحتوى */}
            <div className="relative flex h-full flex-col justify-between p-12">
              {/* الشعار — يظهر من lg */}
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-lg text-white"
              >
                <Sparkles className="size-6" />
                Marketing Hub
              </Link>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
                  {t("visualTitle")}{" "}
                  <span className="bg-gradient-to-l from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                    {t("visualHighlight")}
                  </span>
                </h2>
                <p className="max-w-md text-sm text-white/70">
                  {t("visualDescription")}
                </p>
              </div>

              {/* زخرفة سفلية */}
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