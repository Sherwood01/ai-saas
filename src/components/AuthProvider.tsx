"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  remainingQuota: number;
  isUnlimited: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  remainingQuota: 0,
  isUnlimited: false,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

// 本地存储乐观预热键名
const STORAGE_KEY_AUTH = "saas_auth_user_preview";

/**
 * 全局认证与用户信息上下文提供器 (AuthProvider)
 * 1. 全局合并 /api/auth/me 请求，消除各组件分散请求的网络拥堵
 * 2. 具备 0 毫秒首屏乐观预热机制，彻底消除未登录闪烁与长时间转圈
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. 首屏乐观预热：瞬间从 localStorage 读取上次登录快照
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_AUTH);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.user) {
          setUser(parsed.user);
          setRemainingQuota(parsed.remaining || 0);
          setIsUnlimited(Boolean(parsed.isUnlimited));
          setLoading(false);
        }
      }
    } catch (_) {}
  }, []);

  // 2. 统一从服务端拉取最新真实数据
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setRemainingQuota(data.remaining || 0);
          setIsUnlimited(Boolean(data.isUnlimited));
          // 写入本地快照供下次瞬间预热
          localStorage.setItem(
            STORAGE_KEY_AUTH,
            JSON.stringify({
              user: data.user,
              remaining: data.remaining || 0,
              isUnlimited: Boolean(data.isUnlimited),
            })
          );
        } else {
          // 服务端返回未登录，清空本地状态
          setUser(null);
          localStorage.removeItem(STORAGE_KEY_AUTH);
        }
      } else {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // 网络故障时不盲目置空已有的乐观状态，仅结束 loading
    } finally {
      setLoading(false);
    }
  }, []);

  // 挂载时全局统一发起一次拉取
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // 3. 全局统一退出登录逻辑
  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } catch (err) {
      console.error("Sign-out network error:", err);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY_AUTH);
      // 强制整页替换跳转，彻底刷新客户端路由状态
      window.location.replace("/");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        remainingQuota,
        isUnlimited,
        loading,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

