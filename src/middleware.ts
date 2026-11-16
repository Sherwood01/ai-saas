import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "vocabvids_session";

/**
 * Next.js 路由守卫中间件 (Route Guard)
 * 保护私有页面：未登录访问 /dashboard 或 /billing 时，强制重定向至 /auth/sign-in
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(sessionToken);

  // 1. 保护私有路由：/dashboard、/billing、/library 与 /tools
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/tools");

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", req.url);
    // 携带来源参数，登录成功后自动回跳
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 2. 如果已登录，访问 /auth/sign-in 或 /auth/sign-up 时，自动重定向到 /dashboard
  const isAuthRoute = pathname === "/auth/sign-in" || pathname === "/auth/sign-up";
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

/**
 * 配置需要中间件拦截的路由匹配器
 */
export const config = {
  matcher: ["/dashboard/:path*", "/billing/:path*", "/library/:path*", "/tools/:path*", "/auth/:path*"],
};

