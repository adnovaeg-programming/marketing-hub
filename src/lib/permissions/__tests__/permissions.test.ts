import { describe, it, expect } from "vitest";

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  ROLE_PERMISSIONS,
} from "../index";

describe("Permissions", () => {
  describe("hasPermission", () => {
    it("owner should have all permissions", () => {
      expect(hasPermission("owner", "workspace.delete")).toBe(true);
      expect(hasPermission("owner", "billing.manage")).toBe(true);
      expect(hasPermission("owner", "task.create")).toBe(true);
      expect(hasPermission("owner", "client.delete")).toBe(true);
    });

    it("admin should NOT have workspace.delete or billing", () => {
      expect(hasPermission("admin", "workspace.delete")).toBe(false);
      expect(hasPermission("admin", "billing.manage")).toBe(false);
      expect(hasPermission("admin", "billing.view")).toBe(false);
      expect(hasPermission("admin", "task.create")).toBe(true);
      expect(hasPermission("admin", "client.delete")).toBe(true);
    });

    it("member should NOT have delete permissions", () => {
      expect(hasPermission("member", "task.create")).toBe(true);
      expect(hasPermission("member", "task.delete")).toBe(false);
      expect(hasPermission("member", "client.delete")).toBe(false);
      expect(hasPermission("member", "workspace.update")).toBe(false);
    });

    it("client should only approve content", () => {
      expect(hasPermission("client", "content.view")).toBe(true);
      expect(hasPermission("client", "content.approve")).toBe(true);
      expect(hasPermission("client", "content.create")).toBe(false);
      expect(hasPermission("client", "task.create")).toBe(false);
    });

    it("viewer should only view", () => {
      expect(hasPermission("viewer", "content.view")).toBe(true);
      expect(hasPermission("viewer", "content.create")).toBe(false);
      expect(hasPermission("viewer", "task.create")).toBe(false);
    });

    it("null/undefined role should return false", () => {
      expect(hasPermission(null, "task.create")).toBe(false);
      expect(hasPermission(undefined, "task.create")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("should return true if any permission matches", () => {
      expect(
        hasAnyPermission("member", ["task.delete", "task.create"])
      ).toBe(true);
    });

    it("should return false if no permission matches", () => {
      expect(
        hasAnyPermission("viewer", ["task.create", "task.delete"])
      ).toBe(false);
    });
  });

  describe("hasAllPermissions", () => {
    it("should return true if all permissions match", () => {
      expect(
        hasAllPermissions("owner", ["task.create", "task.delete"])
      ).toBe(true);
    });

    it("should return false if any permission missing", () => {
      expect(
        hasAllPermissions("member", ["task.create", "task.delete"])
      ).toBe(false);
    });
  });

  describe("ROLE_PERMISSIONS matrix", () => {
    it("all roles should be defined", () => {
      expect(ROLE_PERMISSIONS.owner).toBeDefined();
      expect(ROLE_PERMISSIONS.admin).toBeDefined();
      expect(ROLE_PERMISSIONS.member).toBeDefined();
      expect(ROLE_PERMISSIONS.client).toBeDefined();
      expect(ROLE_PERMISSIONS.viewer).toBeDefined();
    });

    it("owner should have more permissions than admin", () => {
      expect(ROLE_PERMISSIONS.owner.length).toBeGreaterThan(
        ROLE_PERMISSIONS.admin.length
      );
    });

    it("viewer should have fewest permissions", () => {
      const counts = Object.values(ROLE_PERMISSIONS).map((p) => p.length);
      expect(ROLE_PERMISSIONS.viewer.length).toBe(Math.min(...counts));
    });
  });
});