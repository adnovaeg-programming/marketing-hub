import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components مش بتقدر تكتب cookies
            // الـ Proxy بيتعامل مع ده
          }
        },
      },
    }
  );
}

/**
 * نسخة آمنة ترجع null لو حصل خطأ refresh token
 * استخدمها في الصفحات اللي ممكن تكون فيها جلسة قديمة
 */
export async function getSafeUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return { user: null, supabase, error };
    return { user, supabase, error: null };
  } catch (error) {
    return { user: null, supabase: null, error };
  }
}