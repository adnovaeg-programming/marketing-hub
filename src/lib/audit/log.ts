"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

type Severity = "info" | "warning" | "critical";

export type AuditAction =
  // Auth
  | "auth.login"
  | "auth.logout"
  | "auth.signup"
  | "auth.password_reset"
  // Workspace
  | "workspace.create"
  | "workspace.update"
  | "workspace.delete"
  | "workspace.switch"
  // Members
  | "member.invite"
  | "member.remove"
  | "member.role_change"
  | "member.accept_invite"
  // Clients
  | "client.create"
  | "client.update"
  | "client.delete"
  // Projects
  | "project.create"
  | "project.update"
  | "project.delete"
  | "project.status_change"
  // Tasks
  | "task.create"
  | "task.update"
  | "task.delete"
  | "task.status_change"
  | "task.bulk_delete"
  | "task.bulk_status_change"
  // Content
  | "content.create"
  | "content.update"
  | "content.delete"
  | "content.status_change"
  | "content.approve"
  | "content.reject"
  // Files
  | "file.upload"
  | "file.delete"
  // Admin
  | "admin.user_suspend"
  | "admin.user_restore"
  | "admin.workspace_delete"
  | "admin.feature_toggle";

export type AuditPayload = {
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, unknown>;
  severity?: Severity;
};

export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;
    const userAgent = headersList.get("user-agent") ?? null;

    const { error } = await supabase.rpc("log_audit", {
      p_action: payload.action,
      p_entity_type: payload.entityType ?? null,
      p_entity_id: payload.entityId ?? null,
      p_entity_name: payload.entityName ?? null,
      p_metadata: payload.metadata ?? null,
      p_severity: payload.severity ?? "info",
    });

    if (error) {
      console.warn("[Audit] Failed to log:", error.message);
    }

    // ملاحظة: رغم إن الدالة بتتعامل مع الـ IP بنفسها، لكن بنقدر نضيف
    // معلومات إضافية عن الـ IP/UA لو احتجنا
    void ip;
    void userAgent;
  } catch (err) {
    console.warn("[Audit] Exception:", err);
  }
}