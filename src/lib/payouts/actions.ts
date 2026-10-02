"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════ PAYOUT METHODS ═══════════ */

type PayoutMethodInput = {
  type: "instapay" | "bank_transfer" | "vodafone_cash" | "paypal" | "paymob";
  label: string;
  accountIdentifier: string;
  accountName?: string;
  bankName?: string;
  isDefault?: boolean;
};

export async function createPayoutMethodAction(
  input: PayoutMethodInput
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();

    // لو isDefault → نلغي default القديم
    if (input.isDefault) {
      await supabase
        .from("payout_methods")
        .update({ is_default: false })
        .eq("user_id", ctx.userId);
    }

    const { data, error } = await supabase
      .from("payout_methods")
      .insert({
        user_id: ctx.userId,
        type: input.type,
        label: input.label,
        account_identifier: input.accountIdentifier,
        account_name: input.accountName ?? null,
        bank_name: input.bankName ?? null,
        is_default: input.isDefault ?? false,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "payout_method",
      entityId: data.id,
      entityName: input.label,
      metadata: { type: input.type },
    });

    revalidatePath("/dashboard/wallet/payouts");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function deletePayoutMethodAction(
  methodId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("payout_methods")
      .delete()
      .eq("id", methodId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/wallet/payouts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function setDefaultPayoutMethodAction(
  methodId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();

    await supabase
      .from("payout_methods")
      .update({ is_default: false })
      .eq("user_id", ctx.userId);

    const { error } = await supabase
      .from("payout_methods")
      .update({ is_default: true })
      .eq("id", methodId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/wallet/payouts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ PAYOUT REQUESTS ═══════════ */

export async function requestPayoutAction(
  walletId: string,
  payoutMethodId: string,
  amount: number,
  notes?: string
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (amount <= 0) return { success: false, error: "invalid_amount" };
    if (amount < 100) return { success: false, error: "min_amount" };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("request_payout", {
      p_wallet_id: walletId,
      p_payout_method_id: payoutMethodId,
      p_amount: amount,
      p_notes: notes ?? null,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "payout_request",
      entityId: data as string,
      metadata: { amount },
      severity: "warning",
    });

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/wallet/payouts");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function cancelPayoutRequestAction(
  payoutId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();

    // نجيب الـ payout
    const { data: payout } = await supabase
      .from("payout_requests")
      .select("id, wallet_id, amount, status")
      .eq("id", payoutId)
      .eq("user_id", ctx.userId)
      .maybeSingle();

    if (!payout) return { success: false, error: "not_found" };
    if (payout.status !== "pending")
      return { success: false, error: "cannot_cancel" };

    // نرجّع المبلغ
    const { error: walletError } = await supabase.rpc("reject_payout", {
      p_payout_id: payoutId,
      p_reason: "Cancelled by user",
    });

    if (walletError) return { success: false, error: walletError.message };

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/wallet/payouts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}