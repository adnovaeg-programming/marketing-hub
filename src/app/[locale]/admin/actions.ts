"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result = { success: true } | { success: false; error: string };

/* ═══════════ SUSPEND / RESTORE USER ═══════════ */

export async function suspendUserAction(userId: string): Promise<Result> {
  try {
    const admin = await requirePlatformAdmin();
    if (admin.role !== "super_admin" && admin.role !== "admin") {
      return { success: false, error: "not_allowed" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "admin.user_suspend",
      entityType: "user",
      entityId: userId,
      severity: "critical",
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function restoreUserAction(userId: string): Promise<Result> {
  try {
    const admin = await requirePlatformAdmin();
    if (admin.role !== "super_admin" && admin.role !== "admin") {
      return { success: false, error: "not_allowed" };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "admin.user_restore",
      entityType: "user",
      entityId: userId,
      severity: "warning",
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown" };
  }
}