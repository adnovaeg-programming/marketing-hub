import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. نحدّث session Supabase الأول
  const supabaseResponse = await updateSession(request);

  // 2. نطبّق i18n routing
  const intlResponse = intlMiddleware(request);

  // 3. ندمج الـ headers والـ cookies من intl للـ supabase response
  intlResponse.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value);
  });

  intlResponse.cookies.getAll().forEach((cookie) => {
    supabaseResponse.cookies.set(cookie.name, cookie.value);
  });

  return supabaseResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};