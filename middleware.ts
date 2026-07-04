import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isRecoverableAuthSessionError, isSupabaseAuthCookieName } from "@/lib/supabase/auth-errors";
import type { Database } from "@/lib/supabase/database.types";

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter(({ name }) => isSupabaseAuthCookieName(name))
    .forEach(({ name }) => {
      request.cookies.delete(name);
      response.cookies.set(name, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
      });
    });
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const hasSupabaseAuthCookie = request.cookies.getAll().some(({ name }) => isSupabaseAuthCookieName(name));

  if (!hasSupabaseAuthCookie) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { error } = await supabase.auth.getUser();

  if (isRecoverableAuthSessionError(error)) {
    const cleanResponse = request.method === "GET" ? NextResponse.redirect(request.nextUrl) : response;
    clearSupabaseAuthCookies(request, cleanResponse);
    return cleanResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
