import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const isUnlimited = user.planType === "studio" || user.monthlyUsageLimit >= 999999;
    const remaining = isUnlimited ? 999999 : Math.max(0, user.monthlyUsageLimit - user.monthlyUsageCount);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        planType: user.planType,
        subscriptionStatus: user.subscriptionStatus,
        monthlyUsageCount: user.monthlyUsageCount,
        monthlyUsageLimit: user.monthlyUsageLimit,
        currentPeriodEnd: user.currentPeriodEnd,
      },
      remaining,
      isUnlimited,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

