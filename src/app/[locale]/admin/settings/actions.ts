"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result = { success: true } | { success: false; error: string };

export async function toggleFeatureFlagAction(
  key: string,
  enabled: boolean
): Promise<Result> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("feature_flags")
      .update({ enabled })
      .eq("key", key);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "admin.feature_toggle" as never,
      entityType: "feature_flag",
      entityName: key,
      metadata: { enabled },
      severity: "warning",
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function updatePlatformSettingAction(
  key: string,
  value: string
): Promise<Result> {
  try {
    const admin = await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("platform_settings")
      .update({ value, updated_by: admin.userId })
      .eq("key", key);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}