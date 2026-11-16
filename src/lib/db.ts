import fs from "fs";
import path from "path";
import { UserProfile, VideoItem, PricingPlan, PlanType } from "./types";
import { PipelineType } from "./worker-types";

// 持久化存储文件路径，存放在项目根目录 data/saas_db.json
const DB_FILE_PATH = path.join(process.cwd(), "data", "saas_db.json");

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  videos: Record<string, VideoItem>;
}

// 默认定价矩阵
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Trial",
    priceMonthly: 0,
    productId: "free_plan",
    limits: 5,
    features: [
      "5 vocabulary videos / month",
      "720p resolution rendering",
      "Standard generation queue",
      "Watermark included",
      "Basic AI voice models",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    productId: process.env.CREEM_PRODUCT_PRO || "prod_pro_test",
    limits: 30,
    features: [
      "30 vocabulary videos / month",
      "1080p Full HD 60fps",
      "Priority fast render queue",
      "No watermarks",
      "HD Multi-lingual Neural Voices",
      "Custom cover & word timings",
    ],
    isPopular: true,
  },
  {
    id: "ultra",
    name: "Ultra",
    priceMonthly: 49,
    productId: process.env.CREEM_PRODUCT_ULTRA || "prod_ultra_test",
    limits: 100,
    features: [
      "100 vocabulary videos / month",
      "Ultra-fast parallel render queue",
      "HD Neural Voice customization",
      "Full Commercial Publishing License",
      "SRT Subtitles export",
      "Priority Creator Support",
    ],
  },
  {
    id: "studio",
    name: "Studio / Team",
    priceMonthly: 199,
    productId: process.env.CREEM_PRODUCT_STUDIO || "prod_studio_test",
    limits: 999999, // 无限额度
    features: [
      "Unlimited vocabulary videos / month",
      "Batch vocabulary input (CSV)",
      "Dedicated high-speed render workers",
      "Full Commercial & Resell License",
      "Custom Brand Watermark & Outro",
      "24/7 VIP Dedicated Support",
    ],
  },
];

/**
 * 读取本地持久化数据库
 */
function readDb(): DatabaseSchema {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial: DatabaseSchema = { users: {}, videos: {} };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(content || '{"users":{}, "videos":{}}');
  } catch (err) {
    console.error("[DB Error] Failed to read database:", err);
    return { users: {}, videos: {} };
  }
}

/**
 * 写入持久化数据库
 */
function writeDb(data: DatabaseSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[DB Error] Failed to write database:", err);
  }
}

/**
 * 根据用户 ID 查询用户
 */
export function getUserById(userId: string): UserProfile | null {
  const db = readDb();
  return db.users[userId] || null;
}

/**
 * 根据邮箱查询用户 (不区分大小写)
 */
export function getUserByEmail(email: string): UserProfile | null {
  const db = readDb();
  const normalized = email.trim().toLowerCase();
  return Object.values(db.users).find((u) => u.email.toLowerCase() === normalized) || null;
}

/**
 * 创建并持久化新用户，默认开通 5 条免费体验额度
 */
export function createUser(
  email: string,
  passwordHash: string,
  displayName?: string
): UserProfile {
  const db = readDb();
  const normalized = email.trim().toLowerCase();
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newUser: UserProfile = {
    id: userId,
    email: normalized,
    displayName: displayName?.trim() || normalized.split("@")[0] || "Creator",
    passwordHash,
    planType: "free",
    subscriptionStatus: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    monthlyUsageCount: 0,
    monthlyUsageLimit: 5, // 注册即赠送 5 条体验额度
    createdAt: new Date().toISOString(),
  };

  db.users[userId] = newUser;
  writeDb(db);
  return newUser;
}

/**
 * 获取或初始化默认演示用户（兼容旧调用）
 */
export function getOrCreateDefaultUser(userId = "default_user", email = "user@example.com"): UserProfile {
  const db = readDb();
  if (db.users[userId]) {
    return db.users[userId];
  }

  const newUser: UserProfile = {
    id: userId,
    email: email,
    displayName: "English Creator",
    planType: "free",
    subscriptionStatus: "active",
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    monthlyUsageCount: 0,
    monthlyUsageLimit: 5,
    createdAt: new Date().toISOString(),
  };

  db.users[userId] = newUser;
  writeDb(db);
  return newUser;
}

/**
 * 检查并消耗用户配额
 * @returns { allowed: boolean, user: UserProfile, remaining: number }
 */
