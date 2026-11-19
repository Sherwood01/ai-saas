"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "zh" | "en";

export interface Translations {
  // 顶部与全局通用
  brand: string;
  tagline: string;
  themeToggle: string;
  langToggle: string;
  signIn: string;
  signUp: string;
  signOut: string;
  upgrade: string;
  unlimited: string;
  usageQuota: string;
  monthlyUsage: string;
  loading: string;
  confirm: string;
  cancel: string;
  delete: string;
  close: string;

  // 导航项
  navDashboard: string;
  navLibrary: string;
  navTools: string;
  navBilling: string;

  // 侧边栏工具套件
  toolsVocabShorts: string;
  toolsVocabDesc: string;
  toolsIpExplainer: string;
  toolsIpDesc: string;
  toolsStoryAdventure: string;
  toolsStoryDesc: string;
  toolsVoiceover: string;
  toolsVoiceoverDesc: string;

  // 首页与仪表盘
  dashWelcome: string;
  dashSubtitle: string;
  dashQuickCreate: string;
  dashTotalVideos: string;
  dashActivePlan: string;
  dashRecentVideos: string;
  dashViewAll: string;
  dashNoVideos: string;

  // 生成工具界面
  genInputWordLabel: string;
  genInputWordPlaceholder: string;
  genInputIpLabel: string;
  genInputIpPlaceholder: string;
  genBtnGenerate: string;
  genBtnGenerating: string;
  genStatusGenerating: string;
  genCurrentStage: string;
  genConsoleTitle: string;
  genWatchVideo: string;
  genDownloadMp4: string;
  genOpenInLibrary: string;
  genNewVideo: string;
  genQuotaWarning: string;

  // 资产库页面
  libTitle: string;
  libSubtitle: string;
  libFilterAll: string;
  libSearchPlaceholder: string;
  libColWord: string;
  libColType: string;
  libColStatus: string;
  libColSize: string;
  libColDate: string;
  libColActions: string;
  libEmpty: string;
  libDeleteConfirmTitle: string;
  libDeleteConfirmDesc: string;
  libDeletePurgeNotice: string;
  libDeletePurge1: string;
  libDeletePurge2: string;
  libDeletePurge3: string;
  libDeletePurge4: string;
  libDeleteCannotUndo: string;
  libDeletePurging: string;
  libDeleteSuccess: string;
}

