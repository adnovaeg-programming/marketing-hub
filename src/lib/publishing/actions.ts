"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════ CONNECT SOCIAL ACCOUNT ═══════════ */

type ConnectInput = {
  platform: string;
  accountName: string;
  externalAccountId?: string;
};

export async function connectSocialAccountAction(
  input: ConnectInput
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!input.platform || !input.accountName.trim()) {
      return { success: false, error: "missing_fields" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("social_accounts")
      .insert({
        user_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        platform: input.platform,
        account_name: input.accountName.trim(),
        external_account_id: input.externalAccountId ?? `sim_${Date.now()}`,
        status: "connected",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "social_account",
      entityId: data.id,
      entityName: input.accountName,
      metadata: { platform: input.platform },
    });

    revalidatePath("/dashboard/social");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ DISCONNECT SOCIAL ACCOUNT ═══════════ */

export async function disconnectSocialAccountAction(
  accountId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("social_accounts")
      .update({ status: "disconnected" })
      .eq("id", accountId)
      .eq("workspace_id", ctx.workspaceId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/social");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function deleteSocialAccountAction(
  accountId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("social_accounts")
      .delete()
      .eq("id", accountId)
      .eq("workspace_id", ctx.workspaceId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/social");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ SCHEDULE POST ═══════════ */

type ScheduleInput = {
  contentItemId: string;
  socialAccountId: string;
  platform: string;
  caption?: string;
  mediaUrls?: string[];
  scheduledFor: string;
};

export async function schedulePostAction(
  input: ScheduleInput
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const scheduledDate = new Date(input.scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: "invalid_date" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("queue_scheduled_post", {
      p_content_item_id: input.contentItemId,
      p_social_account_id: input.socialAccountId,
      p_platform: input.platform,
      p_caption: input.caption ?? null,
      p_media_urls: input.mediaUrls ?? [],
      p_scheduled_for: scheduledDate.toISOString(),
    });

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "scheduled_post",
      entityId: data as string,
      metadata: { platform: input.platform, when: input.scheduledFor },
    });

    revalidatePath("/dashboard/social/scheduled");
    revalidatePath("/dashboard/content");
    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ CANCEL SCHEDULED POST ═══════════ */

export async function cancelScheduledPostAction(
  postId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("scheduled_posts")
      .update({ status: "cancelled" })
      .eq("id", postId)
      .eq("workspace_id", ctx.workspaceId)
      .in("status", ["pending", "retry"]);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/social/scheduled");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ RETRY FAILED POST ═══════════ */

export async function retryScheduledPostAction(
  postId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();

    // نرجّعه pending
    const { error: postError } = await supabase
      .from("scheduled_posts")
      .update({
        status: "pending",
        error_message: null,
        scheduled_for: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("workspace_id", ctx.workspaceId)
      .in("status", ["failed", "cancelled"]);

    if (postError) return { success: false, error: postError.message };

    // نجدول job جديد
    await supabase.from("publishing_jobs").insert({
      scheduled_post_id: postId,
      status: "queued",
    });

    revalidatePath("/dashboard/social/scheduled");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ PROCESS QUEUE (manual trigger) ═══════════ */

export async function processPublishingQueueAction(): Promise<
  Result<{ processed: number }>
> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("process_publishing_queue", {
      p_limit: 10,
    });

    if (error) return { success: false, error: error.message };

    const processed = (data ?? []).filter((r: { processed: boolean }) => r.processed).length;

    revalidatePath("/dashboard/social/scheduled");
    return { success: true, data: { processed } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}