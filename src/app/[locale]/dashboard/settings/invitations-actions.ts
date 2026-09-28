"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type InviteRole = "admin" | "member" | "client" | "viewer";

type InviteInput = {
  email: string;
  role: InviteRole;
};

type Result =
  | { success: true; token: string; invitationId: string }
  | { success: false; error: string };

export async function createInvitationAction(
  input: InviteInput
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

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { success: false, error: "invalid_email" };
  }

  // نتأكد إنه مش عضو بالفعل
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("id, profile:profiles(email)")
    .eq("workspace_id", member.workspace_id);

  const alreadyMember = (existing ?? []).some((m) => {
    const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile;
    return profile?.email?.toLowerCase() === email;
  });

  if (alreadyMember) {
    return { success: false, error: "already_member" };
  }

  // نلغي أي دعوة pending قديمة لنفس الإيميل
  await supabase
    .from("workspace_invitations")
    .update({ status: "cancelled" })
    .eq("workspace_id", member.workspace_id)
    .eq("email", email)
    .eq("status", "pending");

  const { data, error } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: member.workspace_id,
      email,
      role: input.role,
      invited_by: user.id,
    })
    .select("id, token")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return {
    success: true,
    token: data.token,
    invitationId: data.id,
  };
}

export async function cancelInvitationAction(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workspace_invitations")
    .update({ status: "cancelled" })
    .eq("id", invitationId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function acceptInvitationAction(
  token: string
): Promise<{ success: true; workspaceId: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "not_authenticated" };

  const { data, error } = await supabase.rpc("accept_workspace_invitation", {
    invite_token: token,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, workspaceId: data as string };
}