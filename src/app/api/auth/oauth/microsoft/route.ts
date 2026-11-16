import { NextRequest, NextResponse } from "next/server";

/**
 * 发起 Microsoft Entra ID OAuth 授权请求
 * 用户在 Azure 注册的重定向 URI 为: http://localhost:3100/auth/callback/microsoft
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = `${baseUrl}/auth/callback/microsoft`;

  if (!clientId) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Microsoft+OAuth+is+not+configured`);
  }

  // 统一 common 端点，支持个人微软账户与工作/学校账户
  const msAuthUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
  msAuthUrl.searchParams.set("client_id", clientId);
  msAuthUrl.searchParams.set("response_type", "code");
  msAuthUrl.searchParams.set("redirect_uri", redirectUri);
  msAuthUrl.searchParams.set("response_mode", "query");
  msAuthUrl.searchParams.set("scope", "openid profile email User.Read");

  return NextResponse.redirect(msAuthUrl.toString());
}

