"use server";

import { createClient } from "@/lib/supabase/server";

type CreateInput = {
  orgName: string;
  workspaceName: string;
};

type Result =
  | { success: true; workspaceId: string }
  | { success: false; error: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrgAndWorkspaceAction(
  input: CreateInput
): Promise<Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "not_authenticated" };
  }

  const orgName = input.orgName.trim();
  const workspaceName = input.workspaceName.trim();

  if (!orgName || !workspaceName) {
    return { success: false, error: "missing_fields" };
  }

  // نقرا نوع الحساب
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  const accountType = profile?.account_type ?? "client";

  const orgSlug = `${slugify(orgName) || "org"}-${Date.now().toString(36)}`;
  const wsSlug = slugify(workspaceName) || "workspace";

  // ✨ ننادي الدالة اللي في Supabase
  const { data, error } = await supabase.rpc(
    "create_organization_with_workspace",
    {
      org_name: orgName,
      org_slug: orgSlug,
      org_type: accountType,
      workspace_name: workspaceName,
      workspace_slug: wsSlug,
    }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, workspaceId: data as string };
}