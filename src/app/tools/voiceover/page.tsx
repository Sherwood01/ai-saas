"use client";

import Link from "next/link";
import { 
  Mic, 
  ArrowLeft, 
  Volume2
} from "lucide-react";

/**
 * 神经语音与配音合成工作台 (Neural Voiceover Studio - Classic Blue & Slate)
 * 独立音频生成服务，支持高精度音色克隆与多语种情感旁白
 */
export default function VoiceoverPage() {
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
              <Mic className="h-7 w-7 text-blue-600" />
              <span>Neural Voiceover & Audio Studio</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase tracking-wider">
              Preview
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Synthesize studio-grade multi-speaker voiceovers with emotion, micro-pauses and pitch control.
          </p>
        </div>

        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs"
        >
          <Volume2 className="h-4 w-4 text-blue-600" />
          <span>Audio Assets</span>
        </Link>
      </div>

      {/* ── Audio Synthesis Box ── */}
      <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-blue-600" />
              <span>Text-to-Speech Script Input</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Input narration script and select speaker timbre.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Cost: 1 Credit / 500 Words
          </span>
        </div>

        <div className="space-y-5">
          {/* Script Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Narration Script:
            </label>
            <textarea
              rows={4}
              defaultValue="Welcome to today's deep dive. In this episode, we explore the enigmatic nature of human memory and why our brains hold onto specific moments..."
              className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
            />
          </div>

          {/* Voice Models Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Neural Speaker Timbre:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "George (BBC Narrator)", desc: "Warm, authoritative British baritone", lang: "en-GB", active: true },
                { name: "Aria (Dynamic Storyteller)", desc: "Expressive, youthful American female", lang: "en-US", active: false },
                { name: "Marcus (Cinematic Trailer)", desc: "Deep cinematic bass for teasers", lang: "en-US", active: false },
              ].map((voice, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    voice.active
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-xs">{voice.name}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">
                      {voice.lang}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{voice.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Direct neural streaming engine integration
            </span>

            <button
              type="button"
              onClick={() => alert("Voiceover Audio Engine will be plugged in Phase 2!")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-xs shadow-sm transition active:scale-95"
            >
              <span>Generate Audio Voiceover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
