"use client";

import { useState } from "react";
import { Sparkles, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/[locale]/login/actions";

export function PortalHeader({
  workspaceName,
  userEmail,
}: {
  workspaceName: string;
  userEmail: string;
}) {
  const t = useTranslations("dashboard.portal");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-glass-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Sparkles className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Marketing Hub</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {t("portal")} • {workspaceName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={pending}
            className="rounded-full text-muted-foreground hover:text-destructive"
            aria-label={t("logout")}
            title={userEmail}
          >
            <LogOut className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}