"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email/send";

export type SignUpResult =
  | { success: true; needsConfirmation: boolean }
  | { success: false; error: string };

export async function signUpAction(formData: FormData): Promise<SignUpResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const accountType = String(formData.get("accountType") ?? "client");

  if (!email || !password || !name) {
    return { success: false, error: "missing_fields" };
  }

  if (password.length < 8) {
    return { success: false, error: "password_too_short" };
  }

  // Rate limiting
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limit = rateLimit({
    key: `signup:${ip}`,
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  });

  if (!limit.success) {
    return { success: false, error: "too_many_attempts" };
  }

  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await createClient();
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

  if (error) return { success: false, error: error.message };

  const needsConfirmation = !data.session;

  // إيميل ترحيبي (اختياري — لو الإيميل مش محتاج تأكيد)
  if (!needsConfirmation) {
    await sendWelcomeEmail({
      to: email,
      name: firstName || email,
      dashboardUrl: `${siteUrl}/ar/dashboard`,
    });
  }

  return { success: true, needsConfirmation };
}