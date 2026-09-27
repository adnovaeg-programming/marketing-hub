"use client";

import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout>
      <div className="space-y-6">
        {!sent ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                // سيتم ربطه بـ Supabase لاحقًا
              }}
            >
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

              <Button
                type="submit"
                size="lg"
                className="group h-11 w-full rounded-xl"
              >
                {t("submit")}
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("successTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("successMessage")}</p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-primary transition hover:opacity-80"
          >
            ← {t("backToLogin")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}