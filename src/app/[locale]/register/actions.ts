"use server";

import { createClient } from "@/lib/supabase/server";

export type SignUpResult =
  | { success: true; needsConfirmation: boolean }
  | { success: false; error: string };

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const accountType = String(formData.get("accountType") ?? "client");

  // Basic validation
  if (!email || !password || !name) {
    return { success: false, error: "missing_fields" };
  }

  if (password.length < 8) {
    return { success: false, error: "password_too_short" };
  }

  // Split name into first + last
  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        account_type: accountType,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // لو Supabase رجّع session → الإيميل مش محتاج تأكيد
  const needsConfirmation = !data.session;

  return { success: true, needsConfirmation };
}