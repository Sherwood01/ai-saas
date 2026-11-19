"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  Film, 
  Video, 
  Mic, 
  CreditCard, 
  Zap, 
  Crown, 
  ChevronRight,
  Layers
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";

interface SidebarProps {
  onCloseMobile?: () => void;
}

/**
 * AI-SaaS 统一工作台侧边栏组件 (Palantir Prussian Navy & Slate 风格)
 * 采用模块化分组结构：Overview / AI Studios / Settings & Billing
 */
export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const { user, remainingQuota, isUnlimited } = useAuth();

  const navItemClass = (isActive: boolean) =>
    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
      isActive
        ? "bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] font-bold"
        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
    }`;

  // 计算 Credits 消耗百分比
  const usagePercentage = user && user.monthlyUsageLimit > 0 && !isUnlimited
    ? Math.min(100, Math.round((user.monthlyUsageCount / user.monthlyUsageLimit) * 100))
    : 0;

  return (
    <aside className="w-64 h-full bg-white dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 select-none transition-colors">
      {/* ── Top Navigation Links ── */}
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Workspace Brand Badge */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-[#1e3a8a] dark:bg-[#1e40af] text-white flex items-center justify-center font-bold text-xs">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">
              Omni Studio
            </span>
          </div>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            v2.0
          </span>
        </div>

        {/* 1. General Overview Group */}
        <div>
          <h4 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {locale === "zh" ? "核心概览" : "Overview"}
          </h4>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className={navItemClass(pathname === "/dashboard")}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>{t.navDashboard}</span>
              </div>
            </Link>

            <Link
              href="/library"
              onClick={onCloseMobile}
              className={navItemClass(pathname === "/library")}
            >
              <div className="flex items-center gap-2.5">
                <Film className="h-4 w-4" />
                <span>{t.navLibrary}</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* 2. AI Studios Tools Group */}
        <div>
          <h4 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {locale === "zh" ? "AI 创作工坊" : "AI Studios"}
          </h4>
          <nav className="space-y-1">
            {/* Tool 1: Vocabulary Shorts (Active) */}
            <Link
              href="/tools/vocab-shorts"
              onClick={onCloseMobile}
              className={navItemClass(pathname.startsWith("/tools/vocab-shorts"))}
            >
              <div className="flex items-center gap-2.5">
                <Film className="h-4 w-4" />
                <span>{t.toolsVocabShorts}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 uppercase">
                {locale === "zh" ? "已就绪" : "Ready"}
              </span>
            </Link>

            {/* Tool 2: IP Doodle Video (Active) */}
            <Link
              href="/tools/ip-explainer"
              onClick={onCloseMobile}
              className={navItemClass(pathname.startsWith("/tools/ip-explainer"))}
            >
              <div className="flex items-center gap-2.5">
                <Video className="h-4 w-4 text-amber-500" />
                <span>{t.toolsIpExplainer}</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 uppercase">
                {locale === "zh" ? "已就绪" : "Active"}
              </span>
            </Link>

            {/* Tool 3: Neural Voiceover */}
            <Link
              href="/tools/voiceover"
              onClick={onCloseMobile}
              className={navItemClass(pathname.startsWith("/tools/voiceover"))}
            >
              <div className="flex items-center gap-2.5">
                <Mic className="h-4 w-4 text-slate-400" />
                <span>{locale === "zh" ? "AI 配音工作室" : "Neural Voiceover"}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase">
                {locale === "zh" ? "即将上线" : "Soon"}
              </span>
            </Link>
          </nav>
        </div>

        {/* 3. Account & Billing Group */}
        <div>
          <h4 className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {locale === "zh" ? "设置与订阅" : "Settings & Billing"}
          </h4>
          <nav className="space-y-1">
            <Link
              href="/billing"
              onClick={onCloseMobile}
              className={navItemClass(pathname === "/billing")}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span>{t.navBilling}</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Bottom Credits & Account Card ── */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070b14]">
        {user ? (
          <div className="p-3.5 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                {user.planType === "studio" ? (
                  <Crown className="h-4 w-4 text-amber-500" />
                ) : (
                  <Zap className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
                )}
                <span className="capitalize">{user.planType} Tier</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                {isUnlimited ? t.unlimited : `${remainingQuota} ${locale === "zh" ? "次生成额度" : "Credits"}`}
              </span>
            </div>

            {/* Credits Usage Progress Bar */}
            {!isUnlimited && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2.5 overflow-hidden">
                <div
                  className="bg-[#1e3a8a] dark:bg-[#3b82f6] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}

            <Link
              href="/billing"
              onClick={onCloseMobile}
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-[#93c5fd] py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <span>{locale === "zh" ? "管理订阅计划" : "Manage Subscription"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-2 text-center text-xs text-slate-400">
            <span>Loading profile...</span>
          </div>
        )}
      </div>
    </aside>
  );
}
