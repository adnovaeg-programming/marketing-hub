"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════════ GET OR CREATE WALLET ═══════════════ */

export async function getOrCreateWalletAction(
  workspaceId: string,
  currency: "EGP" | "USD" | "SAR" | "AED" = "EGP"
): Promise<Result<string>> {
  try {
    await requirePermission("workspace.view");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_or_create_wallet", {
      p_workspace_id: workspaceId,
      p_currency: currency,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════════ DEPOSIT ═══════════════ */

export async function depositAction(
  walletId: string,
  amount: number,
  description?: string
): Promise<Result<string>> {
  try {
    const ctx = await requirePermission("workspace.view");

    if (amount <= 0) {
      return { success: false, error: "invalid_amount" };
    }

    if (amount > 1000000) {
      return { success: false, error: "amount_too_large" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("wallet_deposit", {
      p_wallet_id: walletId,
      p_amount: amount,
      p_description: description ?? null,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.signup" as never,
      entityType: "wallet",
      entityId: walletId,
      metadata: { action: "deposit", amount },
    });

    revalidatePath("/dashboard/wallet");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}