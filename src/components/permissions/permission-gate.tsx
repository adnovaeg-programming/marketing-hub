"use client";

import { usePermissions } from "@/hooks/use-permissions";
import type { Permission, Role } from "@/lib/permissions";

export function PermissionGate({
  role,
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: {
  role: Role | null | undefined;
  permission?: Permission;
  anyOf?: Permission[];
  allOf?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, canAny, canAll } = usePermissions(role);

  let allowed = true;

  if (permission) allowed = allowed && can(permission);
  if (anyOf) allowed = allowed && canAny(anyOf);
  if (allOf) allowed = allowed && canAll(allOf);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}