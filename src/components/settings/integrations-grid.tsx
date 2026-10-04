"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";

type Integration = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  is_available: boolean;
};

type Connection = {
  id: string;
  integration_id: string;
  status: string;
  external_account_name: string | null;
  connected_at: string;
};

export function IntegrationsGrid({
  integrations,
  connections,
}: {
  integrations: Integration[];
  connections: Connection[];
}) {
  const t = useTranslations("dashboard.integrations");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const getConnection = (integrationId: string) =>
    connections.find((c) => c.integration_id === integrationId);

  const grouped = integrations.reduce(
    (acc, integration) => {
      const cat = integration.category ?? "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(integration);
      return acc;
    },
    {} as Record<string, Integration[]>
  );

  const categoryLabels: Record<string, string> = {
    social: t("categories.social"),
    ads: t("categories.ads"),
    payment: t("categories.payment"),
    other: t("categories.other"),
  };

  const handleConnect = (slug: string) => {
    // TODO: في الإنتاج، نعمل OAuth flow
    toast.info(t("oauthComingSoon"), {
      description: t("oauthComingSoonDescription", { provider: slug }),
    });
  };

  const handleDisconnect = (connectionId: string) => {
    if (!confirm(t("confirmDisconnect"))) return;
    toast.info(t("disconnectComingSoon"));
  };

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryIntegrations]) => (
        <div key={category}>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {categoryLabels[category] ?? category}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryIntegrations.map((integration) => {
              const connection = getConnection(integration.id);
              const isConnected = connection?.status === "connected";

              return (
                <div
                  key={integration.id}
                  className={`glass-strong relative overflow-hidden rounded-2xl p-5 ${
                    isConnected ? "ring-2 ring-emerald-500/30" : ""
                  }`}
                >
                  {isConnected && (
                    <div className="absolute end-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-2.5" />
                      {t("connected")}
                    </div>
                  )}

                  <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <LinkIcon className="size-6 text-primary" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    {integration.name}
                  </h3>

                  {integration.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {integration.description}
                    </p>
                  )}

                  {connection?.external_account_name && (
                    <p
                      className="mt-2 truncate text-[10px] text-muted-foreground"
                      dir="ltr"
                    >
                      {connection.external_account_name}
                    </p>
                  )}

                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    onClick={() =>
                      isConnected
                        ? handleDisconnect(connection.id)
                        : handleConnect(integration.slug)
                    }
                    disabled={pending && actionId === integration.id}
                    className={`mt-4 w-full rounded-xl ${
                      isConnected
                        ? "glass"
                        : "bg-gradient-to-r from-primary to-accent"
                    }`}
                  >
                    {pending && actionId === integration.id && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    {isConnected ? t("disconnect") : t("connect")}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}