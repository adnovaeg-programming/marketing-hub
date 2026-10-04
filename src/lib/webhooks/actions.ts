"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export const AVAILABLE_WEBHOOK_EVENTS = [
  "client.created",
  "client.deleted",
  "project.created",
  "project.status_changed",
  "task.created",
  "task.completed",
  "content.created",
  "content.approved",
  "content.published",
  "proposal.received",
  "contract.created",
  "contract.completed",
  "payment.received",
  "payout.requested",
  "payout.completed",
] as const;

export async function createWebhookAction(input: {
  name: string;
  url: string;
  events: string[];
}): Promise<Result<{ id: string; secret: string }>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!input.name.trim() || !input.url.trim()) {
      return { success: false, error: "missing_fields" };
    }

    if (!input.url.startsWith("https://")) {
      return { success: false, error: "https_required" };
    }

    if (input.events.length === 0) {
      return { success: false, error: "select_events" };
    }

    const secret = `whsec_${randomBytes(24).toString("hex")}`;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        user_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        name: input.name.trim(),
        url: input.url.trim(),
        events: input.events,
        secret,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/webhooks");
    return { success: true, data: { id: data.id, secret } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function toggleWebhookAction(
  webhookId: string,
  isActive: boolean
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("webhooks")
      .update({ is_active: isActive })
      .eq("id", webhookId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/webhooks");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function deleteWebhookAction(webhookId: string): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", webhookId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/webhooks");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}