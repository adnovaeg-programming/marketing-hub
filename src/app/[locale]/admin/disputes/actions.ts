"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result = { success: true } | { success: false; error: string };

export async function updateDisputeStatusAction(
  disputeId: string,
  status: "open" | "under_review" | "waiting_evidence" | "resolved" | "closed"
): Promise<Result> {
  try {
    const admin = await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("disputes")
      .update({
        status,
        assigned_admin: status === "under_review" ? admin.userId : undefined,
      })
      .eq("id", disputeId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "dispute",
      entityId: disputeId,
      metadata: { status },
      severity: "warning",
    });

    revalidatePath("/admin/disputes");
    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function resolveDisputeAction(
  disputeId: string,
  resolutionType:
    | "full_refund"
    | "partial_refund"
    | "release_to_provider"
    | "split"
    | "cancelled",
  amountToClient: number,
  amountToProvider: number,
  resolution: string
): Promise<Result> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from("disputes")
      .update({
        status: "resolved",
        resolution_type: resolutionType,
        amount_to_client: amountToClient,
        amount_to_provider: amountToProvider,
        resolution,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "dispute",
      entityId: disputeId,
      metadata: { resolution_type: resolutionType, amountToClient, amountToProvider },
      severity: "critical",
    });

    revalidatePath("/admin/disputes");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}