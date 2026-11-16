"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Film,
  Wand2,
  FileVideo
} from "lucide-react";

/**
 * 故事与探险长视频生成工作台 (Story & Adventure Video Studio - Classic Blue & Slate)
 * 面向 YouTube 长视频与故事连载的 AI 视频自动渲染节点前端
 */
export default function StoryAdventurePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* ── Breadcrumb & Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Compass className="h-7 w-7 text-blue-600" />
              <span>Story & Adventure Video Studio</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              Beta / Pipeline v2
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate cinematic AI story episodes, historical documentaries, and interactive mystery journeys.
          </p>
        </div>

        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs"
        >
          <FileVideo className="h-4 w-4 text-blue-600" />
          <span>Asset Library</span>
        </Link>
      </div>

      {/* ── Story Prototype Form Box ── */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-blue-600" />
              <span>Create Episodic Story Prompt</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Input a story hook or choose an adventure archetype below.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Cost: 3 Credits / Episode
          </span>
        </div>

        <div className="space-y-5">
          {/* Story Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Story Premise & Setting:
            </label>
            <textarea
              rows={4}
              defaultValue="A solo deep-sea explorer stumbles upon an ancient bioluminescent city buried 10,000 meters underneath the Mariana Trench..."
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Visual Style Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Cinematic Visual Art Style:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Cinematic Sci-Fi", desc: "Photorealistic Unreal 5 vibes", active: true },
                { name: "Dark Fantasy", desc: "Grimdark mythology and ruins", active: false },
                { name: "Cyberpunk Noir", desc: "Neon rain & retro synth aesthetics", active: false },
                { name: "Anime Ghibli", desc: "Whimsical watercolor painterly", active: false },
              ].map((style, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border cursor-pointer transition ${style.active
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300"
                    }`}
                >
                  <p className="font-bold text-xs">{style.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{style.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ratio & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Output Aspect Ratio:
              </label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none">
                <option>16:9 Landscape (YouTube Full Video)</option>
                <option>9:16 Vertical (TikTok/Reels Series)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Pacing & Target Length:
              </label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none">
                <option>Short Episode (60 ~ 90 seconds)</option>
                <option>Standard Story Arc (3 ~ 5 minutes)</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Multi-scene video stitching powered by Adventure Worker
            </span>

            <button
              type="button"
              onClick={() => alert("Story & Adventure Worker RPC is in Sandbox Preparation. Scheduled for rollout in Phase 2!")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-sm transition active:scale-95"
            >
              <span>Render Story Episode (Beta)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
