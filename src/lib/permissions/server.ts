import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/workspace/active";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
  type Role,
} from "./index";

export type WorkspaceContext = {
  userId: string;
  workspaceId: string;
  role: Role;
};

/**
 * نجيب سياق المستخدم في الـ active workspace
 */
export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) return null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .maybeSingle();

  if (!member) return null;

  return {
    userId: user.id,
    workspaceId,
    role: member.role as Role,
  };
}

/**
 * نتحقق من صلاحية واحدة — نرجع boolean
 */
export async function can(permission: Permission): Promise<boolean> {
  const ctx = await getWorkspaceContext();
  if (!ctx) return false;
  return hasPermission(ctx.role, permission);
}

/**
 * نتحقق من عدة صلاحيات (OR)
 */
export async function canAny(permissions: Permission[]): Promise<boolean> {
  const ctx = await getWorkspaceContext();
  if (!ctx) return false;
  return hasAnyPermission(ctx.role, permissions);
}

/**
 * نتحقق من عدة صلاحيات (AND)
 */
export async function canAll(permissions: Permission[]): Promise<boolean> {
  const ctx = await getWorkspaceContext();
  if (!ctx) return false;
  return hasAllPermissions(ctx.role, permissions);
}

/**
 * Guard — يرمي خطأ لو الصلاحية مش موجودة
 */
export async function requirePermission(
  permission: Permission
): Promise<WorkspaceContext> {
  const ctx = await getWorkspaceContext();
  if (!ctx) {
    throw new Error("not_authenticated");
  }
  if (!hasPermission(ctx.role, permission)) {
    throw new Error("not_allowed");
  }
  return ctx;
}

/**
 * Guard متعدد (OR)
 */
export async function requireAnyPermission(
  permissions: Permission[]
): Promise<WorkspaceContext> {
  const ctx = await getWorkspaceContext();
  if (!ctx) throw new Error("not_authenticated");
  if (!hasAnyPermission(ctx.role, permissions)) {
    throw new Error("not_allowed");
  }
  return ctx;
}

/**
 * هل المستخدم Platform Admin؟
 */
export async function isPlatformAdmin(): Promise<{
  isAdmin: boolean;
  role: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false, role: null };

  const { data } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { isAdmin: !!data, role: data?.role ?? null };
}

/**
 * Guard — يرمي خطأ لو مش Platform Admin
 */
export async function requirePlatformAdmin(): Promise<{
  userId: string;
  role: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("not_authenticated");

  const { data } = await supabase
    .from("platform_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) throw new Error("not_allowed");

  return { userId: user.id, role: data.role };
}