"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { deleteClientAction } from "@/app/[locale]/dashboard/clients/actions";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const t = useTranslations("dashboard.clients");
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;
    setPending(true);
    await deleteClientAction(clientId);
    setPending(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={pending}
      className="size-8 text-muted-foreground hover:text-destructive"
      aria-label={t("delete")}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
    </Button>
  );
}