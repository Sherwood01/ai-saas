import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Microsoft Entra ID (Azure) OAuth 回调路由
 * 对应用户在 Azure 注册的 Redirect URI: http://localhost:3100/auth/callback/microsoft
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const redirectUri = `${baseUrl}/auth/callback/microsoft`;

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=${encodeURIComponent(errorDesc || error || "Microsoft authentication failed")}`);
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Microsoft+OAuth+not+configured`);
  }

  try {
    // 1. 换取 Access Token
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      console.error("[Microsoft OAuth Error] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=${encodeURIComponent(tokenData.error_description || "Microsoft token exchange failed")}`);
    }

    const accessToken = tokenData.access_token;

    // 2. 调用 Microsoft Graph 获取当前用户信息
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      console.error("[Microsoft OAuth Error] Failed to fetch user profile");
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Failed+to+fetch+Microsoft+profile`);
    }

    const msUser = await userRes.json();
    // 微软账号 email 可能在 mail 或 userPrincipalName 中
    const email = msUser.mail || msUser.userPrincipalName;
    const name = msUser.displayName || msUser.givenName || email?.split("@")[0] || "Microsoft User";

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=No+email+associated+with+Microsoft+account`);
    }

    // 3. 查找或创建用户
    let user = getUserByEmail(email);
    if (!user) {
      user = createUser(email, "oauth_microsoft", name);
    }

    // 4. 签发登录 Session Cookie 并跳转至 Dashboard
    const sessionToken = createSessionToken(user);
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 3600,
    });

    return response;
  } catch (err: any) {
    console.error("[Microsoft OAuth Exception]:", err);
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=An+unexpected+OAuth+error+occurred`);
  }
}

