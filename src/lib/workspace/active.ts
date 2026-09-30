import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "mh_workspace";

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // لو فيه cookie صالحة → استخدمها
  if (fromCookie) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("workspace_id", fromCookie)
      .eq("status", "active")
      .maybeSingle();

    if (member) return member.workspace_id;
  }

  // ✅ آخر workspace انضم له (الأحدث)
  const { data: last } = await supabase
    .from("workspace_members")
    .select("workspace_id, joined_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return last?.workspace_id ?? null;
}

export async function getUserWorkspaces() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      role,
      joined_at,
      workspace:workspaces (id, name, slug)
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  return (data ?? []).map((m) => {
    const w = Array.isArray(m.workspace) ? m.workspace[0] : m.workspace;
    return {
      id: m.workspace_id,
      role: m.role,
      name: w?.name ?? "",
      slug: w?.slug ?? "",
    };
  });
}

export async function getWorkspaceById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("workspaces")
    .select("id, name, slug, organization_id")
    .eq("id", id)
    .maybeSingle();

  return data;
}