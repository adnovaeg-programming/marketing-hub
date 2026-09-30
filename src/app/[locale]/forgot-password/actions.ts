"use server";

import { createClient } from "@/lib/supabase/server";

type Result = { success: true } | { success: false; error: string };

export async function forgotPasswordAction(
  formData: FormData
): Promise<Result> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { success: false, error: "invalid_email" };
  }

  const supabase = await createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/ar/reset-password`,
  });

  // ملاحظة أمنية: نرجّع نجاح دائمًا عشان مانكشفش لو الإيميل مسجل أو لأ
  if (error) {
    console.warn("[ForgotPassword] Error:", error.message);
  }

  return { success: true };
}