import { PipelineType } from "./worker-types";

/**
 * 订阅套餐类型
 */
export type PlanType = "free" | "pro" | "ultra" | "studio";

/**
 * 用户及订阅信息模型
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  passwordHash?: string;
  planType: PlanType;
  subscriptionId?: string | null;
  subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing" | null;
  currentPeriodEnd?: string | null;
  monthlyUsageCount: number; // 本月已生成次数
  monthlyUsageLimit: number; // 本月最大可用额度 (free: 5, creator: 60, pro: 200)
  createdAt: string;
}

/**
 * 视频与多媒体生成任务模型
 */
export interface VideoItem {
  id: string;
  userId: string;
  word: string;
  pipelineType?: PipelineType; // 对应产出该资产的 AI 工具服务
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  stage?: string;
  progress: number;
  videoUrl?: string | null;
  playUrl?: string | null;
  downloadUrl?: string | null;
  draftJsonUrl?: string | null;
  error?: string | null;
  createdAt: string;
  completedAt?: string | null;
  expiresAt?: string | null; // 视频过期自动清理时间戳 (null 表示永久保存)
  fileSize?: string | null; // 视频物理文件大小，如 "7.9 MB"
  resolution?: string | null; // 视频分辨率与比例，如 "1080p (9:16)"
}

/**
 * 套餐定价规则定义
 */
export interface PricingPlan {
  id: PlanType;
  name: string;
  priceMonthly: number;
  productId: string; // Creem 对应的 Product ID
  limits: number;
  features: string[];
  isPopular?: boolean;
}

