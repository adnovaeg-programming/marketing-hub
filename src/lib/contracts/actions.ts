"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════ CREATE PROPOSAL ═══════════ */

type ProposalInput = {
  serviceRequestId?: string;
  listingId?: string;
  clientId: string;
  title: string;
  description: string;
  amount: number;
  currency: "EGP" | "USD" | "SAR" | "AED";
  deliveryDays: number;
  milestones?: {
    name: string;
    description?: string;
    amount: number;
  }[];
};

export async function createProposalAction(
  input: ProposalInput
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!input.title.trim() || !input.description.trim()) {
      return { success: false, error: "missing_fields" };
    }

    if (input.amount <= 0) {
      return { success: false, error: "invalid_amount" };
    }

    const supabase = await createClient();
    const { data: refData, error: refError } = await supabase.rpc(
      "generate_reference",
      { prefix: "PR" }
    );
    if (refError) return { success: false, error: refError.message };

    const { data, error } = await supabase
      .from("proposals")
      .insert({
        reference: refData as string,
        service_request_id: input.serviceRequestId ?? null,
        listing_id: input.listingId ?? null,
        provider_id: ctx.userId,
        client_id: input.clientId,
        workspace_id: ctx.workspaceId,
        title: input.title.trim(),
        description: input.description.trim(),
        amount: input.amount,
        currency: input.currency,
        delivery_days: input.deliveryDays,
        milestones: input.milestones ?? [],
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "proposal",
      entityId: data.id,
      entityName: input.title,
      metadata: { amount: input.amount },
    });

    revalidatePath("/dashboard/marketplace/proposals");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ ACCEPT PROPOSAL ═══════════ */

export async function acceptProposalAction(
  proposalId: string
): Promise<Result<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("accept_proposal", {
      p_proposal_id: proposalId,
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "contract",
      entityId: data as string,
      metadata: { proposal_id: proposalId },
      severity: "warning",
    });

    revalidatePath("/dashboard/contracts");
    revalidatePath("/dashboard/marketplace/proposals");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ REJECT PROPOSAL ═══════════ */

export async function rejectProposalAction(
  proposalId: string,
  reason?: string
): Promise<Result> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("reject_proposal", {
      p_proposal_id: proposalId,
      p_reason: reason ?? null,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/marketplace/proposals");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ SUBMIT MILESTONE ═══════════ */

export async function submitMilestoneAction(
  milestoneId: string
): Promise<Result> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_milestone", {
      p_milestone_id: milestoneId,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/contracts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ APPROVE MILESTONE ═══════════ */

export async function approveMilestoneAction(
  milestoneId: string
): Promise<Result> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("approve_milestone", {
      p_milestone_id: milestoneId,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/contracts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ CANCEL CONTRACT ═══════════ */

export async function cancelContractAction(
  contractId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("contracts")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", contractId)
      .eq("workspace_id", ctx.workspaceId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/contracts");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}