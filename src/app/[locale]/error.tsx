"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">{t("title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("description")}
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={reset} className="rounded-full">
                <RotateCcw className="size-4" />
                {t("retry")}
              </Button>
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/">
                  <Home className="size-4" />
                  {t("home")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}