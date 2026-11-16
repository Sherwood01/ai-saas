import { NextRequest, NextResponse } from "next/server";
import { CreemClient } from "@/lib/creem";
import { updateUserSubscription, cancelUserSubscription, getUserByEmail } from "@/lib/db";
import { PlanType } from "@/lib/types";

/**
 * 接收并处理 Creem 支付平台 Webhook 异步回调
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("creem-signature") || req.headers.get("x-creem-signature");

    // 1. 签名安全性校验
    if (process.env.CREEM_WEBHOOK_SECRET) {
      const isValid = CreemClient.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.error("[Webhook Error] Creem Webhook 签名验证未通过");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // 规范：Creem 使用驼峰 eventType 与 object
    const eventType = payload.eventType || payload.event_type || payload.type || payload.event || "";
    const dataObj = payload.object || payload.data || {};
    const metadata = dataObj.metadata || payload.metadata || {};

    console.log(`[Creem Webhook] 收到事件: ${eventType}`);

    // 1. 优先从 metadata 中提取 userId
    let userId = metadata.user_id || dataObj.customer_id || dataObj.client_reference_id;
    let targetPlan = (metadata.plan_type as PlanType) || "pro";

    // 2. 双重保险：如果 metadata 没有 userId，通过 customer.email 查找用户
    const customerEmail = dataObj.customer?.email || dataObj.customer_email || metadata.user_email;
    if (!userId && customerEmail) {
      const foundUser = getUserByEmail(customerEmail);
      if (foundUser) {
        userId = foundUser.id;
        console.log(`[Creem Webhook] 通过客户邮箱 ${customerEmail} 成功反查到用户 ID: ${userId}`);
      }
    }

    // 如果仍然没有 userId，且是控制台发送的无元数据测试事件，做友好应答
    if (!userId) {
      console.warn("[Creem Webhook] 收到测试或无元数据事件，忽略业务更新:", eventType);
      return NextResponse.json({ received: true, status: "ignored_no_user", event: eventType });
    }

    const subscriptionId = dataObj.subscription_id || dataObj.id || "sub_creem_active";

    // 3. 支付成功/订阅激活事件 (兼容大小写与多种格式)
    const lowerEvent = eventType.toLowerCase();
    if (
      lowerEvent.includes("checkout.completed") ||
      lowerEvent.includes("subscription.paid") ||
      lowerEvent.includes("subscription.created") ||
      lowerEvent.includes("subscription.active") ||
      lowerEvent.includes("subscription.updated") ||
      lowerEvent.includes("order.completed") ||
      lowerEvent.includes("invoice.paid")
    ) {
      // 提取账期结束时间
      const endsAtStr = dataObj.ends_at || dataObj.expires_at || dataObj.current_period_end;
      const periodEnd = endsAtStr ? new Date(endsAtStr).toISOString() : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

      updateUserSubscription(userId, targetPlan, subscriptionId, periodEnd);
      console.log(`[Creem Webhook] 用户 ${userId} 成功激活/升级为套餐: ${targetPlan}`);
    } 
    // 4. 订阅取消/逾期/失效事件
    else if (
      lowerEvent.includes("subscription.canceled") ||
      lowerEvent.includes("subscription.cancelled") ||
      lowerEvent.includes("subscription.expired") ||
      lowerEvent.includes("subscription.past_due") ||
      lowerEvent.includes("subscription.payment_failed")
    ) {
      cancelUserSubscription(userId);
      console.log(`[Creem Webhook] 用户 ${userId} 订阅已取消/失效，已降级为免费套餐`);
    }

    return NextResponse.json({ received: true, event: eventType, updatedUser: userId, plan: targetPlan });
  } catch (err: any) {
    console.error("[Webhook Exception]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
