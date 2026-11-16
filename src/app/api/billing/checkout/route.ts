import { NextRequest, NextResponse } from "next/server";
import { creemClient } from "@/lib/creem";
import { getOrCreateDefaultUser, PRICING_PLANS } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

/**
 * 创建 Creem 支付收银台会话链接
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planType, redirectUrl } = body;

    if (!planType || (planType !== "pro" && planType !== "ultra" && planType !== "studio")) {
      return NextResponse.json(
        { error: "Invalid planType. Must be 'pro', 'ultra', or 'studio'." },
        { status: 400 }
      );
    }

    const plan = PRICING_PLANS.find((p) => p.id === planType);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    // 获取当前用户（必须已登录）
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to subscribe.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // 默认回跳地址
    const host = req.headers.get("host") || "localhost:3100";
    const protocol = host.includes("localhost") ? "http" : "https";
    const defaultSuccessUrl = `${protocol}://${host}/billing?success=true`;

    const checkoutUrl = await creemClient.createCheckout({
      productId: plan.productId,
      userId: user.id,
      planType: plan.id,
      userEmail: user.email,
      redirectUrl: redirectUrl || defaultSuccessUrl,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error: "Failed to generate Creem checkout URL. Please check API key.",
          mockCheckoutUrl: `/billing?mock_upgraded=${planType}`, // 测试沙箱环境降级
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err: any) {
    console.error("[API Checkout Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
