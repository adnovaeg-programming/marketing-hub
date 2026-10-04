"use client";

import { useState, useTransition } from "react";
import { Loader2, Power, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { toggleFeatureFlagAction } from "@/app/[locale]/admin/settings/actions";

type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  category: string | null;
};

export function FeatureFlagsPanel({ flags }: { flags: FeatureFlag[] }) {
  const t = useTranslations("admin.settings.flags");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionKey, setActionKey] = useState<string | null>(null);

  const grouped = flags.reduce(
    (acc, flag) => {
      const cat = flag.category ?? "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(flag);
      return acc;
    },
    {} as Record<string, FeatureFlag[]>
  );

  const handleToggle = (key: string, enabled: boolean) => {
    setActionKey(key);
    startTransition(async () => {
      const result = await toggleFeatureFlagAction(key, !enabled);
      setActionKey(null);
      if (!result.success) {
        toast.error("فشل التحديث");
        return;
      }
      toast.success(enabled ? t("disabled") : t("enabled"));
      router.refresh();
    });
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Power className="size-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categoryFlags]) => (
          <div key={category}>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="size-3" />
              {category}
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              {categoryFlags.map((flag) => {
                const isProcessing = pending && actionKey === flag.key;
                return (
                  <div
                    key={flag.id}
                    className="glass flex items-center justify-between gap-3 rounded-xl p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{flag.name}</p>
                      {flag.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {flag.description}
                        </p>
                      )}
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                        {flag.key}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggle(flag.key, flag.enabled)}
                      disabled={isProcessing}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-all ${
                        flag.enabled
                          ? "bg-gradient-to-r from-primary to-accent"
                          : "bg-muted"
                      }`}
                      aria-label={flag.enabled ? "Disable" : "Enable"}
                    >
                      <span
                        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-md transition-all ${
                          flag.enabled ? "left-[22px]" : "left-0.5"
                        }`}
                      >
                        {isProcessing && (
                          <Loader2 className="absolute inset-0 m-auto size-3 animate-spin text-muted-foreground" />
                        )}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}