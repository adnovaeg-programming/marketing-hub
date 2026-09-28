"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "./actions";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await signInAction(formData);

    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    // نجح → وجّه المستخدم للـ Dashboard
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
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

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{t(`errors.${error}`, { default: error })}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="group h-11 w-full rounded-xl"
          >
            {pending ? "..." : t("submit")}
            {!pending && (
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            )}
          </Button>
        </form>

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