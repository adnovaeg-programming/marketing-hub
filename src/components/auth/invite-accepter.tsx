"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { acceptInvitationAction } from "@/app/[locale]/dashboard/settings/invitations-actions";

export function InviteAccepter({ token }: { token: string }) {
  const t = useTranslations("dashboard.invite");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-accept after render
    setPending(true);
    acceptInvitationAction(token).then((result) => {
      setPending(false);
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Success! Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    });
  }, [token, router]);

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        {!error ? (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{t("accepting")}</h1>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">{t("acceptErrorTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(`errors.${error}`, { default: error })}
            </p>
            <Button asChild>
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}