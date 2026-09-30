"use client";

import { useMemo } from "react";

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
  type Role,
} from "@/lib/permissions";

export function usePermissions(role: Role | null | undefined) {
  return useMemo(
    () => ({
      can: (permission: Permission) => hasPermission(role, permission),
      canAny: (permissions: Permission[]) =>
        hasAnyPermission(role, permissions),
      canAll: (permissions: Permission[]) =>
        hasAllPermissions(role, permissions),
      role,
    }),
    [role]
  );
}