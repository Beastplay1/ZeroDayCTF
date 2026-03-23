import { NextRequest, NextResponse } from "next/server";
import {
  parseAdminSessionToken,
  getAdminSessionCookieName,
} from "@/lib/auth/adminSession";

const ADMIN_HOSTNAMES = ["admin.localhost", "admin.zerodayctf.com"];

function isAdminHost(hostname: string): boolean {
  // strip port
  const host = hostname.split(":")[0];
  return ADMIN_HOSTNAMES.includes(host);
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (!isAdminHost(hostname)) {
    // Not admin subdomain — pass through normally
    return NextResponse.next();
  }

  // Tag all admin-subdomain requests with a header so server components
  // can detect admin context without relying on window.location (client-only)
  const adminHeaders = new Headers(request.headers);
  adminHeaders.set("x-is-admin", "1");

  // API routes: pass through without rewriting (they're already at the correct path)
  if (pathname.startsWith("/api/")) {
    // Only block non-admin API routes on admin subdomain
    if (!pathname.startsWith("/api/admin/")) {
      return NextResponse.redirect(new URL("/login", request.url), 302);
    }
    // Verify session for all admin API routes except login/logout
    const isPublicApi =
      pathname === "/api/admin/login" || pathname === "/api/admin/logout";
    if (!isPublicApi) {
      const token = request.cookies.get(getAdminSessionCookieName())?.value;
      const session = await parseAdminSessionToken(token);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return NextResponse.next({ request: { headers: adminHeaders } });
  }

  // Rewrite admin subdomain paths to /admin/* internally
  // admin.localhost/         → /admin
  // admin.localhost/login    → /admin/login
  // admin.localhost/anything → /admin/anything
  const rewrittenPath = pathname === "/" ? "/admin" : `/admin${pathname}`;

  // Allow login page through without auth check
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return NextResponse.rewrite(new URL(rewrittenPath, request.url), {
      request: { headers: adminHeaders },
    });
  }

  // All other admin routes: verify admin session cookie
  const token = request.cookies.get(getAdminSessionCookieName())?.value;
  const session = await parseAdminSessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url), 302);
  }

  return NextResponse.rewrite(new URL(rewrittenPath, request.url), {
    request: { headers: adminHeaders },
  });
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
