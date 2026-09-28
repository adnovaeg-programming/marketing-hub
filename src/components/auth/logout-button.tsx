"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/[locale]/login/actions";

export function LogoutButton() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await signOutAction();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={pending}
      className="glass glass-hover rounded-full"
    >
      <LogOut className="size-4" />
      {t("logout")}
    </Button>
  );
}