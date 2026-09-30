"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type ClientInput = {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  industry?: string;
  website?: string;
  notes?: string;
  status?: "active" | "lead" | "archived";
};

type Result =
  | { success: true; clientId: string }
  | { success: false; error: string };

export async function createClientAction(input: ClientInput): Promise<Result> {
  try {
    const ctx = await requirePermission("client.create");
    const supabase = await createClient();

    const name = input.name.trim();
    if (!name) return { success: false, error: "missing_name" };

    const { data, error } = await supabase
      .from("clients")
      .insert({
        workspace_id: ctx.workspaceId,
        created_by: ctx.userId,
        name,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        company: input.company?.trim() || null,
        industry: input.industry?.trim() || null,
        website: input.website?.trim() || null,
        notes: input.notes?.trim() || null,
        status: input.status ?? "active",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "client.create",
      entityType: "client",
      entityId: data.id,
      entityName: name,
      metadata: { status: input.status ?? "active" },
    });

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard");
    return { success: true, clientId: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
}

export async function deleteClientAction(clientId: string): Promise<Result> {
  try {
    const ctx = await requirePermission("client.delete");
    const supabase = await createClient();

    // نجيب الاسم قبل الحذف للـ audit
    const { data: client } = await supabase
      .from("clients")
      .select("name")
      .eq("id", clientId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle();

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "client.delete",
      entityType: "client",
      entityId: clientId,
      entityName: client?.name,
      severity: "warning",
    });

    revalidatePath("/dashboard/clients");
    revalidatePath("/dashboard");
    return { success: true, clientId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown_error",
    };
  }
}