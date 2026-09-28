"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type Result = { success: true } | { success: false; error: string };

export async function clientReviewContentAction(
  contentId: string,
  decision: "approve" | "reject",
  comment?: string
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const newStatus = decision === "approve" ? "approved" : "rejected";

  const { error } = await supabase
    .from("content_items")
    .update({ status: newStatus })
    .eq("id", contentId)
    .eq("status", "client_review");

  if (error) return { success: false, error: error.message };

  // لو فيه تعليق، نضيفه في content_comments (لو الجدول موجود)
  if (comment && comment.trim()) {
    await supabase.from("content_comments").insert({
      content_item_id: contentId,
      user_id: user.id,
      comment: comment.trim(),
    });
  }

  revalidatePath("/portal");
  revalidatePath("/portal/approvals");
  revalidatePath("/dashboard/content");
  return { success: true };
}