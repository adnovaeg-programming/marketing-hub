"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result = { success: true } | { success: false; error: string };

export async function approvePayoutAction(payoutId: string): Promise<Result> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase.rpc("approve_payout", {
      p_payout_id: payoutId,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "payout_request",
      entityId: payoutId,
      metadata: { action: "approve" },
      severity: "warning",
    });

    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function completePayoutAction(
  payoutId: string,
  externalTxId?: string
): Promise<Result> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase.rpc("complete_payout", {
      p_payout_id: payoutId,
      p_external_tx_id: externalTxId ?? null,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "payout_request",
      entityId: payoutId,
      metadata: { action: "complete", external_tx: externalTxId },
    });

    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function rejectPayoutAction(
  payoutId: string,
  reason: string
): Promise<Result> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();

    const { error } = await supabase.rpc("reject_payout", {
      p_payout_id: payoutId,
      p_reason: reason,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "payout_request",
      entityId: payoutId,
      metadata: { action: "reject", reason },
      severity: "warning",
    });

    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}