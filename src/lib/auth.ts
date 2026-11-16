import crypto from "crypto";
import { cookies } from "next/headers";
import { UserProfile } from "./types";
import { getUserById, getUserByEmail } from "./db";

// Session 签名安全密钥，生产环境应在环境变量中配置
const AUTH_SECRET = process.env.AUTH_SECRET || "vocabvids-super-secure-auth-secret-key-2026";
export const SESSION_COOKIE_NAME = "vocabvids_session";

/**
 * 使用 Node 原生 crypto 进行密码加盐哈希 (PBKDF2)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * 校验用户输入的密码与数据库中加盐哈希是否匹配
 */
export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, originalHash] = combinedHash.split(":");
    if (!salt || !originalHash) return false;
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(originalHash));
  } catch {
    return false;
  }
}

/**
 * 创建轻量安全 Session 令牌 (Base64Payload.Signature)
 */
export function createSessionToken(user: UserProfile): string {
  const payload = {
    userId: user.id,
    email: user.email,
    planType: user.planType,
    exp: Date.now() + 14 * 24 * 3600 * 1000, // 14 天有效期
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * 验证 Session 令牌合法性并提取 User
 */
export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    // 校验签名防篡改
    const expectedSig = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadB64)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

    // 检查过期时间
    if (Date.now() > payload.exp) {
      return null;
    }

    const user = getUserById(payload.userId);
    return user || null;
  } catch {
    return null;
  }
}

