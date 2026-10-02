"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════ GET OR CREATE CONVERSATION ═══════════ */

export async function getOrCreateConversationAction(
  otherUserId: string,
  referenceType?: string,
  referenceId?: string
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (otherUserId === ctx.userId) {
      return { success: false, error: "cannot_message_self" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      p_workspace_id: ctx.workspaceId,
      p_other_user_id: otherUserId,
      p_reference_type: referenceType ?? null,
      p_reference_id: referenceId ?? null,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/messages");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ SEND MESSAGE ═══════════ */

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: "empty_message" };
    if (trimmed.length > 4000)
      return { success: false, error: "message_too_long" };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("send_message", {
      p_conversation_id: conversationId,
      p_content: trimmed,
      p_message_type: "text",
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/messages");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ MARK AS READ ═══════════ */

export async function markConversationReadAction(
  conversationId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("mark_conversation_read", {
      p_conversation_id: conversationId,
    });
  } catch {
    // silent
  }
}

/* ═══════════ DISPUTES ═══════════ */

type DisputeInput = {
  contractId?: string;
  againstUserId: string;
  reason: string;
  description: string;
  amountDisputed?: number;
  currency?: "EGP" | "USD" | "SAR" | "AED";
};

export async function openDisputeAction(
  input: DisputeInput
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!input.reason.trim() || !input.description.trim()) {
      return { success: false, error: "missing_fields" };
    }

    const supabase = await createClient();

    // نولد reference
    const { data: refData, error: refError } = await supabase.rpc(
      "generate_reference",
      { prefix: "DS" }
    );
    if (refError) return { success: false, error: refError.message };

    const { data, error } = await supabase
      .from("disputes")
      .insert({
        reference: refData as string,
        contract_id: input.contractId ?? null,
        opened_by: ctx.userId,
        against_user_id: input.againstUserId,
        workspace_id: ctx.workspaceId,
        reason: input.reason.trim(),
        description: input.description.trim(),
        amount_disputed: input.amountDisputed ?? null,
        currency: input.currency ?? "EGP",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/disputes");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ SEND DISPUTE MESSAGE ═══════════ */

export async function sendDisputeMessageAction(
  disputeId: string,
  message: string
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const trimmed = message.trim();
    if (!trimmed) return { success: false, error: "empty_message" };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dispute_messages")
      .insert({
        dispute_id: disputeId,
        sender_id: ctx.userId,
        message: trimmed,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/disputes/${disputeId}`);
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}