"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextScramble } from "@/components/fx/text-scramble";
import { TiltCard } from "@/components/fx/tilt-card";
import { MagneticButton } from "@/components/fx/magnetic-button";
import { SuccessBurst } from "@/components/fx/success-burst";
import { signInAction } from "./actions";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 900);
  };

  return (
    <AuthLayout>
      <div className="relative space-y-8">
        {/* Success burst overlay */}
        <SuccessBurst active={success} />

        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <TextScramble text={t("title")} />
          </h1>
          <p className="animate-fade-in-up text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Form — Tilt Card */}
        <TiltCard maxTilt={4}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                autoComplete="email"
                required
                disabled={pending || success}
                className="h-11 rounded-xl"
              />
            </div>

            {/* Password */}
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
                  disabled={pending || success}
                  className="h-11 rounded-xl pe-10"
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
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

            {/* Error */}
            {error && (
              <div className="animate-scale-in flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{t(`errors.${error}`, { default: error })}</span>
              </div>
            )}

            {/* Magnetic Submit */}
            <MagneticButton className="w-full" strength={0.15}>
              <Button
                type="submit"
                size="lg"
                disabled={pending || success}
                className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
              >
                {/* Shimmer overlay */}
                <span className="animate-shimmer-slide absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {success ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    ...
                  </span>
                ) : pending ? (
                  "..."
                ) : (
                  <>
                    {t("submit")}
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </MagneticButton>
          </form>
        </TiltCard>

        {/* Footer */}
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