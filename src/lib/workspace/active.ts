import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "mh_workspace";

/**
 * ترتيب الأدوار من الأعلى للأدنى
 */
const ROLE_RANK: Record<string, number> = {
  owner: 5,
  admin: 4,
  member: 3,
  client: 2,
  viewer: 1,
};

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // نجيب كل العضويات
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, joined_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  if (!memberships || memberships.length === 0) return null;

  // ✅ لو فيه cookie → نتأكد إنها صالحة
  if (fromCookie) {
    const found = memberships.find((m) => m.workspace_id === fromCookie);
    if (found) {
      // لكن لو الكوكي على دور client/viewer وفيه workspace بدور أعلى → نستخدم الأعلى
      const highest = [...memberships].sort(
        (a, b) =>
          (ROLE_RANK[b.role] ?? 0) - (ROLE_RANK[a.role] ?? 0)
      )[0];

      const isClientRole = found.role === "client" || found.role === "viewer";
      const hasBetterRole =
        !isClientRole &&
        (ROLE_RANK[found.role] ?? 0) >= (ROLE_RANK[highest.role] ?? 0);

      if (isClientRole && highest.role !== found.role) {
        return highest.workspace_id;
      }

      if (hasBetterRole || !isClientRole) {
        return found.workspace_id;
      }
    }
  }

  // ✅ بدون cookie: نختار الـ workspace بأعلى دور
  const highest = [...memberships].sort(
    (a, b) => (ROLE_RANK[b.role] ?? 0) - (ROLE_RANK[a.role] ?? 0)
  )[0];

  return highest.workspace_id;
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

  return (data ?? [])
    .map((m) => {
      const w = Array.isArray(m.workspace) ? m.workspace[0] : m.workspace;
      return {
        id: m.workspace_id,
        role: m.role,
        name: w?.name ?? "",
        slug: w?.slug ?? "",
      };
    })
    .sort(
      (a, b) => (ROLE_RANK[b.role] ?? 0) - (ROLE_RANK[a.role] ?? 0)
    );
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