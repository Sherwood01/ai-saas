import { NextRequest, NextResponse } from "next/server";

/**
 * 发起 GitHub OAuth 授权请求
 * 用户在 GitHub App 注册的 Callback URL 为: http://localhost:3100/auth/callback/github
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${baseUrl}/auth/callback/github`;

  if (!clientId) {
    return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=GitHub+OAuth+is+not+configured`);
  }

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");

  return NextResponse.redirect(githubAuthUrl.toString());
}

