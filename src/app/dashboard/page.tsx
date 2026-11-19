"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { 
  Film, 
  Video, 
  Mic, 
  Zap, 
  Crown, 
  ArrowRight, 
  Clock, 
  Play, 
  Download, 
  Layers, 
  Server, 
  Activity, 
  X
} from "lucide-react";
import { VideoItem, UserProfile } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { useAuth } from "@/components/AuthProvider";

/**
 * AI-SaaS 商业化总控仪表盘 (Palantir Prussian Navy & Slate)
 * 聚合全平台 Credits 额度水位、各 AI 算力工具快捷启动矩阵、最新作品点播与计算节点状态
 */
function DashboardOverview() {
  const { t, locale } = useLanguage();
  const { user: userProfile, remainingQuota, isUnlimited, loading: authLoading } = useAuth();

  // 最近作品
  const [recentVideos, setRecentVideos] = useState<VideoItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // 选中的点播视频
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    // 未登录兜底重定向
    if (!authLoading && !userProfile) {
      window.location.replace("/auth/sign-in?redirect=/dashboard");
      return;
    }

    // 获取最近生成的 4 个视频
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentVideos(data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, [authLoading, userProfile]);

  // 计算 Credits 消耗百分比
  const usagePercentage = userProfile && userProfile.monthlyUsageLimit > 0 && !isUnlimited
    ? Math.min(100, Math.round((userProfile.monthlyUsageCount / userProfile.monthlyUsageLimit) * 100))
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* ── 1. Top Welcome & Credits Overview ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold mb-2 border border-slate-200 dark:border-slate-700">
            <Layers className="h-4 w-4 text-[#1e3a8a] dark:text-[#93c5fd]" />
            <span>Omni Studio Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t.dashWelcome}, {userProfile?.displayName || (locale === "zh" ? "创作者" : "Creator")}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {t.dashSubtitle}
          </p>
        </div>

        {/* Credits Status Card */}
        {userProfile && (
          <div className="p-4 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4 min-w-[300px]">
            <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center font-bold">
              {userProfile.planType === "studio" ? (
                <Crown className="h-6 w-6 text-amber-500" />
              ) : (
                <Zap className="h-6 w-6 text-[#1e3a8a] dark:text-[#93c5fd]" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                  {userProfile.planType} {locale === "zh" ? "方案" : "Tier"}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {isUnlimited ? t.unlimited : `${remainingQuota} ${locale === "zh" ? "次剩余额度" : "Credits Left"}`}
                </span>
              </div>

              {!isUnlimited && (
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#1e3a8a] dark:bg-[#3b82f6] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{locale === "zh" ? `当月已使用 ${userProfile.monthlyUsageCount} 次` : `${userProfile.monthlyUsageCount} used this cycle`}</span>
                <Link href="/billing" className="text-[#1e3a8a] dark:text-[#93c5fd] font-semibold hover:underline">
                  {t.upgrade}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. AI Studios Quick Launch Matrix ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-slate-400" />
            <span>{locale === "zh" ? "AI 创作矩阵" : "AI Creation Studios"}</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {locale === "zh" ? "3 大专用算力引擎" : "3 Specialized Engines"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tool 1: Vocabulary Shorts (Active) */}
          <div className="relative group p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center font-bold">
                  <Film className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 uppercase tracking-wider">
                  Active • 1080p
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t.toolsVocabShorts}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {t.toolsVocabDesc}
              </p>
            </div>

            <Link
              href="/tools/vocab-shorts"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white py-2.5 rounded-lg font-semibold text-sm shadow-xs transition active:scale-95"
            >
              <span>{locale === "zh" ? "进入工作台" : "Launch Studio"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Tool 2: IP Doodle Video (Active) */}
          <div className="relative group p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Video className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  {locale === "zh" ? "已激活 • 16:9 高清" : "Active • 16:9 1080p"}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t.toolsIpExplainer}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {t.toolsIpDesc}
              </p>
            </div>

            <Link
              href="/tools/ip-explainer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white py-2.5 rounded-lg font-semibold text-sm shadow-xs transition active:scale-95"
            >
              <span>{locale === "zh" ? "进入工作台" : "Launch Studio"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Tool 3: Neural Voiceover (Preview) */}
          <div className="relative group p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                  <Mic className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-wider">
                  {locale === "zh" ? "即将上线" : "Preview"}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t.toolsVoiceover}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {t.toolsVoiceoverDesc}
              </p>
            </div>

            <Link
              href="/tools/voiceover"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 py-2.5 rounded-lg font-semibold text-sm transition active:scale-95"
            >
              <span>{locale === "zh" ? "查看技术规范" : "View Specs"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. Recent Creations Showcase (最近作品快速点播) ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Film className="h-5 w-5 text-slate-400" />
            <span>{t.dashRecentVideos}</span>
          </h2>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-[#93c5fd] transition"
          >
            <span>{t.dashViewAll}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loadingRecent ? (
          <div className="p-8 text-center text-xs text-slate-400">{t.loading}</div>
        ) : recentVideos.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-center bg-white/50 dark:bg-transparent">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.dashNoVideos}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentVideos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedVideo(item)}
                className="group relative rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs cursor-pointer hover:border-slate-400 dark:hover:border-slate-700 transition flex flex-col justify-between"
              >
                {/* 4:3 封面 */}
                <div className="aspect-[4/3] bg-slate-950 relative flex items-center justify-center overflow-hidden">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition shadow-md z-10">
                    <Play className="h-4 w-4 fill-white ml-0.5" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                    <p className="font-bold text-sm text-white capitalize truncate drop-shadow">
                      {item.word}
                    </p>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono">{item.fileSize || "1080p"}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Compute Engine Infrastructure Status ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Node 1: Vocabulary Shorts Worker */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center font-bold">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Vocab Shorts Worker</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Node: <code className="font-mono">vocabulary-video-pipeline</code> (Port 4980)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ready</span>
          </div>
        </div>

        {/* Node 2: IP Doodle Video Worker */}
        <div className="p-4 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>IP Video Worker</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Node: <code className="font-mono">ip-video-pipeline</code> (Port 4990)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Activity className="h-3.5 w-3.5 text-emerald-500" />
            <span>Ready</span>
          </div>
        </div>
      </div>

      {/* ── Video Player Modal (If Selected) ── */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center p-4">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <h3 className="font-bold text-slate-900 dark:text-white capitalize tracking-wide text-base">
                {selectedVideo.word}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
              {selectedVideo.playUrl || selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.playUrl || selectedVideo.videoUrl || undefined}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-xs text-gray-400">Loading video source...</p>
              )}
            </div>

            <div className="w-full mt-4 flex gap-2">
              <a
                href={selectedVideo.downloadUrl || selectedVideo.playUrl || ""}
                download
                className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white py-2.5 rounded-lg font-semibold text-sm transition shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download MP4</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading dashboard hub...</div>}>
      <DashboardOverview />
    </Suspense>
  );
}
