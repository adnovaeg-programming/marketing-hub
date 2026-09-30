import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. نحدّث Supabase session
  const supabaseResponse = await updateSession(request);

  // 2. نطبّق i18n middleware
  const intlResponse = intlMiddleware(request);

  // 3. لو i18n بيعمل redirect/rewrite → نرجّع الـ intlResponse
  //    (مع نسخ cookies الـ Supabase)
  const isRedirect = intlResponse.headers.has("location");
  const isRewrite = intlResponse.headers.has("x-middleware-rewrite");

  if (isRedirect || isRewrite) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
  }

  // 4. ندمج headers الـ i18n مع الـ Supabase response
  intlResponse.headers.forEach((value, key) => {
    if (!supabaseResponse.headers.has(key)) {
      supabaseResponse.headers.set(key, value);
    }
  });

  return supabaseResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|auth|.*\\..*).*)",
};