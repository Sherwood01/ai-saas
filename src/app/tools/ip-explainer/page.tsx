"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Download, 
  Play, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Scale, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  FileVideo, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Terminal,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { VideoItem, UserProfile } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 知识产权手绘解说视频生成工作台 (IP Doodle Explainer Studio)
 * 具备大模型 AI 总导演镜头编排、红蓝裂屏对战、绝密商战卷宗与 1080p 真实手绘贴纸流。
 */
function IpExplainerContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("word") || searchParams.get("term") || "";

  const [word, setWord] = useState(initialWord);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 用户与配额信息
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  // 当前正在运行的任务与日志展开控制
  const [activeTask, setActiveTask] = useState<VideoItem | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(true);

  // 当前选中的播放视频
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  /**
   * 拉取当前登录用户状态与剩余配额
   */
  const fetchUserStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUserProfile(data.user);
          setRemainingQuota(data.remaining);
          setIsUnlimited(data.isUnlimited);
        }
      }
    } catch (err) {
      console.error("[IP Studio] Failed to fetch user status:", err);
    }
  };

  /**
   * 页面初始化：拉取用户状态，并尝试恢复本地记忆的任务状态
   */
  useEffect(() => {
    fetchUserStatus();

    try {
      const savedTaskId = localStorage.getItem("saas_active_task_ip");
      if (savedTaskId) {
        fetch(`/api/status/${savedTaskId}`)
          .then((r) => r.json())
          .then((task) => {
            if (task && !task.error && task.id) {
              setActiveTask(task);
              if (task.status === "running" || task.status === "queued") {
                setLoading(true);
              }
            } else {
              localStorage.removeItem("saas_active_task_ip");
            }
          })
          .catch(() => {
            localStorage.removeItem("saas_active_task_ip");
          });
      }
    } catch (_) {}
  }, []);

  /**
   * 自动轮询活跃任务状态
   */
  useEffect(() => {
    if (!activeTask || activeTask.status === "completed" || activeTask.status === "failed") {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${activeTask.id}`);
        if (res.ok) {
          const updated = (await res.json()) as VideoItem;
          setActiveTask(updated);

          if (updated.status === "completed") {
            setLoading(false);
            fetchUserStatus();
          } else if (updated.status === "failed") {
            setLoading(false);
            setError(updated.error || "Video generation failed on worker engine.");
          }
        }
      } catch (err) {
        console.warn("[IP Studio] Poll error:", err);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [activeTask]);

  /**
   * 发起知识产权视频生成请求 (调用 IP Doodle Worker)
   */
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || loading) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), pipelineType: "ip-explainer" }),
      });

      if (res.status === 402) {
        setLoading(false);
        const data = await res.json();
        window.dispatchEvent(
          new CustomEvent("quota-exceeded", {
            detail: { message: data.message },
          })
        );
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start generation.");
      }

      const data = await res.json();
      if (data.task) {
        setActiveTask(data.task);
        try {
          localStorage.setItem("saas_active_task_ip", data.task.id);
        } catch (_) {}

        if (typeof data.remainingQuota === "number") {
          setRemainingQuota(data.remainingQuota);
        }
        if (data.task.status === "completed") {
          setLoading(false);
          fetchUserStatus();
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* ── Breadcrumb & Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] dark:text-[#93c5fd] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Scale className="h-7 w-7 text-amber-500" />
            <span>IP Doodle Video Studio</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
              AI Director Engine
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate 1080p hand-drawn doodle explainer videos for patents, trademarks, copyright & commercial warfare.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/library"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold transition shadow-xs active:scale-95"
            title="Open Asset Library"
          >
            <FileVideo className="h-4 w-4 text-[#1e3a8a] dark:text-[#93c5fd]" />
            <span>Asset Library</span>
          </Link>

          <button
            type="button"
            onClick={fetchUserStatus}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Refresh balance"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Main Input Generation Box ── */}
      <div className="p-6 sm:p-7 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
        <form onSubmit={handleGenerate} className="flex flex-col gap-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Enter an Intellectual Property Topic or Term:</span>
            <span className="text-xs font-normal text-slate-400 capitalize">(English or 中文)</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. Trade Secret, Patent Troll, 商业秘密, 专利侵权, 正版与山寨..."
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !word.trim()}
              className="flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white disabled:opacity-50 px-6 py-2.5 rounded-md font-semibold text-sm shadow-xs transition active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI Directing...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Generate Explainer</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>AI Director automatically designs classified evidence dossiers, red-blue battle scenes and sticker animation.</span>
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Active Task Status & Progress Card ── */}
        {activeTask && activeTask.status !== "failed" && (
          activeTask.status === "completed" ? (
            <div className="mt-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>{locale === "zh" ? `IP 图解视频就绪: "${activeTask.word}"` : `IP Explainer Video Ready: "${activeTask.word}"`}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                        {locale === "zh" ? "完成" : "Ready"}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {locale === "zh" ? "已全自动编排并渲染为 16:9 白板手绘风格高清视频。" : "Choreographed and rendered in full 1080p hand-drawn doodle style."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(activeTask)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{t.genWatchVideo}</span>
                  </button>
                  {activeTask.downloadUrl && (
                    <a
                      href={activeTask.downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{t.genDownloadMp4}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTask(null);
                      try { localStorage.removeItem("saas_active_task_ip"); } catch (_) {}
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition ml-1"
                    title="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Live Console Output (完成态可折叠查看) */}
              {activeTask.logs && activeTask.logs.length > 0 && (
                <div className="mt-3 rounded-md bg-[#0a0f1d] border border-slate-800 p-3 overflow-hidden text-xs font-mono shadow-inner">
                  <div 
                    className="flex items-center justify-between cursor-pointer select-none pb-1.5 border-b border-slate-800 text-slate-400 hover:text-slate-200"
                    onClick={() => setShowLogs(!showLogs)}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>{t.genConsoleTitle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span>{showLogs ? (locale === "zh" ? "收起日志" : "Collapse") : (locale === "zh" ? "展开日志" : "Expand")}</span>
                      {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>

                  {showLogs && (
                    <div className="mt-2 max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-300">
                      {activeTask.logs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                          <span className="text-slate-500 shrink-0">›</span>
                          <span className={log.includes("[ERR") ? "text-rose-400" : log.includes("[SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                            {log}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 p-4 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-all">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#1e3a8a] dark:text-[#93c5fd]" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.genCurrentStage} {activeTask.stage || "AI Director Choreographing..."}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-[#1e3a8a] dark:text-[#93c5fd]">
                  {activeTask.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-750 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1e3a8a] dark:bg-[#60a5fa] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${activeTask.progress}%` }}
                />
              </div>

              {/* Live Console Output (任务运行中动态输出类似 server.js，彻底移除 Port 5150) */}
              <div className="mt-3 rounded-md bg-[#0a0f1d] border border-slate-800 p-3 overflow-hidden text-xs font-mono shadow-inner">
                <div 
                  className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-800 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowLogs(!showLogs)}
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{t.genConsoleTitle}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>{showLogs ? (locale === "zh" ? "收起日志" : "Collapse") : (locale === "zh" ? "展开日志" : "Expand")}</span>
                    {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>
                </div>

                {showLogs && (
                  <div className="mt-2 max-h-44 overflow-y-auto space-y-1 text-[11px] text-slate-300">
                    {activeTask.logs && activeTask.logs.length > 0 ? (
                      activeTask.logs.map((log, idx) => (
                        <div key={idx} className="leading-relaxed flex items-start gap-1.5">
                          <span className="text-slate-500 shrink-0">›</span>
                          <span className={log.includes("[ERR") ? "text-rose-400" : log.includes("[SUCCESS") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                            {log}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic py-1 flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{locale === "zh" ? "正在启动 IP 视频流水线并捕获实时输出..." : "Initializing IP pipeline and streaming live output..."}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Inline Video Player Modal ── */}
      {selectedVideo && selectedVideo.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  16:9 DOODLE EXPLAINER
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {selectedVideo.word}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="px-5 py-3 flex items-center justify-between bg-slate-950/40 text-xs text-slate-400 border-t border-slate-800">
              <span>Rendered with AI Director Engine & 124+ Authentic IP Hand-Drawn Stickers</span>
              {selectedVideo.downloadUrl && (
                <a
                  href={selectedVideo.downloadUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1e3a8a] text-white hover:bg-[#172554] transition font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MP4</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IpExplainerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading IP Studio...</div>}>
      <IpExplainerContent />
    </Suspense>
  );
}

