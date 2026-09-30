"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

/* ═══════════ EXPORT DATA ═══════════ */

export type ExportData = {
  exported_at: string;
  user: {
    id: string;
    email: string;
    profile: Record<string, unknown> | null;
  };
  workspaces: unknown[];
  clients: unknown[];
  projects: unknown[];
  tasks: unknown[];
  content: unknown[];
};

export async function exportUserDataAction(): Promise<
  { success: true; data: ExportData } | { success: false; error: string }
> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "not_authenticated" };

    const [profileRes, workspacesRes, clientsRes, projectsRes, tasksRes, contentRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("workspace_members")
          .select(
            `
            role, joined_at,
            workspace:workspaces (id, name, slug, created_at)
          `
          )
          .eq("user_id", user.id),
        supabase
          .from("clients")
          .select("*")
          .eq("workspace_id", ctx.workspaceId),
        supabase
          .from("projects")
          .select("*")
          .eq("workspace_id", ctx.workspaceId),
        supabase.from("tasks").select("*").eq("workspace_id", ctx.workspaceId),
        supabase
          .from("content_items")
          .select("*")
          .eq("workspace_id", ctx.workspaceId),
      ]);

    const data: ExportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email ?? "",
        profile: profileRes.data as Record<string, unknown> | null,
      },
      workspaces: workspacesRes.data ?? [],
      clients: clientsRes.data ?? [],
      projects: projectsRes.data ?? [],
      tasks: tasksRes.data ?? [],
      content: contentRes.data ?? [],
    };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "user",
      entityId: user.id,
      metadata: { action: "data_export" },
    });

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ DELETE ACCOUNT ═══════════ */

export async function requestAccountDeletionAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "not_authenticated" };

    // نحدّث الـ status لـ 'deleted' (soft delete)
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "deleted",
        // نخزن طلب الحذف كـ metadata
      })
      .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "user",
      entityId: user.id,
      metadata: { action: "account_deletion_requested" },
      severity: "critical",
    });

    // نسجّل خروج
    await supabase.auth.signOut();

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}