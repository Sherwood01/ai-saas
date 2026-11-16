import crypto from "crypto";

/**
 * Creem 支付平台 API 客户端封装
 */
export class CreemClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CREEM_API_KEY || "";
    // 根据 API Key 自适应选择沙箱环境或生产环境
    if (this.apiKey.toLowerCase().includes("test")) {
      this.baseUrl = "https://test-api.creem.io/v1";
    } else {
      this.baseUrl = "https://api.creem.io/v1";
    }
  }

  /**
   * 创建 Creem 托管收银台跳转 URL
   * @param productId Creem 对应的商品/计划 ID
   * @param userId 购买用户的 ID
   * @param planType 目标套餐 ('creator' | 'pro')
   * @param redirectUrl 支付成功后的重定向回显链接
   * @param userEmail 用户的邮箱地址 (预填收银台)
   */
  async createCheckout(params: {
    productId: string;
    userId: string;
    planType: string;
    redirectUrl?: string;
    userEmail?: string;
  }): Promise<string | null> {
    if (!this.apiKey) {
      console.error("[Creem] CREEM_API_KEY 未配置，无法发起支付请求");
      return null;
    }

    const url = `${this.baseUrl}/checkouts`;
    const payload: Record<string, any> = {
      product_id: params.productId,
      metadata: {
        user_id: params.userId,
        plan_type: params.planType,
      },
    };

    if (params.redirectUrl) {
      payload.success_url = params.redirectUrl;
    }

    if (params.userEmail) {
      payload.customer = {
        email: params.userEmail,
      };
    }

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`[Creem] 创建 Checkout 失败: ${resp.status} - ${errText}`);
        return null;
      }

      const data = await resp.json();
      return (
        data.checkout_url ||
        data.url ||
        data.data?.checkout_url ||
        data.data?.url ||
        null
      );
    } catch (err: any) {
      console.error("[Creem] 网络请求异常:", err.message);
      return null;
    }
  }

  /**
   * 校验 Creem Webhook 的 HMAC-SHA256 签名合法性
   * @param rawBody 原始请求字节流字符串
   * @param signature 请求头中的 creem-signature
   */
  static verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET || "";
    if (!signature || !webhookSecret) {
      return false;
    }

    try {
      const calculatedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(calculatedSignature),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }
}

export const creemClient = new CreemClient();

