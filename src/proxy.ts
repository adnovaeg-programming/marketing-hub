import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. نطبّق i18n
  const intlResponse = intlMiddleware(request);

  // 2. لو فيه redirect → نرجّعه على طول
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // 3. نحدّث Supabase session
  const supabaseResponse = await updateSession(request);

  // 4. ندمج cookies
  intlResponse.cookies.getAll().forEach((cookie) => {
    supabaseResponse.cookies.set(cookie.name, cookie.value);
  });

  // 5. ندمج headers
  intlResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value);
  });

  // ✅ 6. نضيف x-pathname — مفيد للـ fallback في request.ts
  supabaseResponse.headers.set("x-pathname", request.nextUrl.pathname);

  return supabaseResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|auth|.*\\..*).*)",
};