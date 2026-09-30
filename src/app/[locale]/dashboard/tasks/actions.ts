"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";

type TaskStatus = "todo" | "in_progress" | "review" | "completed" | "cancelled";
type Priority = "low" | "medium" | "high" | "urgent";

type TaskInput = {
  title: string;
  description?: string;
  projectId?: string | null;
  clientId?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assignedTo?: string | null;
};

type Result =
  | { success: true; taskId: string }
  | { success: false; error: string };

export async function createTaskAction(input: TaskInput): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) return { success: false, error: "no_workspace" };

  const title = input.title.trim();
  if (!title) return { success: false, error: "missing_title" };

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      description: input.description?.trim() || null,
      project_id: input.projectId || null,
      client_id: input.clientId || null,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      due_date: input.dueDate || null,
      assigned_to: input.assignedTo || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true, taskId: data.id };
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<Result> {
  const supabase = await createClient();
  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("tasks").update(update).eq("id", taskId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true, taskId };
}

export async function deleteTaskAction(taskId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true, taskId };
}

/* ═══════════ BULK ACTIONS ═══════════ */

export async function bulkDeleteTasksAction(
  taskIds: string[]
): Promise<{ success: boolean; error?: string; count?: number }> {
  if (taskIds.length === 0) return { success: false, error: "no_items" };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("tasks")
    .delete({ count: "exact" })
    .in("id", taskIds);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true, count: count ?? 0 };
}

export async function bulkUpdateTasksStatusAction(
  taskIds: string[],
  status: TaskStatus
): Promise<{ success: boolean; error?: string; count?: number }> {
  if (taskIds.length === 0) return { success: false, error: "no_items" };

  const supabase = await createClient();
  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();

  const { error, count } = await supabase
    .from("tasks")
    .update(update, { count: "exact" })
    .in("id", taskIds);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard");
  return { success: true, count: count ?? 0 };
}

/* ═══════════ COMMENTS ═══════════ */

export async function addTaskCommentAction(
  taskId: string,
  content: string
): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };

  const trimmed = content.trim();
  if (!trimmed) return { success: false, error: "missing_content" };

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    user_id: user.id,
    content: trimmed,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/tasks/${taskId}`);
  return { success: true, taskId };
}

export async function deleteTaskCommentAction(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "not_authenticated" };

  const { error } = await supabase
    .from("task_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}