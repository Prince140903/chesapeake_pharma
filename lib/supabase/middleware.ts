import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Supabase credentials not set; allow demo mode preview
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options
        });
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        response.cookies.set({
          name,
          value,
          ...options
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: "",
          ...options
        });
        response = NextResponse.next({
          request: {
            headers: request.headers
          }
        });
        response.cookies.set({
          name,
          value: "",
          ...options
        });
      }
    }
  });

  // getUser() safely authenticates against Supabase Auth servers
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Skip middleware check for the unauthorized page itself
  if (pathname === "/admin/unauthorized") {
    return response;
  }

  // 1. If accessing nested admin routes (/admin/drugs, /admin/users, /admin/subscriptions, /admin/imports)
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // Role check against public.profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" || profile?.approval_status !== "approved") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // 2. If accessing /admin root
  if (pathname === "/admin" && user) {
    // If logged in, verify role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, approval_status")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