/**
 * 校验并扣除用户算力额度 (支持不同 AI 工具动态 Credits 消耗)
 * @param userId 用户 ID
 * @param cost 扣除的额度点数 (默认 1)
 */
export function checkAndConsumeQuota(
  userId: string,
  cost: number = 1
): {
  allowed: boolean;
  user: UserProfile;
  remaining: number;
} {
  const db = readDb();
  let user = db.users[userId] || getOrCreateDefaultUser(userId);

  const isUnlimited = user.planType === "studio" || user.monthlyUsageLimit >= 999999;

  if (!isUnlimited && user.monthlyUsageCount + cost > user.monthlyUsageLimit) {
    return {
      allowed: false,
      user,
      remaining: Math.max(0, user.monthlyUsageLimit - user.monthlyUsageCount),
    };
  }

  // 扣减配额
  user.monthlyUsageCount += cost;
  db.users[userId] = user;
  writeDb(db);

  const remaining = isUnlimited ? 999999 : Math.max(0, user.monthlyUsageLimit - user.monthlyUsageCount);
  return { allowed: true, user, remaining };
}

/**
 * 更新用户订阅套餐 (由 Webhook 或支付成功回调触发)
 */
export function updateUserSubscription(
  userId: string,
  planType: PlanType,
  subscriptionId?: string,
  periodEnd?: string
): UserProfile {
  const db = readDb();
  let user = db.users[userId] || getOrCreateDefaultUser(userId);

  const plan = PRICING_PLANS.find((p) => p.id === planType) || PRICING_PLANS[0];

  user.planType = planType;
  user.monthlyUsageLimit = plan.limits;
  user.monthlyUsageCount = 0; // 升级套餐时重置当月已用额度
  user.subscriptionStatus = "active";
  if (subscriptionId) user.subscriptionId = subscriptionId;
  if (periodEnd) user.currentPeriodEnd = periodEnd;

  db.users[userId] = user;
  writeDb(db);
  return user;
}

/**
 * 取消用户订阅或降级到免费版
 */
export function cancelUserSubscription(userId: string): UserProfile {
  const db = readDb();
  let user = db.users[userId] || getOrCreateDefaultUser(userId);

  user.subscriptionStatus = "canceled";
  // 账期结束后降级为 free 套餐
  user.planType = "free";
  user.monthlyUsageLimit = 5;

  db.users[userId] = user;
  writeDb(db);
  return user;
}


// 统一视频存储有效周期常量：30 天 (与 30 天月度订阅账期对齐)
const DEFAULT_RETENTION_DAYS = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const RETENTION_DURATION_MS = DEFAULT_RETENTION_DAYS * MILLISECONDS_PER_DAY;

/**
 * 计算视频的保留到期时间
 * 全量视频统一遵循 30 天保留周期（与月度账期对齐）
 * @param baseTime 基准时间戳或时间字符串，默认为当前时间
 * @returns ISO 格式的到期时间字符串
 */
export function calculateVideoExpiration(baseTime?: number | string): string {
  const baseTimestamp = baseTime ? new Date(baseTime).getTime() : Date.now();
  return new Date(baseTimestamp + RETENTION_DURATION_MS).toISOString();
}

/**
 * 记录新的视频生成任务
 */
export function recordVideoTask(
  taskId: string,
  userId: string,
  word: string,
  pipelineType: PipelineType = "vocab-shorts"
): VideoItem {
  const db = readDb();
  const createdAt = new Date().toISOString();
  const item: VideoItem = {
    id: taskId,
    userId,
    word,
    pipelineType,
    status: "queued",
    progress: 5,
    createdAt,
    expiresAt: calculateVideoExpiration(createdAt),
  };

  db.videos[taskId] = item;
  writeDb(db);
  return item;
}

/**
 * 更新视频任务状态与结果
 */
export function updateVideoTaskStatus(
  taskId: string,
  updates: Partial<VideoItem>
): VideoItem | null {
  const db = readDb();
  if (!db.videos[taskId]) return null;

  db.videos[taskId] = {
    ...db.videos[taskId],
    ...updates,
  };

  writeDb(db);
  return db.videos[taskId];
}

/**
 * 获取指定用户的所有视频列表
 */
export function getUserVideos(userId: string): VideoItem[] {
  const db = readDb();
  return Object.values(db.videos)
    .filter((v) => v.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

