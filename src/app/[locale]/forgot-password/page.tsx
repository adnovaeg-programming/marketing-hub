"use client";

import { useState } from "react";
import { ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgot");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    const formData = new FormData(e.currentTarget);
    await forgotPasswordAction(formData);

    setPending(false);
    setSent(true);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {!sent ? (
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={pending}
                className="group h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {t("submit")}
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
              <MailCheck className="size-8 text-white" />
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