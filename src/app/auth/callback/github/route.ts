import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * GitHub OAuth 回调路由
 * 对应用户在 GitHub App 配置的 Callback: http://localhost:3100/auth/callback/github
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=${encodeURIComponent(error || "GitHub authorization failed")}`);
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=GitHub+OAuth+not+configured`);
  }

  try {
    // 1. 换取 Access Token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      console.error("[GitHub OAuth Error] Token exchange failed:", tokenData);
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=${encodeURIComponent(tokenData.error_description || "GitHub authentication failed")}`);
    }

    const accessToken = tokenData.access_token;

    // 2. 获取用户资料
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "VocabVids-App",
      },
    });

    if (!userRes.ok) {
      console.error("[GitHub OAuth Error] Failed to fetch user profile");
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=Failed+to+fetch+GitHub+profile`);
    }

    const userProfile = await userRes.json();
    let email = userProfile.email;

    // 如果 GitHub 个人资料中 email 是私有的，通过 /user/emails 接口获取主邮箱
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "VocabVids-App",
        },
      });

      if (emailsRes.ok) {
        const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    // 如果仍无邮箱，使用 github 唯一登录名构造虚拟唯一标识
    if (!email) {
      email = `${userProfile.login}@users.noreply.github.com`;
    }

    const name = userProfile.name || userProfile.login || email.split("@")[0];

    // 3. 查找或创建用户
    let user = getUserByEmail(email);
    if (!user) {
      user = createUser(email, "oauth_github", name);
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
    console.error("[GitHub OAuth Exception]:", err);
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=An+unexpected+OAuth+error+occurred`);
  }
}

