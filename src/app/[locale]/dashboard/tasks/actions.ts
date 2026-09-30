"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission, getWorkspaceContext } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

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

type Result = { success: true; taskId: string } | { success: false; error: string };

export async function createTaskAction(input: TaskInput): Promise<Result> {
  try {
    const ctx = await requirePermission("task.create");
    const supabase = await createClient();

    const title = input.title.trim();
    if (!title) return { success: false, error: "missing_title" };

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        workspace_id: ctx.workspaceId,
        created_by: ctx.userId,
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

    await logAudit({
      action: "task.create",
      entityType: "task",
      entityId: data.id,
      entityName: title,
      metadata: { status: input.status ?? "todo", priority: input.priority ?? "medium" },
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true, taskId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus): Promise<Result> {
  try {
    const ctx = await requirePermission("task.update");
    const supabase = await createClient();

    const update: Record<string, unknown> = { status };
    if (status === "completed") update.completed_at = new Date().toISOString();

    const { data: task } = await supabase
      .from("tasks")
      .select("title")
      .eq("id", taskId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle();

    const { error } = await supabase.from("tasks").update(update).eq("id", taskId);
    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "task.status_change",
      entityType: "task",
      entityId: taskId,
      entityName: task?.title,
      metadata: { new_status: status },
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath(`/dashboard/tasks/${taskId}`);
    revalidatePath("/dashboard");
    return { success: true, taskId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function deleteTaskAction(taskId: string): Promise<Result> {
  try {
    const ctx = await requirePermission("task.delete");
    const supabase = await createClient();

    const { data: task } = await supabase
      .from("tasks")
      .select("title")
      .eq("id", taskId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle();

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "task.delete",
      entityType: "task",
      entityId: taskId,
      entityName: task?.title,
      severity: "warning",
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true, taskId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function bulkDeleteTasksAction(taskIds: string[]) {
  try {
    const ctx = await requirePermission("task.delete");
    if (taskIds.length === 0) return { success: false, error: "no_items" };

    const supabase = await createClient();
    const { error, count } = await supabase.from("tasks").delete({ count: "exact" }).in("id", taskIds);
    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "task.bulk_delete",
      entityType: "task",
      metadata: { count: count ?? 0, ids: taskIds.slice(0, 10) },
      severity: "warning",
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true, count: count ?? 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function bulkUpdateTasksStatusAction(taskIds: string[], status: TaskStatus) {
  try {
    const ctx = await requirePermission("task.update");
    if (taskIds.length === 0) return { success: false, error: "no_items" };

    const supabase = await createClient();
    const update: Record<string, unknown> = { status };
    if (status === "completed") update.completed_at = new Date().toISOString();

    const { error, count } = await supabase.from("tasks").update(update, { count: "exact" }).in("id", taskIds);
    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "task.bulk_status_change",
      entityType: "task",
      metadata: { count: count ?? 0, status },
    });

    revalidatePath("/dashboard/tasks");
    revalidatePath("/dashboard");
    return { success: true, count: count ?? 0 };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function addTaskCommentAction(taskId: string, content: string): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: "missing_content" };

    const { error } = await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: ctx.userId,
      content: trimmed,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/tasks/${taskId}`);
    return { success: true, taskId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}

export async function deleteTaskCommentAction(commentId: string) {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("task_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "unknown_error" };
  }
}