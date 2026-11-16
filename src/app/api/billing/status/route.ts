import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultUser, updateUserSubscription } from "@/lib/db";
import { PlanType } from "@/lib/types";
import { getSessionUser } from "@/lib/auth";

/**
 * 获取当前登录用户的订阅状态与配额数据
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mockUpgrade = searchParams.get("mock_upgraded") as PlanType | null;

    const sessionUser = await getSessionUser();
    let user = sessionUser || getOrCreateDefaultUser();

    // 便捷测试模式：如果带了 mock_upgraded 参数，直接在本地升级该用户
    if (mockUpgrade && (mockUpgrade === "pro" || mockUpgrade === "ultra" || mockUpgrade === "studio")) {
      user = updateUserSubscription(user.id, mockUpgrade);
    }

    const isUnlimited = user.planType === "studio" || user.monthlyUsageLimit >= 999999;
    const remaining = isUnlimited ? 999999 : Math.max(0, user.monthlyUsageLimit - user.monthlyUsageCount);

    return NextResponse.json({
      user,
      remaining,
      isUnlimited,
      usagePercent: isUnlimited ? 100 : Math.min(100, Math.round((user.monthlyUsageCount / user.monthlyUsageLimit) * 100)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

