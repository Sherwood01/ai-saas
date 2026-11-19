import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * 用户退出登录 API
 * 彻底清除 Session Cookie，严格适配 Cloudflare Tunnel 与 HTTPS 代理环境
 * @param req Next.js 请求对象，用于解析反向代理协议头
 */
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Signed out successfully." });

  // 智能识别是否处于 HTTPS 环境 (兼容 Cloudflare Tunnel 与反向代理)
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    process.env.NODE_ENV === "production";

  // 设置清空 Cookie (属性与 sign-in 保持严格一致，确保现代浏览器在 HTTPS 下不拒删)
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

