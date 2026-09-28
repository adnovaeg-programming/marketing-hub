"use server";

import { createClient } from "@/lib/supabase/server";

export type SignInResult =
  | { success: true }
  | { success: false; error: string };

export async function signInAction(formData: FormData): Promise<SignInResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "missing_fields" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // نترجم رسائل Supabase لـ كود واضح
    if (error.message.toLowerCase().includes("invalid")) {
      return { success: false, error: "invalid_credentials" };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { success: false, error: "email_not_confirmed" };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}