const translations: Record<Locale, Translations> = {
  zh: {
    brand: "SaaS AI 智能创作",
    tagline: "全自动短视频与多媒体生成中心",
    themeToggle: "切换深浅模式",
    langToggle: "Switch to English",
    signIn: "登录账号",
    signUp: "免费注册",
    signOut: "退出登录",
    upgrade: "升级专业版",
    unlimited: "无限额度",
    usageQuota: "本月额度",
    monthlyUsage: "当月生成数",
    loading: "加载中...",
    confirm: "确认",
    cancel: "取消",
    delete: "删除",
    close: "关闭",

    navDashboard: "工作台",
    navLibrary: "资产媒体库",
    navTools: "AI 工具矩阵",
    navBilling: "套餐与账单",

    toolsVocabShorts: "词汇短视频",
    toolsVocabDesc: "输入英文单词，秒级生成动效短视频",
    toolsIpExplainer: "IP 手绘图解",
    toolsIpDesc: "输入概念或IP剧本，生成 16:9 白板图解",
    toolsStoryAdventure: "故事探险 (即将上线)",
    toolsStoryDesc: "深度情节剧本与连贯分镜动画",
    toolsVoiceover: "AI 配音工作室 (即将上线)",
    toolsVoiceoverDesc: "超自然多语种旁白与音效合规",

    dashWelcome: "欢迎回来",
    dashSubtitle: "这是您的自动化视频生产工作台。从下方选择工具，开启今天的创作吧。",
    dashQuickCreate: "快速发起生成",
    dashTotalVideos: "累计生成视频",
    dashActivePlan: "当前有效套餐",
    dashRecentVideos: "最近生成视频",
    dashViewAll: "查看完整媒体库",
    dashNoVideos: "暂无生成记录，立即开始您的第一个视频创作吧！",

    genInputWordLabel: "输入词汇或短语",
    genInputWordPlaceholder: "例如: serendipity, resilient, quantum...",
    genInputIpLabel: "输入解说主题或 IP 概念",
    genInputIpPlaceholder: "例如: 什么是量子纠缠？/ Web3 原理解析...",
    genBtnGenerate: "立即生成高清视频",
    genBtnGenerating: "视频生成中，请稍候...",
    genStatusGenerating: "正在全自动生成视频：",
    genCurrentStage: "当前执行阶段：",
    genConsoleTitle: "实时渲染与管线日志",
    genWatchVideo: "即刻播放",
    genDownloadMp4: "下载高清 MP4",
    genOpenInLibrary: "在媒体库中查看",
    genNewVideo: "创建新的视频",
    genQuotaWarning: "本月生成额度已达上限，请升级套餐以解锁更多配额。",

    libTitle: "视频资产媒体库",
    libSubtitle: "集中管理您生成的所有成品视频、下载高清文件或物理销毁跨节点过程资产。",
    libFilterAll: "全部生成内容",
    libSearchPlaceholder: "按单词、主题或任务 ID 搜索...",
    libColWord: "内容主题 / 词汇",
    libColType: "生成管线",
    libColStatus: "状态",
    libColSize: "文件大小",
    libColDate: "创建时间",
    libColActions: "操作",
    libEmpty: "未找到符合条件的视频资产",
    libDeleteConfirmTitle: "彻底删除视频及关联资产？",
    libDeleteConfirmDesc: "您确定要彻底永久删除视频",
    libDeletePurgeNotice: "执行本操作将级联清理以下所有资产：",
    libDeletePurge1: "本地云存储中的成品 MP4 视频",
    libDeletePurge2: "Worker 节点渲染产生的中间分镜与剧本 JSON",
    libDeletePurge3: "Worker 节点动态 Remotion TSX 源码与分段语音",
    libDeletePurge4: "数据库任务索引与所有元数据记录",
    libDeleteCannotUndo: "此操作不可逆，请谨慎确认。",
    libDeletePurging: "正在彻底物理销毁...",
    libDeleteSuccess: "视频及关联过程资产已全部级联物理删除。",
  },
  en: {
    brand: "SaaS AI Omni Studio",
    tagline: "Automated Video & Media Generator",
    themeToggle: "Toggle Theme",
    langToggle: "切换为中文",
    signIn: "Sign In",
    signUp: "Sign Up Free",
    signOut: "Sign Out",
    upgrade: "Upgrade Plan",
    unlimited: "Unlimited",
    usageQuota: "Usage Quota",
    monthlyUsage: "Monthly Usage",
    loading: "Loading...",
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    close: "Close",

    navDashboard: "Dashboard",
    navLibrary: "Library",
    navTools: "AI Tools",
    navBilling: "Billing",

    toolsVocabShorts: "Vocab Shorts",
    toolsVocabDesc: "Convert words into animated TikTok/Reels in seconds",
    toolsIpExplainer: "IP Explainer",
    toolsIpDesc: "Generate 16:9 doodle whiteboard explainer animations",
    toolsStoryAdventure: "Story Adventure (Coming Soon)",
    toolsStoryDesc: "Deep plot scripts and cinematic storyboards",
    toolsVoiceover: "AI Voiceover (Coming Soon)",
    toolsVoiceoverDesc: "Ultra-natural multilingual narration & audio tracks",

    dashWelcome: "Welcome back",
    dashSubtitle: "This is your automated video workstation. Choose an AI tool below to start creating.",
    dashQuickCreate: "Quick Creation",
    dashTotalVideos: "Total Videos",
    dashActivePlan: "Active Plan",
    dashRecentVideos: "Recent Videos",
    dashViewAll: "View Complete Library",
    dashNoVideos: "No videos created yet. Launch your first creation today!",

    genInputWordLabel: "Target Vocabulary Word",
    genInputWordPlaceholder: "e.g., serendipity, resilient, quantum...",
    genInputIpLabel: "Explainer Concept or Subject",
    genInputIpPlaceholder: "e.g., What is Quantum Computing? / Web3 Basics...",
    genBtnGenerate: "Generate HD Video",
    genBtnGenerating: "Generating video, please wait...",
    genStatusGenerating: "Generating automated video for:",
    genCurrentStage: "Current Stage:",
    genConsoleTitle: "Live Pipeline & Render Console",
    genWatchVideo: "Watch Video",
    genDownloadMp4: "Download MP4",
    genOpenInLibrary: "Open in Library",
    genNewVideo: "Create New Video",
    genQuotaWarning: "Monthly generation limit reached. Please upgrade to unlock more quota.",

    libTitle: "Video Asset Library",
    libSubtitle: "Manage your rendered videos, stream HD outputs, or cascade delete all cross-node artifacts.",
    libFilterAll: "All Assets",
    libSearchPlaceholder: "Search by word, topic, or task ID...",
    libColWord: "Subject / Word",
    libColType: "Pipeline",
    libColStatus: "Status",
    libColSize: "File Size",
    libColDate: "Created At",
    libColActions: "Actions",
    libEmpty: "No matching video assets found",
    libDeleteConfirmTitle: "Delete Video & All Artifacts?",
    libDeleteConfirmDesc: "Are you sure you want to permanently delete",
    libDeletePurgeNotice: "This action will permanently purge:",
    libDeletePurge1: "Local MP4 video in cloud storage",
    libDeletePurge2: "Worker intermediate render files & drafts",
    libDeletePurge3: "Worker Remotion TSX code & audio clips",
    libDeletePurge4: "Database task and metadata record",
    libDeleteCannotUndo: "This action cannot be undone.",
    libDeletePurging: "Purging all artifacts...",
    libDeleteSuccess: "Video and all associated files purged successfully.",
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 默认进入页面使用英文 (en)
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("saas_locale") as Locale | null;
      if (saved === "zh" || saved === "en") {
        setLocaleState(saved);
      } else {
        // 首次访问默认设为英文 (en)
        setLocaleState("en");
        localStorage.setItem("saas_locale", "en");
      }
    } catch (_) {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("saas_locale", l);
    } catch (_) {}
  };

  const toggleLanguage = () => {
    const next: Locale = locale === "zh" ? "en" : "zh";
    setLocale(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        toggleLanguage,
        t: translations[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

