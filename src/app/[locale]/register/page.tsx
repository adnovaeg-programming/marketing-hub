"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Building2, Users, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCOUNT_TYPES = [
  { key: "client", icon: Building2 },
  { key: "agency", icon: Users },
  { key: "freelancer", icon: User },
] as const;

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<string>("client");

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // سيتم ربطه بـ Supabase لاحقًا
          }}
        >
          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              required
              className="h-11"
            />
          </div>

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
                autoComplete="new-password"
                required
                minLength={8}
                className="h-11 pe-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "إخفاء" : "إظهار"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* نوع الحساب */}
          <div className="space-y-2">
            <Label>{t("accountType")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = accountType === type.key;
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setAccountType(type.key)}
                    className={`
                      flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition
                      ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="size-5" />
                    <span className="text-xs font-medium">{t(`types.${type.key}`)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* الشروط */}
          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              required
              className="mt-0.5 size-4 shrink-0 rounded border-border accent-primary"
            />
            <span>
              {t("terms")}{" "}
              <a href="#" className="font-medium text-primary hover:opacity-80">
                {t("termsLink")}
              </a>{" "}
              {t("and")}{" "}
              <a href="#" className="font-medium text-primary hover:opacity-80">
                {t("privacyLink")}
              </a>
            </span>
          </label>

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

        <p className="text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary transition hover:opacity-80"
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}