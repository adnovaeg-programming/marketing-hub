"use client";

import { useState, useTransition } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePlatformSettingAction } from "@/app/[locale]/admin/settings/actions";

type PlatformSetting = {
  id: string;
  key: string;
  value: string | null;
  type: string | null;
  description: string | null;
  is_public: boolean;
};

export function PlatformSettingsPanel({
  settings,
}: {
  settings: PlatformSetting[];
}) {
  const t = useTranslations("admin.settings.platform");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map((s) => [s.key, s.value ?? ""]))
  );
  const [saving, setSaving] = useState<string | null>(null);

  const handleSave = (key: string) => {
    setSaving(key);
    startTransition(async () => {
      const result = await updatePlatformSettingAction(key, values[key] ?? "");
      setSaving(null);
      if (!result.success) {
        toast.error("فشل الحفظ");
        return;
      }
      toast.success(t("saved"));
      router.refresh();
    });
  };

  return (
    <div className="glass-strong rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Settings className="size-5 text-accent" />
        <div>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Label htmlFor={setting.key} className="text-sm font-medium">
                  {setting.key}
                </Label>
                {setting.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                )}
              </div>

              {setting.is_public && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
                  Public
                </span>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <Input
                id={setting.key}
                value={values[setting.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [setting.key]: e.target.value,
                  }))
                }
                className="h-10 rounded-xl"
                dir="ltr"
              />
              <Button
                size="sm"
                onClick={() => handleSave(setting.key)}
                disabled={pending && saving === setting.key}
                className="h-10 shrink-0 rounded-xl"
              >
                {pending && saving === setting.key ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 