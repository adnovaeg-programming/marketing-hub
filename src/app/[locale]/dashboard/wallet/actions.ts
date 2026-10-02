"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission, getWorkspaceContext } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════════ GET OR CREATE ═══════════════ */

export async function getOrCreateWalletAction(
  currency: "EGP" | "USD" | "SAR" | "AED" = "EGP"
): Promise<Result<string>> {
  try {
    const ctx = await requirePermission("workspace.view");

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_or_create_wallet", {
      p_workspace_id: ctx.workspaceId,
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
    await requirePermission("workspace.view");

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
      action: "auth.password_reset" as never,
      entityType: "wallet",
      entityId: walletId,
      metadata: { action: "deposit", amount },
      severity: "info",
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

/* ═══════════════ WITHDRAW REQUEST (placeholder) ═══════════════ */

export async function requestWithdrawalAction(
  walletId: string,
  amount: number
): Promise<Result<void>> {
  try {
    await requirePermission("workspace.view");

    if (amount <= 0) {
      return { success: false, error: "invalid_amount" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "not_authenticated" };

    // نتحقق من الرصيد
    const { data: wallet } = await supabase
      .from("wallets")
      .select("available_balance, currency")
      .eq("id", walletId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!wallet) return { success: false, error: "wallet_not_found" };

    if (Number(wallet.available_balance) < amount) {
      return { success: false, error: "insufficient_balance" };
    }

    // في D2 هنضيف payout_requests وربط الدفع
    // دلوقتي نسجّل audit + نرجع نجاح تجريبي

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "wallet",
      entityId: walletId,
      metadata: { action: "withdrawal_requested", amount },
      severity: "warning",
    });

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}