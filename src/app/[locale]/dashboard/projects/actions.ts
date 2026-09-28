"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "cancelled";
type ProjectPriority = "low" | "medium" | "high" | "urgent";

type ProjectInput = {
  name: string;
  description?: string;
  clientId?: string | null;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  endDate?: string;
  budget?: string;
  currency?: string;
};

type Result =
  | { success: true; projectId: string }
  | { success: false; error: string };

// ✅ قوائم التحقق بدل `as never`
const VALID_STATUSES: ProjectStatus[] = [
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
];
const VALID_PRIORITIES: ProjectPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];
const VALID_CURRENCIES = ["EGP", "USD", "SAR", "AED"];

async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return member?.workspace_id ?? null;
}

export async function createProjectAction(
  input: ProjectInput
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { success: false, error: "no_workspace" };

  // ✅ 1) تحقق من الاسم
  const name = input.name?.trim();
  if (!name) return { success: false, error: "missing_name" };
  if (name.length > 200) return { success: false, error: "name_too_long" };

  // ✅ 2) تحقق من القيم المحددة (status, priority, currency)
  const status: ProjectStatus =
    input.status && VALID_STATUSES.includes(input.status)
      ? input.status
      : "draft";

  const priority: ProjectPriority =
    input.priority && VALID_PRIORITIES.includes(input.priority)
      ? input.priority
      : "medium";

  const currency =
    input.currency && VALID_CURRENCIES.includes(input.currency)
      ? input.currency
      : "EGP";

  // ✅ 3) تحقق من الـ budget
  let budget: number | null = null;
  if (input.budget && input.budget.trim() !== "") {
    const parsed = Number(input.budget);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { success: false, error: "invalid_budget" };
    }
    budget = parsed;
  }

  // ✅ 4) تحقق من التواريخ
  const startDate = input.startDate?.trim() || null;
  const endDate = input.endDate?.trim() || null;

  if (startDate && endDate && startDate > endDate) {
    return { success: false, error: "end_before_start" };
  }

  // ✅ 5) تحقق إن الـ client ينتمي لنفس الـ workspace (لو موجود)
  let clientId: string | null = null;
  if (input.clientId) {
    const { data: clientRow } = await supabase
      .from("clients")
      .select("id")
      .eq("id", input.clientId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (!clientRow) {
      return { success: false, error: "invalid_client" };
    }
    clientId = clientRow.id;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      name,
      description: input.description?.trim() || null,
      client_id: clientId,
      status,
      priority,
      start_date: startDate,
      end_date: endDate,
      budget,
      currency,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { success: true, projectId: data.id };
}

export async function deleteProjectAction(projectId: string): Promise<Result> {
  if (!projectId) return { success: false, error: "missing_id" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { success: false, error: "no_workspace" };

  // ✅ نتأكد إن المشروع ينتمي لنفس الـ workspace قبل الحذف
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("workspace_id", workspaceId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
  return { success: true, projectId };
}