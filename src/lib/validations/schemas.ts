import { z } from "zod";

/* ═══════════════════════════════════════════════════════
   CLIENTS
   ═══════════════════════════════════════════════════════ */

export const clientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "الاسم لازم يكون حرفين على الأقل" })
    .max(100, { message: "الاسم طويل جداً" }),
  email: z
    .string()
    .email({ message: "الإيميل مش صحيح" })
    .or(z.literal(""))
    .optional(),
  phone: z
    .string()
    .max(20, { message: "رقم الهاتف طويل جداً" })
    .or(z.literal(""))
    .optional(),
  company: z.string().max(100).or(z.literal("")).optional(),
  industry: z.string().max(100).or(z.literal("")).optional(),
  website: z
    .string()
    .url({ message: "الرابط مش صحيح" })
    .or(z.literal(""))
    .optional(),
  status: z.enum(["active", "lead", "archived"]).default("active"),
  notes: z.string().max(1000).or(z.literal("")).optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

/* ═══════════════════════════════════════════════════════
   PROJECTS
   ═══════════════════════════════════════════════════════ */

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "اسم المشروع لازم حرفين على الأقل" })
      .max(150),
    description: z.string().max(2000).or(z.literal("")).optional(),
    clientId: z.string().optional(),
    status: z
      .enum(["draft", "active", "on_hold", "completed", "cancelled"])
      .default("draft"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z
      .string()
      .refine(
        (val) => val === "" || !isNaN(Number(val)),
        { message: "الميزانية لازم تكون رقم" }
      )
      .optional(),
    currency: z.enum(["EGP", "USD", "SAR", "AED"]).default("EGP"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "تاريخ النهاية لازم يكون بعد البداية",
      path: ["endDate"],
    }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;

/* ═══════════════════════════════════════════════════════
   TASKS
   ═══════════════════════════════════════════════════════ */

export const taskSchema = z.object({
  title: z
    .string()
    .min(2, { message: "عنوان المهمة لازم حرفين على الأقل" })
    .max(200),
  description: z.string().max(2000).or(z.literal("")).optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  status: z
    .enum(["todo", "in_progress", "review", "completed", "cancelled"])
    .default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

/* ═══════════════════════════════════════════════════════
   CONTENT
   ═══════════════════════════════════════════════════════ */

export const contentSchema = z.object({
  title: z
    .string()
    .min(2, { message: "عنوان المحتوى لازم حرفين على الأقل" })
    .max(200),
  description: z.string().max(3000).or(z.literal("")).optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  contentType: z
    .enum(["post", "story", "reel", "video", "image", "article", "carousel"])
    .default("post"),
  platform: z
    .enum(["instagram", "facebook", "tiktok", "x", "linkedin", "youtube"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  scheduledAt: z.string().optional(),
});

export type ContentFormValues = z.infer<typeof contentSchema>;

/* ═══════════════════════════════════════════════════════
   WORKSPACE
   ═══════════════════════════════════════════════════════ */

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, { message: "اسم مساحة العمل لازم حرفين على الأقل" })
    .max(100),
  description: z.string().max(500).or(z.literal("")).optional(),
});

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

/* ═══════════════════════════════════════════════════════
   ORGANIZATION
   ═══════════════════════════════════════════════════════ */

export const organizationSchema = z.object({
  name: z
    .string()
    .min(2, { message: "اسم المؤسسة لازم حرفين على الأقل" })
    .max(100),
  website: z
    .string()
    .url({ message: "الرابط مش صحيح" })
    .or(z.literal(""))
    .optional(),
  description: z.string().max(1000).or(z.literal("")).optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

/* ═══════════════════════════════════════════════════════
   PROFILE
   ═══════════════════════════════════════════════════════ */

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "الاسم الأول لازم حرفين على الأقل" })
    .max(50),
  lastName: z.string().max(50).or(z.literal("")).optional(),
  phone: z
    .string()
    .max(20, { message: "رقم الهاتف طويل جداً" })
    .or(z.literal(""))
    .optional(),
  jobTitle: z.string().max(100).or(z.literal("")).optional(),
  bio: z.string().max(500).or(z.literal("")).optional(),
  country: z.string().max(100).or(z.literal("")).optional(),
  city: z.string().max(100).or(z.literal("")).optional(),
  timezone: z.string().default("Africa/Cairo"),
  language: z.enum(["ar", "en"]).default("ar"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/* ═══════════════════════════════════════════════════════
   INVITE
   ═══════════════════════════════════════════════════════ */

export const inviteSchema = z.object({
  email: z.string().email({ message: "الإيميل مش صحيح" }),
  role: z.enum(["admin", "member", "client", "viewer"]).default("member"),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;