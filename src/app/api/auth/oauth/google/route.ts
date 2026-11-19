import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Google OAuth 登录入口与回调统一处理
 * 用户注册的回调地址为: http://localhost:3100/api/auth/oauth/google
 * 1. 无 code 参数时：重定向到 Google 授权页面
 * 2. 携带 code 参数时：向 Google 交换 access_token 并获取用户信息，登录/注册后跳转到 /dashboard
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const redirectUri = `${baseUrl}/api/auth/oauth/google`;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Google+OAuth+is+not+configured`);
  }

  // 1. 如果用户未授权或 Google 返回错误
  if (error) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=${encodeURIComponent(error)}`);
  }

  // 2. 如果没有 code，则是发起 OAuth 请求，跳转至 Google
  if (!code) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 3. 携带 code，换取 Token
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[Google OAuth Error] Token exchange failed:", errText);
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Google+authentication+failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 4. 获取 Google 用户资料
    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      console.error("[Google OAuth Error] Failed to fetch userinfo");
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Failed+to+fetch+user+profile`);
    }

    const profile = await userinfoRes.json();
    const email = profile.email;
    const name = profile.name || profile.given_name || email.split("@")[0];

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=No+email+associated+with+Google+account`);
    }

    // 5. 查找或创建用户
    let user = getUserByEmail(email);
    if (!user) {
      user = createUser(email, "oauth_google", name);
    }

    // 6. 签发登录 Session Cookie 并跳转至 Dashboard
    const sessionToken = createSessionToken(user);
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    const isHttps = req.headers.get("x-forwarded-proto") === "https" || process.env.NODE_ENV === "production";
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 3600,
    });

    return response;
  } catch (err: any) {
    console.error("[Google OAuth Exception]:", err);
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=An+unexpected+OAuth+error+occurred`);
  }
}

