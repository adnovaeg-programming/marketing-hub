"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mh_cookie_consent";

export function CookieBanner() {
  const t = useTranslations("legal.cookieBanner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="animate-fade-in-up fixed bottom-4 end-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="glass-strong rounded-2xl border border-glass-border p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="glass flex size-9 shrink-0 items-center justify-center rounded-xl">
            <Cookie className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold">{t("title")}</h3>
              <button
                onClick={handleReject}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="close"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("description")}{" "}
              <Link
                href="/legal/cookies"
                className="font-medium text-primary hover:opacity-80"
              >
                {t("learnMore")}
              </Link>
            </p>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent text-xs"
              >
                {t("accept")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                className="glass rounded-lg text-xs"
              >
                {t("reject")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}