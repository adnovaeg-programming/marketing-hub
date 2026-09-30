"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export type SignInResult =
  | { success: true }
  | { success: false; error: string };

export async function signInAction(formData: FormData): Promise<SignInResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "missing_fields" };
  }

  // Rate limiting per email + IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit({
    key: `login:${email}:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (!limit.success) {
    return { success: false, error: "too_many_attempts" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
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