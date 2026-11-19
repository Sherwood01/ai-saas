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

  // 兼容 Cloudflare Tunnel / 反向代理环境的主机头与协议，避免重定向回内部 localhost
  const forwardedHost = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const forwardedProto = req.headers.get("x-forwarded-proto") || (req.url.startsWith("https") ? "https" : "http");
  const getRedirectUrl = (targetPath: string) => {
    if (forwardedHost) {
      return new URL(targetPath, `${forwardedProto}://${forwardedHost}`);
    }
    return new URL(targetPath, req.url);
  };

  // 1. 保护私有路由：/dashboard、/billing、/library 与 /tools
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/tools");

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const signInUrl = getRedirectUrl("/auth/sign-in");
      // 携带来源参数，登录成功后自动回跳
      signInUrl.searchParams.set("redirect", pathname);
      const redirectRes = NextResponse.redirect(signInUrl);
      // 严禁 Cloudflare 与浏览器缓存重定向响应
      redirectRes.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
      return redirectRes;
    }

    // 已登录访问受保护页面，强制禁用 CDN 与浏览器缓存，防止退出后回退命中缓存
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    return res;
  }

  // 2. 如果已登录，访问 /auth/sign-in 或 /auth/sign-up 时，自动重定向到 /dashboard
  const isAuthRoute = pathname === "/auth/sign-in" || pathname === "/auth/sign-up";
  if (isAuthRoute && isAuthenticated) {
    const dashRes = NextResponse.redirect(getRedirectUrl("/dashboard"));
    dashRes.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
    return dashRes;
  }

  return NextResponse.next();
}

/**
 * 配置需要中间件拦截的路由匹配器
 */
export const config = {
  matcher: ["/dashboard/:path*", "/billing/:path*", "/library/:path*", "/tools/:path*", "/auth/:path*"],
};

