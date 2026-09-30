import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ⚠️ مهم: نتجاهل أخطاء refresh token بدل ما توقّع التطبيق
  try {
    await supabase.auth.getUser();
  } catch (error) {
    // لو الـ refresh token مش صالح → نمسح الـ cookies المتعلقة بالجلسة
    const isRefreshError =
      error instanceof Error &&
      (error.message.includes("Refresh Token") ||
        error.message.includes("refresh_token"));

    if (isRefreshError) {
      // مسح كل cookies Supabase
      const cookiesToClear = request.cookies
        .getAll()
        .filter(
          (c) =>
            c.name.startsWith("sb-") ||
            c.name.includes("supabase") ||
            c.name.includes("auth")
        );

      cookiesToClear.forEach(({ name }) => {
        supabaseResponse.cookies.delete(name);
      });
    }
    // في كل الحالات، نكمل بدل ما نرمي
  }

  return supabaseResponse;
}