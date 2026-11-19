"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Film, 
  Video, 
  Download, 
  Clock, 
  Calendar, 
  FileVideo, 
  RefreshCw, 
  Play, 
  PlusCircle, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  X,
  Layers,
  Mic,
  Scale,
  Trash2,
  AlertCircle
} from "lucide-react";
import { VideoItem } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

/**
 * 格式化 ISO 日期时间字符串
 */
function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return isoString;
  }
}

export default function LibraryPage() {
  const { t, locale } = useLanguage();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // 视图模式：默认 "list"（表格列表），可选 "grid"（紧凑网格）
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  // 当前分类筛选：all | vocab-shorts | ip-explainer | story-adventure | voiceover
  const [selectedPipeline, setSelectedPipeline] = useState<string>("all");
  // 当前选中的播放视频
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // 删除功能状态
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchLibraryVideos();
  }, []);

  const fetchLibraryVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/videos");
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    } catch (err) {
      console.error("Failed to fetch library videos:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 彻底删除视频资产及其底层算力 Worker 全量过程文件
   */
  const handleDeleteVideo = async (item: VideoItem) => {
    try {
      setDeletingId(item.id);
      setDeleteError(null);

      const res = await fetch(`/api/videos?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete video.");
      }

      // 乐观更新：从当前列表中剔除该视频
      setVideos((prev) => prev.filter((v) => v.id !== item.id));
      if (selectedVideo?.id === item.id) {
        setSelectedVideo(null);
      }
      setVideoToDelete(null);
      setDeleteSuccessMsg(`Video "${item.word}" and all associated files purged successfully.`);
      setTimeout(() => setDeleteSuccessMsg(null), 4000);
    } catch (err: any) {
      setDeleteError(err.message || "An unexpected error occurred during deletion.");
    } finally {
      setDeletingId(null);
    }
  };

  // 综合搜索与服务分类过滤后的视频数据
  const filteredVideos = useMemo(() => {
    let result = videos;

    // 1. 按 AI 服务分类药丸过滤
    if (selectedPipeline !== "all") {
      result = result.filter((v) => {
        const pipeline = v.pipelineType || "vocab-shorts";
        return pipeline === selectedPipeline;
      });
    }

    // 2. 按搜索关键字过滤
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((v) => 
        v.word.toLowerCase().includes(q) || 
        v.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [videos, searchQuery, selectedPipeline]);

  // 各分类数量统计
  const pipelineCounts = useMemo(() => {
    const counts = {
      all: videos.length,
      "vocab-shorts": 0,
      "ip-explainer": 0,
      "story-adventure": 0,
      voiceover: 0,
    };
    for (const v of videos) {
      const p = v.pipelineType || "vocab-shorts";
      if (p in counts) {
        counts[p as keyof typeof counts]++;
      }
    }
    return counts;
  }, [videos]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] dark:text-[#93c5fd] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Studio</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Film className="h-7 w-7 text-[#1e3a8a] dark:text-[#93c5fd]" />
            <span>Video Library</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage, inspect and download all your AI-generated vocabulary vertical videos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchLibraryVideos}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50 shadow-xs"
            title="Refresh Library"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/tools/vocab-shorts"
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-xs transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Video</span>
          </Link>
        </div>
      </div>

      {/* ── Category Filter Pills (政企深海藏青药丸) ── */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 select-none">
        <button
          type="button"
          onClick={() => setSelectedPipeline("all")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition shrink-0 ${
            selectedPipeline === "all"
              ? "bg-[#1e3a8a] dark:bg-[#1e40af] text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{t.libFilterAll}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            selectedPipeline === "all"
              ? "bg-[#172554] text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}>
            {pipelineCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPipeline("vocab-shorts")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition shrink-0 ${
            selectedPipeline === "vocab-shorts"
              ? "bg-[#1e3a8a] dark:bg-[#1e40af] text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <Film className="h-4 w-4" />
          <span>{t.toolsVocabShorts}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            selectedPipeline === "vocab-shorts"
              ? "bg-[#172554] text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}>
            {pipelineCounts["vocab-shorts"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPipeline("ip-explainer")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition shrink-0 ${
            selectedPipeline === "ip-explainer"
              ? "bg-[#1e3a8a] dark:bg-[#1e40af] text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <Scale className="h-4 w-4 text-amber-500" />
          <span>{t.toolsIpExplainer}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            selectedPipeline === "ip-explainer"
              ? "bg-[#172554] text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}>
            {pipelineCounts["ip-explainer"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPipeline("story-adventure")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition shrink-0 ${
            selectedPipeline === "story-adventure"
              ? "bg-[#1e3a8a] dark:bg-[#1e40af] text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Story & Adventure</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            selectedPipeline === "story-adventure"
              ? "bg-[#172554] text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}>
            {pipelineCounts["story-adventure"]}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPipeline("voiceover")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold transition shrink-0 ${
            selectedPipeline === "voiceover"
              ? "bg-[#1e3a8a] dark:bg-[#1e40af] text-white shadow-xs"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400"
          }`}
        >
          <Mic className="h-4 w-4" />
          <span>Voiceover</span>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${
            selectedPipeline === "voiceover"
              ? "bg-[#172554] text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}>
            {pipelineCounts.voiceover}
          </span>
        </button>
      </div>

      {/* ── Delete Success Alert ── */}
      {deleteSuccessMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-xs">
          <span>{deleteSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setDeleteSuccessMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Search & Filter Bar ── */}
      <div className="p-3 mb-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.libSearchPlaceholder}
            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1e3a8a] transition"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-mono">
            {filteredVideos.length} / {videos.length} items
          </span>

          <div className="flex items-center p-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 text-[#1e3a8a] dark:text-[#93c5fd] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="Table List View"
            >
              <LayoutList className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">List</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 text-[#1e3a8a] dark:text-[#93c5fd] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
              title="4:3 Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area: List vs Grid vs Empty ── */}
      {loading ? (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#1e3a8a] dark:text-[#60a5fa]" />
          <p className="text-sm font-medium">Loading your video library...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center bg-white/50 dark:bg-transparent">
          <Video className="h-10 w-10 text-slate-400 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? "No matching videos found" : "No videos in your library yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
            {searchQuery
              ? `No vocabulary videos match "${searchQuery}". Try searching another word.`
              : "Generate your first automated vocabulary video in the Studio!"}
          </p>
          <div className="mt-6">
            <Link
              href="/tools/vocab-shorts"
              className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white px-4 py-2 rounded-md font-semibold text-xs transition shadow-xs active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Go to Studio</span>
            </Link>
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* ════════ 1. Table List View (默认列表模式) ════════ */
        <div className="overflow-hidden rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Vocabulary Name</th>
                  <th className="py-3 px-4">Resolution & Ratio</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Retention / Expiry</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVideos.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition group cursor-pointer"
                    onClick={() => setSelectedVideo(item)}
                  >
                    {/* Vocabulary Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition">
                          <Play className="h-3.5 w-3.5 fill-[#1e3a8a] dark:fill-[#93c5fd] ml-0.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white capitalize text-sm group-hover:text-[#1e3a8a] dark:group-hover:text-[#93c5fd] transition flex items-center gap-2">
                            <span>{item.word}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {item.pipelineType === "ip-explainer"
                                ? "IP Video"
                                : item.pipelineType === "story-adventure"
                                ? "Story"
                                : item.pipelineType === "voiceover"
                                ? "Voiceover"
                                : "Vocab Shorts"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {item.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Resolution & Ratio */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                        <FileVideo className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-[#93c5fd]" />
                        <span>{item.resolution || "1080p (9:16)"}</span>
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {item.fileSize || "Calculating..."}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                    </td>

                    {/* Expiration */}
                    <td className="py-3.5 px-4 text-xs">
                      {item.expiresAt ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="h-3 w-3" />
                          <span>Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Permanent Keep</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(item)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition border border-slate-200 dark:border-slate-700 active:scale-95"
                          title="Watch preview"
                        >
                          <Play className="h-3 w-3 fill-[#1e3a8a] dark:fill-[#93c5fd]" />
                          <span>Play</span>
                        </button>

                        <a
                          href={item.downloadUrl || item.playUrl || item.videoUrl || ""}
                          download
                          title="Download MP4"
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                        >
                          <Download className="h-4 w-4" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setVideoToDelete(item)}
                          title="Delete video and all artifacts"
                          className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-slate-400 border border-slate-200 dark:border-slate-700 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ════════ 2. 4:3 Grid View (紧凑卡片网格模式) ════════ */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredVideos.map((item) => (
            <div
              key={item.id}
              className="rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition group"
            >
              {/* 4:3 紧凑封面预览区 */}
              <div
                onClick={() => setSelectedVideo(item)}
                className="aspect-[4/3] bg-slate-950 relative flex items-center justify-center cursor-pointer group-hover:brightness-105 transition overflow-hidden"
              >
                {/* 居中大播放按钮 */}
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition shadow-md z-10">
                  <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                </div>

                {/* 顶部比例与大小徽章 */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold z-10">
                  <span className="px-2 py-0.5 rounded bg-[#1e3a8a] text-white uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>
                      {item.pipelineType === "ip-explainer" 
                        ? "IP" 
                        : item.pipelineType === "story-adventure" 
                        ? "Story" 
                        : "Vocab"}
                    </span>
                    <span>•</span>
                    <span>{item.resolution || "1080p"}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs font-mono">
                    {item.fileSize || "MP4"}
                  </span>
                </div>

                {/* 底部词汇名称 */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left z-10">
                  <h4 className="text-base font-bold text-white capitalize drop-shadow truncate">
                    {item.word}
                  </h4>
                </div>
              </div>

              {/* 卡片底部元数据与操作 */}
              <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  {item.expiresAt ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">
                      Expires: {new Date(item.expiresAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Permanent Keep
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={item.downloadUrl || item.playUrl || item.videoUrl || ""}
                    download
                    title="Download MP4 Video"
                    className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-[#93c5fd] hover:border-slate-400 transition"
                  >
                    <Download className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setVideoToDelete(item)}
                    title="Delete video and all artifacts"
                    className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-900 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Video Player Modal (自适应点播弹窗) ── */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center p-4">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white capitalize tracking-wide text-base">
                  {selectedVideo.word}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedVideo.resolution || "1080p (9:16)"} • {selectedVideo.fileSize || "MP4"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="w-full aspect-[9/16] bg-black rounded overflow-hidden shadow-inner flex items-center justify-center">
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

            {/* Modal Actions */}
            <div className="w-full mt-4 flex gap-2">
              <a
                href={selectedVideo.downloadUrl || selectedVideo.playUrl || selectedVideo.videoUrl || ""}
                download
                className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white py-2.5 rounded font-semibold text-sm transition shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download MP4 ({selectedVideo.fileSize || "HD"})</span>
              </a>
              <button
                type="button"
                onClick={() => setVideoToDelete(selectedVideo)}
                title="Delete this video"
                className="px-3.5 py-2.5 rounded bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 font-semibold text-sm transition flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cascade Delete Confirmation Modal (级联物理删除二次确认弹窗) ── */}
      {videoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                <Trash2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.libDeleteConfirmTitle}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.libDeleteConfirmDesc}{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    "{videoToDelete.word}"
                  </span>
                  ?
                </p>
              </div>
              <button
                type="button"
                disabled={deletingId === videoToDelete.id}
                onClick={() => {
                  setVideoToDelete(null);
                  setDeleteError(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="font-medium text-slate-700 dark:text-slate-200">
                {t.libDeletePurgeNotice}
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>{t.libDeletePurge1}</li>
                <li>{t.libDeletePurge2}</li>
                <li>{t.libDeletePurge3}</li>
                <li>{t.libDeletePurge4}</li>
              </ul>
              <div className="pt-1 text-[11px] text-red-500 font-medium">
                {t.libDeleteCannotUndo}
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                type="button"
                disabled={deletingId === videoToDelete.id}
                onClick={() => {
                  setVideoToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={deletingId === videoToDelete.id}
                onClick={() => handleDeleteVideo(videoToDelete)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-60"
              >
                {deletingId === videoToDelete.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t.libDeletePurging}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{locale === "zh" ? "确认彻底删除" : "Confirm Delete"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
