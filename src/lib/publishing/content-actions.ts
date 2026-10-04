"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function scheduleContentAction(input: {
  contentItemId: string;
  socialAccountId: string;
  caption?: string;
  scheduledFor: string;
}): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const scheduledDate = new Date(input.scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: "invalid_date" };
    }

    // نمنع الجدولة في الماضي
    if (scheduledDate.getTime() < Date.now() - 60 * 1000) {
      return { success: false, error: "date_in_past" };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "schedule_content_for_publishing",
      {
        p_content_item_id: input.contentItemId,
        p_social_account_id: input.socialAccountId,
        p_caption: input.caption ?? null,
        p_scheduled_for: scheduledDate.toISOString(),
      }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/content/${input.contentItemId}`);
    revalidatePath("/dashboard/content");
    revalidatePath("/dashboard/social/scheduled");

    return { success: true, data: data as string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}