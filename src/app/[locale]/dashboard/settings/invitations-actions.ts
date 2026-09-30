"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/email/send";

type InviteRole = "admin" | "member" | "client" | "viewer";

type InviteInput = {
  email: string;
  role: InviteRole;
};

type Result =
  | { success: true; token: string; invitationId: string; emailSent: boolean }
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
    .select(
      `workspace_id, role,
       workspace:workspaces (id, name)`
    )
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

  // نلغي أي دعوة pending قديمة
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

  // نجيب اسم الداعي
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  const inviterName =
    [inviterProfile?.first_name, inviterProfile?.last_name]
      .filter(Boolean)
      .join(" ") || inviterProfile?.email || "Someone";

  const workspace = Array.isArray(member.workspace)
    ? member.workspace[0]
    : member.workspace;

  // نبعت الإيميل
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const emailResult = await sendInvitationEmail({
    to: email,
    workspaceName: workspace?.name ?? "مساحة العمل",
    inviterName,
    role: input.role,
    inviteUrl: `${siteUrl}/ar/invite/${data.token}`,
  });

  revalidatePath("/dashboard/settings");
  return {
    success: true,
    token: data.token,
    invitationId: data.id,
    emailSent: emailResult.success,
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
): Promise<
  { success: true; workspaceId: string } | { success: false; error: string }
> {
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