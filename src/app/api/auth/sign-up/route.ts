import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 检查邮箱是否重复
    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 密码加盐哈希
    const passHash = hashPassword(password);
    const user = createUser(email, passHash, displayName);

    // 签发 Session Cookie
    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! 5 free video credits have been added.",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        planType: user.planType,
        monthlyUsageCount: user.monthlyUsageCount,
        monthlyUsageLimit: user.monthlyUsageLimit,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 14 * 24 * 3600, // 14 天
    });

    return response;
  } catch (err: any) {
    console.error("[Sign-Up Error]", err);
    return NextResponse.json({ error: err.message || "Failed to create account." }, { status: 500 });
  }
}

