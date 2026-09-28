"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ContentType =
  | "post"
  | "story"
  | "reel"
  | "video"
  | "image"
  | "article"
  | "carousel";
type Platform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube";
type ContentStatus =
  | "draft"
  | "internal_review"
  | "client_review"
  | "approved"
  | "rejected"
  | "scheduled"
  | "published"
  | "archived";
type Priority = "low" | "medium" | "high" | "urgent";

type ContentInput = {
  title: string;
  description?: string;
  clientId?: string | null;
  projectId?: string | null;
  contentType?: ContentType;
  platform?: Platform | null;
  status?: ContentStatus;
  priority?: Priority;
  scheduledAt?: string;
};

type Result =
  | { success: true; contentId: string }
  | { success: false; error: string };

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return member?.workspace_id ?? null;
}

export async function createContentAction(
  input: ContentInput
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { success: false, error: "no_workspace" };

  const title = input.title.trim();
  if (!title) return { success: false, error: "missing_title" };

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      description: input.description?.trim() || null,
      client_id: input.clientId || null,
      project_id: input.projectId || null,
      content_type: input.contentType ?? "post",
      platform: input.platform || null,
      status: input.status ?? "draft",
      priority: input.priority ?? "medium",
      scheduled_at: input.scheduledAt || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/content");
  return { success: true, contentId: data.id };
}

export async function updateContentStatusAction(
  contentId: string,
  status: ContentStatus
): Promise<Result> {
  const supabase = await createClient();

  const update: Record<string, unknown> = { status };
  if (status === "published") {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("content_items")
    .update(update)
    .eq("id", contentId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/content");
  revalidatePath(`/dashboard/content/${contentId}`);
  return { success: true, contentId };
}

export async function deleteContentAction(contentId: string): Promise<Result> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("content_items")
    .delete()
    .eq("id", contentId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/content");
  return { success: true, contentId };
}