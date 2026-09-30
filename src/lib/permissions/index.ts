export type Role = "owner" | "admin" | "member" | "client" | "viewer";

export type Permission =
  // Workspace
  | "workspace.view"
  | "workspace.update"
  | "workspace.delete"
  // Members
  | "member.view"
  | "member.invite"
  | "member.remove"
  | "member.role_change"
  // Clients
  | "client.view"
  | "client.create"
  | "client.update"
  | "client.delete"
  // Projects
  | "project.view"
  | "project.create"
  | "project.update"
  | "project.delete"
  // Tasks
  | "task.view"
  | "task.create"
  | "task.update"
  | "task.delete"
  | "task.assign"
  // Content
  | "content.view"
  | "content.create"
  | "content.update"
  | "content.delete"
  | "content.approve"
  | "content.publish"
  // Analytics
  | "analytics.view"
  // Settings
  | "settings.view"
  | "settings.update"
  // Billing
  | "billing.view"
  | "billing.manage";

const ALL_PERMISSIONS: Permission[] = [
  "workspace.view",
  "workspace.update",
  "workspace.delete",
  "member.view",
  "member.invite",
  "member.remove",
  "member.role_change",
  "client.view",
  "client.create",
  "client.update",
  "client.delete",
  "project.view",
  "project.create",
  "project.update",
  "project.delete",
  "task.view",
  "task.create",
  "task.update",
  "task.delete",
  "task.assign",
  "content.view",
  "content.create",
  "content.update",
  "content.delete",
  "content.approve",
  "content.publish",
  "analytics.view",
  "settings.view",
  "settings.update",
  "billing.view",
  "billing.manage",
];

/**
 * Permissions Matrix
 * ------------------
 * owner  → كل حاجة
 * admin  → كل حاجة ما عدا حذف الـ workspace + billing
 * member → إنشاء وتعديل المحتوى والمهام، لكن مش حذف
 * client → عرض المشاريع والمحتوى + الموافقة فقط
 * viewer → عرض فقط (بدون analytics)
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter(
    (p) =>
      p !== "workspace.delete" &&
      p !== "billing.manage" &&
      p !== "billing.view"
  ),
  member: [
    "workspace.view",
    "member.view",
    "client.view",
    "project.view",
    "project.create",
    "project.update",
    "task.view",
    "task.create",
    "task.update",
    "task.assign",
    "content.view",
    "content.create",
    "content.update",
    "analytics.view",
    "settings.view",
  ],
  client: [
    "workspace.view",
    "project.view",
    "content.view",
    "content.approve",
    "analytics.view",
  ],
  // ✅ viewer = 4 صلاحيات فقط (الأقل)
  viewer: [
    "workspace.view",
    "project.view",
    "task.view",
    "content.view",
  ],
};

export function hasPermission(
  role: Role | undefined | null,
  permission: Permission
): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

export function hasAnyPermission(
  role: Role | undefined | null,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(
  role: Role | undefined | null,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export const ROLE_LABELS: Record<Role, { ar: string; en: string }> = {
  owner: { ar: "مالك", en: "Owner" },
  admin: { ar: "أدمن", en: "Admin" },
  member: { ar: "عضو", en: "Member" },
  client: { ar: "عميل", en: "Client" },
  viewer: { ar: "مشاهد", en: "Viewer" },
};