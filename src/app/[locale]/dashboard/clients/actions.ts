"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

export async function createClientAction(input: ClientInput): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return { success: false, error: "no_workspace" };

  const name = input.name.trim();
  if (!name) return { success: false, error: "missing_name" };

  const { data, error } = await supabase
    .from("clients")
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
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

  revalidatePath("/dashboard/clients");
  return { success: true, clientId: data.id };
}

export async function deleteClientAction(clientId: string): Promise<Result> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/clients");
  return { success: true, clientId };
}