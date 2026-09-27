"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* الرأس */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* الفورم */}
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            // سيتم ربطه بـ Supabase لاحقًا
          }}
        >
          {/* البريد */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              required
              className="h-11"
            />
          </div>

          {/* كلمة المرور */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                autoComplete="current-password"
                required
                className="h-11 pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "إخفاء" : "إظهار"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* تذكرني + نسيت كلمة المرور */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-border accent-primary"
              />
              {t("rememberMe")}
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary transition hover:opacity-80"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          {/* الزر */}
          <Button
            type="submit"
            size="lg"
            className="group h-11 w-full rounded-xl"
          >
            {t("submit")}
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Button>
        </form>

        {/* رابط التسجيل */}
        <p className="text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition hover:opacity-80"
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}