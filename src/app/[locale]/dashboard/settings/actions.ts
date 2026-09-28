"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type Result = { success: true } | { success: false; error: string };

// ═══════════ Profile ═══════════

type ProfileInput = {
  firstName: string;
  lastName: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
  country?: string;
  city?: string;
  timezone?: string;
  language?: "ar" | "en";
};

export async function updateProfileAction(
  input: ProfileInput
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  if (!firstName) return { success: false, error: "missing_first_name" };

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: input.phone?.trim() || null,
      job_title: input.jobTitle?.trim() || null,
      bio: input.bio?.trim() || null,
      country: input.country?.trim() || null,
      city: input.city?.trim() || null,
      timezone: input.timezone || "Africa/Cairo",
      language: input.language || "ar",
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

// ═══════════ Workspace ═══════════

type WorkspaceInput = {
  name: string;
  description?: string;
};

export async function updateWorkspaceAction(
  input: WorkspaceInput
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!member) return { success: false, error: "no_workspace" };

  if (member.role !== "owner" && member.role !== "admin") {
    return { success: false, error: "not_allowed" };
  }

  const name = input.name.trim();
  if (!name) return { success: false, error: "missing_name" };

  const { error } = await supabase
    .from("workspaces")
    .update({
      name,
      description: input.description?.trim() || null,
    })
    .eq("id", member.workspace_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

// ═══════════ Organization ═══════════

type OrganizationInput = {
  name: string;
  website?: string;
  description?: string;
};

export async function updateOrganizationAction(
  input: OrganizationInput
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!org) return { success: false, error: "no_organization" };

  const name = input.name.trim();
  if (!name) return { success: false, error: "missing_name" };

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      website: input.website?.trim() || null,
      description: input.description?.trim() || null,
    })
    .eq("id", org.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}