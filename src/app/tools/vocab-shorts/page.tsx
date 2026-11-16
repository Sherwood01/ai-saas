"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Download, 
  Play, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Film, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  FileVideo, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { VideoItem, UserProfile } from "@/lib/types";

/**
 * 词汇短视频生成专用工作台 (Vocabulary Shorts Studio - Palantir Navy & Slate)
 * 提供从单个单词到 9:16 短视频 (TikTok/Reels/Shorts) 的端到端自动化生成。
 */
function VocabShortsContent() {
  const searchParams = useSearchParams();
  const initialWord = searchParams.get("word") || "";

  const [word, setWord] = useState(initialWord);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 用户与额度信息
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  // 当前正在跑的任务
  const [activeTask, setActiveTask] = useState<VideoItem | null>(null);

  // 选中的播放视频 (原地直接点播刚生成的作品)
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
      console.error("[Vocab Studio] Failed to fetch user status:", err);
    }
  };

  useEffect(() => {
    fetchUserStatus();
  }, []);

  /**
   * 轮询当前运行中任务的最新进度与流式落盘状态
   */
  useEffect(() => {
    if (!activeTask || activeTask.status === "completed" || activeTask.status === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${activeTask.id}`);
        if (res.ok) {
          const updated = await res.json();
          setActiveTask(updated);

          if (updated.status === "completed") {
            clearInterval(interval);
            setLoading(false);
            fetchUserStatus();
          } else if (updated.status === "failed") {
            clearInterval(interval);
            setLoading(false);
            setError(updated.error || "Video pipeline failed.");
          }
        }
      } catch (err) {
        console.error("[Vocab Studio] Status polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTask]);

  /**
   * 发起单词视频生成请求
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
        body: JSON.stringify({ word: word.trim(), pipelineType: "vocab-shorts" }),
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
            <Film className="h-7 w-7 text-[#1e3a8a] dark:text-[#93c5fd]" />
            <span>Vocabulary Shorts Studio</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate 1080p vertical shorts with LLM pedagogy scripts, neural TTS and synchronized Remotion animations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* 直达独立资产库 */}
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
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Enter an English Word:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. serendipity, ephemeral, petrichor..."
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Generate Video</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>💡 Tip: Try uncommon SAT/GRE vocabulary or idioms for maximum viewer retention.</span>
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
            /* 任务完成态卡片 */
            <div className="mt-6 p-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 capitalize text-base flex items-center gap-2">
                      <span>Video Ready: &ldquo;{activeTask.word}&rdquo;</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 uppercase">
                        Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Rendered & synced into local SaaS storage.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 快捷操作区 */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-emerald-500/15">
                <button
                  type="button"
                  onClick={() => setSelectedVideo(activeTask)}
                  className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded font-semibold text-xs transition shadow-xs active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Watch Video</span>
                </button>

                <a
                  href={activeTask.downloadUrl || activeTask.playUrl || activeTask.videoUrl || "#"}
                  download
                  className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded font-semibold text-xs transition shadow-xs active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download MP4</span>
                </a>

                <Link
                  href="/library"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline ml-auto"
                >
                  <span>Open in Library</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* 任务进行中卡片 */
            <div className="mt-6 p-4 rounded-md bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a8a] dark:bg-[#3b82f6] animate-pulse" />
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 capitalize">
                    Generating video for: &ldquo;{activeTask.word}&rdquo;
                  </span>
                </div>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">
                  {activeTask.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#1e3a8a] dark:bg-[#3b82f6] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${activeTask.progress}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Current stage: <span className="text-slate-700 dark:text-slate-300 font-medium">{activeTask.stage || "Rendering composition..."}</span>
              </p>
            </div>
          )
        )}
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

            <div className="w-full aspect-[9/16] bg-black rounded-md overflow-hidden shadow-inner flex items-center justify-center">
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
                className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white py-2.5 rounded-md font-semibold text-sm transition shadow-xs"
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

export default function VocabShortsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading studio...</div>}>
      <VocabShortsContent />
    </Suspense>
  );
}
