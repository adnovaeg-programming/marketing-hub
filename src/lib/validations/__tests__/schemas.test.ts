import { describe, it, expect } from "vitest";

import {
  clientSchema,
  projectSchema,
  taskSchema,
  workspaceSchema,
  inviteSchema,
} from "../schemas";

describe("Validation Schemas", () => {
  describe("clientSchema", () => {
    it("should validate valid client data", () => {
      const result = clientSchema.safeParse({
        name: "أحمد محمد",
        email: "ahmed@example.com",
        status: "active",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const result = clientSchema.safeParse({
        name: "أ",
        status: "active",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = clientSchema.safeParse({
        name: "أحمد محمد",
        email: "not-an-email",
        status: "active",
      });
      expect(result.success).toBe(false);
    });

    it("should allow empty optional fields", () => {
      const result = clientSchema.safeParse({
        name: "أحمد محمد",
        email: "",
        phone: "",
        status: "active",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("projectSchema", () => {
    it("should validate valid project", () => {
      const result = projectSchema.safeParse({
        name: "حملة رمضان",
        status: "active",
        priority: "high",
        currency: "EGP",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid date range (end before start)", () => {
      const result = projectSchema.safeParse({
        name: "حملة رمضان",
        status: "draft",
        priority: "medium",
        currency: "EGP",
        startDate: "2026-10-01",
        endDate: "2026-09-01",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid date range", () => {
      const result = projectSchema.safeParse({
        name: "حملة رمضان",
        status: "draft",
        priority: "medium",
        currency: "EGP",
        startDate: "2026-09-01",
        endDate: "2026-10-01",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("taskSchema", () => {
    it("should validate valid task", () => {
      const result = taskSchema.safeParse({
        title: "تصميم بانر",
        status: "todo",
        priority: "urgent",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = taskSchema.safeParse({
        title: "",
        status: "todo",
        priority: "medium",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("workspaceSchema", () => {
    it("should validate valid workspace", () => {
      const result = workspaceSchema.safeParse({
        name: "الفريق الرئيسي",
        description: "فريق التسويق الأساسي",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const result = workspaceSchema.safeParse({
        name: "أ",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("inviteSchema", () => {
    it("should validate valid invite", () => {
      const result = inviteSchema.safeParse({
        email: "member@example.com",
        role: "member",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = inviteSchema.safeParse({
        email: "invalid",
        role: "member",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const result = inviteSchema.safeParse({
        email: "member@example.com",
        role: "superuser",
      });
      expect(result.success).toBe(false);
    });
  });
});