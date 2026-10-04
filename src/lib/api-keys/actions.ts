"use server";

import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function generateKey(): { raw: string; prefix: string; hash: string } {
  const raw = `mh_${randomBytes(24).toString("hex")}`;
  const prefix = raw.substring(0, 12);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export async function createApiKeyAction(
  name: string,
  scopes: string[] = ["read"]
): Promise<Result<{ id: string; rawKey: string }>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!name.trim()) return { success: false, error: "missing_name" };

    const { raw, prefix, hash } = generateKey();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        name: name.trim(),
        key_prefix: prefix,
        key_hash: hash,
        scopes,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/api-keys");
    return { success: true, data: { id: data.id, rawKey: raw } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function revokeApiKeyAction(keyId: string): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("id", keyId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/api-keys");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function deleteApiKeyAction(keyId: string): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", keyId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/settings/api-keys");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}